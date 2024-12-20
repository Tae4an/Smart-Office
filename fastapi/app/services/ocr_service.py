import os
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Dict, Union
import cv2
import numpy as np
from app.core.config import settings
from app.core.logging.logger import logger
from app.utils.image.gcs_handler import GCSHandler
from app.utils.image.processing import ImageProcessor
from app.core.handlers.cache import RedisCacheHandler
from app.exceptions import (
    OCRError, FileProcessingError, FileConversionError,
    APIError, InvalidFormatError, TimeoutError
)

class OCRService:
    """
    OCR (Optical Character Recognition) 서비스
    
    문서 이미지에서 텍스트를 추출하고 전처리하는 서비스입니다.
    
    주요 기능:
    - 이미지 전처리 (외곽선 감지, 투시 변환)
    - OCR 텍스트 추출
    - PDF 멀티페이지 처리
    - 이미지 포맷 변환
    
    속성:
        gcs_handler (GCSHandler): GCS 저장소 핸들러
        image_processor (ImageProcessor): 이미지 전처리 핸들러
        redis_handler (RedisCacheHandler): Redis 캐시 핸들러
        api_key (str): OCR API 인증키
        ocr_url (str): OCR API 엔드포인트 URL
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

    async def process_document(self, filename: str) -> Dict[str, Union[str, list, int]]:
        """
        문서를 OCR 처리합니다.
        
        처리 단계:
        1. GCS에서 파일 다운로드
        2. 파일 형식 검증
        3. 이미지 전처리 (문서 감지, 투시 변환)
        4. OCR API 호출
        5. 결과 병합 및 정리
        
        Args:
            filename (str): 처리할 파일명
            
        Returns:
            Dict: OCR 처리 결과
                {
                    "status": str,
                    "data": list[dict], 
                    "total_pages": int,
                    "processed_file": str
                }
                
        Raises:
            OCRError: OCR 처리 실패시
            FileProcessingError: 파일 처리 실패시
            InvalidFormatError: 지원하지 않는 파일 형식
        """
        if self._is_shutting_down:
            raise OCRError("서비스가 종료 중입니다")

        async with self._semaphore:
            try:
                # GCS에서 파일 다운로드
                gcs_result = await self.gcs_handler.download_as_bytes(filename)
                
                # GCS 결과 처리
                if isinstance(gcs_result, tuple):
                    success, file_bytes = gcs_result
                    if not success or not file_bytes:
                        raise FileProcessingError(f"파일 다운로드 실패: {filename}")
                else:
                    file_bytes = gcs_result

                if not isinstance(file_bytes, bytes):
                    logger.error(f"잘못된 파일 데이터 타입: {type(file_bytes)}")
                    raise Exception("잘못된 파일 데이터 형식")

                # 확장자 확인
                ext = os.path.splitext(filename)[1].lower()
                if ext not in self.SUPPORTED_IMAGE_FORMATS:
                    raise InvalidFormatError(ext)

                if ext == '.pdf':  # PDF 처리
                    return await self._process_pdf(file_bytes, filename)
                else:  # 일반 이미지 처리
                    return await self._process_image(file_bytes, filename, ext)

            except TimeoutError as e:
                raise TimeoutError("OCR", 30)
            except Exception as e:
                logger.error(f"OCR 처리 중 오류 발생: {str(e)}")
                raise

    async def _process_pdf(self, file_bytes: bytes, filename: str):
        """PDF 파일 처리"""
        # PDF 파일 데이터 타입 검증
        if not isinstance(file_bytes, bytes):
            logger.error(f"잘못된 PDF 데이터 타입: {type(file_bytes)}")
            raise Exception("잘못된 PDF 데이터 형식")

        logger.debug(f"PDF 변환 시작 - 데이터 크기: {len(file_bytes)} bytes")
        
        # PDF 변환은 동기 메서드 사용
        image_list, total_pages = self.redis_handler.convert_pdf_to_images(file_bytes)
        if not image_list:
            raise Exception("PDF 변환 실패")
        
        # 각 페이지 처리
        ocr_results = []
        processed_images = []
        
        for page_num, image_bytes in enumerate(image_list, 1):
            # 이미지 전처리 - 비동기로 처리
            processed_image = await self._process_single_image(image_bytes, page_num)
            if processed_image:
                processed_images.append(processed_image)
                
                # OCR 처리
                ocr_result = await self._perform_ocr(processed_image, f"page_{page_num}.jpg")
                if ocr_result:
                    ocr_results.append(ocr_result)

        # PDF 병합은 동기 메서드 사용
        processed_pdf = self.redis_handler.merge_images_to_pdf(processed_images)
        if processed_pdf:
            upload_success = await asyncio.to_thread(
                self.gcs_handler.upload_bytes,
                processed_pdf,
                filename
            )
            
            if not upload_success:
                logger.error(f"처리된 PDF 업로드 실패: {filename}")

        return {
            "status": "success",
            "total_pages": total_pages,
            "data": ocr_results,
            "processed_file": filename
        }

    async def _process_image(self, file_bytes: bytes, filename: str, ext: str):
        """일반 이미지 파일 처리"""
        # 이미지 전처리
        image = await asyncio.to_thread(
            cv2.imdecode, 
            np.frombuffer(file_bytes, np.uint8), 
            cv2.IMREAD_COLOR
        )
        processed_image = await asyncio.to_thread(
            self.image_processor.preprocess_document, 
            image
        )

        # 전처리된 이미지를 바이트로 변환
        success, processed_bytes = await asyncio.to_thread(
            cv2.imencode, 
            ext, 
            processed_image
        )
        if not success:
            raise Exception("이미지 인코딩 실패")
            
        processed_bytes = processed_bytes.tobytes()

        # GCS 업로드
        upload_success = await asyncio.to_thread(
            self.gcs_handler.upload_bytes,
            processed_bytes,
            filename
        )
        
        if not upload_success:
            logger.error(f"처리된 이미지 업로드 실패: {filename}")

        # OCR API 호출
        ocr_result = await self._perform_ocr(
            processed_bytes,
            filename,
            self.MIME_TYPES.get(ext, 'image/jpeg')
        )

        return {
            "status": "success",
            "data": ocr_result,
            "processed_file": filename if upload_success else None
        }

    async def _process_single_image(self, image_bytes: bytes, page_num: int) -> Optional[bytes]:
        """단일 이미지 전처리"""
        try:
            image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                logger.error(f"이미지 디코딩 실패 - 페이지 {page_num}")
                return None
                
            processed_image = await asyncio.to_thread(
                self.image_processor.preprocess_document,
                image
            )
            
            success, processed_bytes = cv2.imencode('.jpg', processed_image)
            if not success:
                logger.error(f"이미지 인코딩 실패 - 페이지 {page_num}")
                return None
                
            return processed_bytes.tobytes()
            
        except Exception as e:
            logger.error(f"이미지 처리 실패 - 페이지 {page_num}: {str(e)}")
            return None

    async def _perform_ocr(self, image_bytes: bytes, filename: str) -> Optional[dict]:
        """OCR API 호출"""
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with aiohttp.ClientSession() as session:
                data = aiohttp.FormData()
                data.add_field('document', image_bytes,
                            filename=filename,
                            content_type='image/jpeg')
                
                async with session.post(self.ocr_url, headers=headers, data=data) as response:
                    if response.status != 200:
                        raise APIError("OCR", response.status, await response.text())
                    return await response.json()
                    
        except Exception as e:
            logger.error(f"OCR API 호출 실패: {str(e)}")
            raise APIError("OCR", 500, str(e))

    async def _cleanup_resources(self, filename: str):
        """리소스 정리"""
        try:
            await asyncio.to_thread(
                self.redis_handler.delete_file, filename)
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
