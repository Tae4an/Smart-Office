import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
from app.core.config import settings
from app.utils.image.gcs_handler import GCSHandler
from app.utils.image.processing import ImageProcessor
import cv2
import os
from app.core.logging.logger import logger
from app.core.handlers.cache import RedisCacheHandler
import numpy as np

class OCRService:
    """
    OCR (Optical Character Recognition) 서비스

    문서 이미지의 텍스트 추출을 위한 OCR 처리를 수행
    이미지 전처리, 문서 감지, OCR API 호출 등을 처리

    Attributes:
        gcs_handler (GCSHandler): Google Cloud Storage 작업 처리
        image_processor (ImageProcessor): 이미지 전처리 작업 처리
        redis_handler (RedisCacheHandler): Redis 캐시 및 락 처리
        api_key (str): Upstage OCR API 키
        ocr_url (str): OCR API 엔드포인트
        MIME_TYPES (dict): 파일 확장자별 MIME 타입
        SUPPORTED_IMAGE_FORMATS (list): 지원하는 이미지 형식 목록

    Features:
        - 다양한 이미지 형식 지원 (JPG, PNG, PDF)
        - 문서 이미지 전처리 (외곽선 감지, 투시 변환)
        - PDF 전체 페이지 OCR 처리
        - 동시성 제어 (세마포어, 분산 락)
        - 비동기 처리
        - 자동 리소스 정리

    Note:
        PDF 처리 시 모든 페이지를 개별적으로 처리한 후 다시 병합합니다.
        서비스 종료 시 안전한 리소스 정리를 보장합니다.
    """
    
    MIME_TYPES = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.pdf': 'application/pdf'
    }
    
    SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.pdf']

    def __init__(self):
        self.gcs_handler = GCSHandler()
        self.image_processor = ImageProcessor()
        self.redis_handler = RedisCacheHandler()
        self.api_key = settings.UPSTAGE_API_KEY
        self.ocr_url = "https://api.upstage.ai/v1/document-ai/ocr"
        self._executor = ThreadPoolExecutor(max_workers=3)  # I/O 작업을 위한 스레드 풀
        self._semaphore = asyncio.Semaphore(5)  # 동시 요청 제한
        self._cleanup_lock = asyncio.Lock()
        self._is_shutting_down = False

    async def process_document(self, filename: str):
        """
        ## 문서 이미지에 대한 OCR 처리를 수행합니다.
        
        ### 처리 과정:
        1. GCS에서 이미지 파일 다운로드
        2. 이미지 전처리 수행
        3. 전처리된 이미지 GCS 업로드
        4. OCR API 호출 및 결과 반환
        
            Args:
                filename (str): 처리할 이미지 파일명
                
            Returns:
                dict: OCR 처리 결과
                    {
                        "status": "success",
                        "data": {API 응답 데이터}
                    }
                    
            Raises:
                Exception: 파일 다운로드/업로드 실패, 이미지 처리 실패, API 호출 실패 시
        """
        if self._is_shutting_down:
            raise Exception("서비스가 종료 중입니다")

        async with self._semaphore:  # 동시 처리 제한
            try:
                # 파일에 대한 분산 락 획득
                if not await self.redis_handler.acquire_lock(filename):
                    raise Exception("다른 프로세스에서 처리 중입니다")

                try:
                    # 원본 파일명 유지하면서 확장자 확인
                    ext = os.path.splitext(filename)[1].lower()
                    if ext not in self.SUPPORTED_IMAGE_FORMATS:
                        raise Exception(f"지원하지 않는 파일 형식입니다: {ext}")

                    # GCS에서 이미지 데이터 가져오기 (GCSHandler에서 인코딩 처리)
                    success, file_bytes = await asyncio.get_event_loop().run_in_executor(
                        self._executor, self.gcs_handler.download_as_bytes, filename)
                    
                    if not success or not file_bytes:
                        raise Exception("파일 다운로드 실패")

                    # PDF 처리
                    if ext == '.pdf':
                        image_list, total_pages = await asyncio.get_event_loop().run_in_executor(
                            self._executor, self.redis_handler.convert_pdf_to_images, file_bytes)
                        if not image_list:
                            raise Exception("PDF 변환 실패")
                        
                        # 모든 페이지 처리
                        processed_images = []
                        ocr_results = []
                        
                        for page_num, image_bytes in enumerate(image_list, 1):
                            # 이미지 전처리
                            image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
                            processed_image = await asyncio.get_event_loop().run_in_executor(
                                self._executor, self.image_processor.preprocess_document, image)
                            
                            # 전처리된 이미지 저장
                            processed_bytes = cv2.imencode('.jpg', processed_image)[1].tobytes()
                            processed_images.append(processed_bytes)
                            
                            # OCR 처리
                            headers = {"Authorization": f"Bearer {self.api_key}"}
                            async with aiohttp.ClientSession() as session:
                                data = aiohttp.FormData()
                                data.add_field('document', processed_bytes,
                                            filename=f"page_{page_num}.jpg",
                                            content_type='image/jpeg')
                                
                                async with session.post(self.ocr_url, headers=headers, data=data) as response:
                                    if response.status != 200:
                                        raise Exception(f"OCR API 오류: {await response.text()}")
                                    ocr_results.append(await response.json())
                        
                        # 처리된 이미지들을 다시 PDF로 병합
                        processed_pdf = await asyncio.get_event_loop().run_in_executor(
                            self._executor, self.redis_handler.merge_images_to_pdf, processed_images)
                        
                        if not processed_pdf:
                            raise Exception("PDF 병합 실패")
                        
                        # 처리된 PDF를 GCS에 업로드 (원본 파일명 유지)
                        upload_success = await asyncio.get_event_loop().run_in_executor(
                            self._executor, self.gcs_handler.upload_bytes, processed_pdf, filename
                        )
                        
                        if not upload_success:
                            logger.error(f"처리된 PDF 업로드 실패: {filename}")
                        
                        return {
                            "status": "success",
                            "total_pages": total_pages,
                            "data": ocr_results,
                            "processed_file": filename if upload_success else None
                        }
                    
                    else:
                        image_bytes = file_bytes

                        # 이미지 전처리
                        image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
                        processed_image = await asyncio.get_event_loop().run_in_executor(
                            self._executor, self.image_processor.preprocess_document, image)

                        # 전처리된 이미지를 바이트로 변환
                        processed_bytes = cv2.imencode(ext, processed_image)[1].tobytes()
                        
                        # 전처리된 이미지를 GCS에 업로드
                        upload_success = await asyncio.get_event_loop().run_in_executor(
                            self._executor, self.gcs_handler.upload_bytes, processed_bytes, filename
                        )
                        
                        if not upload_success:
                            logger.error(f"처리된 이미지 업로드 실패: {filename}")

                        # OCR API 호출시 원본 확장자 유지
                        headers = {"Authorization": f"Bearer {self.api_key}"}
                        content_type = self.MIME_TYPES.get(ext, 'image/jpeg')
                        
                        async with aiohttp.ClientSession() as session:
                            data = aiohttp.FormData()
                            data.add_field('document', processed_bytes, 
                                        filename=filename,
                                        content_type=content_type)
                            
                            async with session.post(self.ocr_url, headers=headers, data=data) as response:
                                if response.status != 200:
                                    raise Exception(f"OCR API 오류: {await response.text()}")
                                result = await response.json()

                        # Redis에서 이미지 정리
                        await asyncio.get_event_loop().run_in_executor(
                            self._executor, self.redis_handler.delete_file, filename)

                        return {
                            "status": "success",
                            "data": result,
                            "processed_file": filename if upload_success else None
                        }

                finally:
                    # 락 해제 보장
                    await self.redis_handler.release_lock(filename)

            except Exception as e:
                logger.error(f"OCR 처리 중 오류 발생: {str(e)}")
                # 실패 시 리소스 정리
                await self._cleanup_resources(filename)
                raise

    async def _cleanup_resources(self, filename: str):
        """리소스 정리"""
        try:
            await asyncio.get_event_loop().run_in_executor(
                self._executor, self.redis_handler.delete_file, filename)
        except Exception as e:
            logger.error(f"리소스 정리 실패: {str(e)}")

    async def cleanup(self):
        """
        ## 서비스 종료 시 리소스를 정리합니다.
        
        - ThreadPoolExecutor 종료
        """
        async with self._cleanup_lock:
            self._is_shutting_down = True
            try:
                # 진행 중인 작업 완료 대기
                await asyncio.sleep(1)
                self._executor.shutdown(wait=True)
            except Exception as e:
                logger.error(f"종료 처리 실패: {str(e)}")
