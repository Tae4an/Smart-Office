import cv2
import numpy as np
from typing import Optional, List, Tuple
from .base import BaseRedisHandler
from app.core.logging.logger import logger
import pdf2image
from PIL import Image
import io
from PyPDF2 import PdfWriter, PdfReader
import hashlib
import asyncio
import gc

class RedisCacheHandler(BaseRedisHandler):
    """
    Redis를 사용한 파일 캐시 처리 클래스
    
    이미지 및 PDF 파일의 임시 저장, 변환, 병합 기능을 제공하며,
    분산 환경에서의 동시성 제어를 위한 분산 락 기능을 포함
    
    Attributes:
        default_ttl (int): 기본 캐시 유효 시간 (초)
        _lock_ttl (int): 분산 락 타임아웃 시간 (초)
        
    Features:
        - 파일 데이터 캐싱 (바이너리 데이터 저장/조회)
        - 이미지 형식 변환 (bytes <-> OpenCV)
        - PDF 처리 (PDF -> 이미지, 이미지 -> PDF)
        - 분산 락 기반 동시성 제어
        - 메모리 최적화 (청크 단위 처리)
        
    Note:
        PDF 처리 시 메모리 사용량 최적화를 위해 청크 단위로 처리
        모든 캐시 키는 MD5 해시를 사용하여 충돌을 방지
    """
    
    def __init__(self):
        """
        Redis 캐시 핸들러 초기화

        Properties:
            default_ttl (int): 기본 캐시 유효 기간 (초)
            _lock_ttl (int): 분산 락 유효 기간 (초)
        """
        super().__init__()
        self.default_ttl = 300  # 5분
        self._lock_ttl = 30

    def _generate_key(self, key: str) -> str:
        """캐시 키 생성 (충돌 방지)"""
        return f"file:{hashlib.md5(key.encode()).hexdigest()}"

    def _get_lock_key(self, key: str) -> str:
        """락 키 생성"""
        return f"lock:{self._generate_key(key)}"

    async def acquire_lock(self, key: str, retry: int = 3) -> bool:
        """분산 락 획득"""
        lock_key = self._get_lock_key(key)
        for _ in range(retry):
            if self.redis_client.set(lock_key, '1', nx=True, ex=self._lock_ttl):
                return True
            await asyncio.sleep(0.1)
        return False

    async def release_lock(self, key: str):
        """분산 락 해제"""
        self.redis_client.delete(self._get_lock_key(key))

    def save_file(self, key: str, file_data: bytes, ttl: int = None) -> bool:
        """
        파일 데이터를 Redis에 저장
        
        Args:
            key: 파일 식별자 (예: "image:123.jpg")
            file_data: 파일 바이너리 데이터
            ttl: 캐시 유지 시간 (초)
        """
        try:
            cache_key = self._generate_key(key)
            self.redis_client.setex(
                name=cache_key,
                time=ttl or self.default_ttl,
                value=file_data
            )
            return True
        except Exception as e:
            logger.error(f"Redis 파일 저장 실패 - key: {key}, error: {str(e)}")
            return False

    def get_file(self, key: str) -> Optional[bytes]:
        """저장된 파일 데이터 조회"""
        try:
            data = self.redis_client.get(f"file:{key}")
            if data:
                return data  # 바이너리 데이터 그대로 반환
            logger.info(f"Redis 캐시 미스 - key: {key}")
            return None
        except Exception as e:
            logger.error(f"Redis 파일 조회 실패 - key: {key}, error: {str(e)}")
            return None

    def delete_file(self, key: str) -> bool:
        """파일 캐시 삭제"""
        return bool(self.redis_client.delete(f"file:{key}"))

    def bytes_to_cv2(self, img_bytes: bytes) -> np.ndarray:
        """바이트 데이터를 OpenCV 이미지로 변환"""
        nparr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    def cv2_to_bytes(self, img: np.ndarray, ext: str = '.jpg') -> bytes:
        """
        OpenCV 이미지를 바이트 데이터로 변환
        
        Args:
            img: OpenCV 이미지
            ext: 저장할 이미지 확장자 (.jpg, .png)
        """
        if ext.lower() in ['.png']:
            return cv2.imencode(ext, img)[1].tobytes()
        # 기본값은 jpg로 저장
        return cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 95])[1].tobytes()

    def convert_pdf_to_images(self, pdf_bytes: bytes) -> Tuple[List[bytes], int]:
        """
        PDF 파일을 개별 이미지로 변환합니다.
        
        Args:
            pdf_bytes (bytes): PDF 파일 바이너리 데이터
            
        Returns:
            Tuple[List[bytes], int]: (이미지 바이너리 리스트, 총 페이지 수)
            
        Note:
            변환된 이미지는 JPEG 형식으로 저장됩니다.
        """
        try:
            images = pdf2image.convert_from_bytes(pdf_bytes)
            return ([
                cv2.imencode('.jpg', cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR))[1].tobytes()
                for img in images
            ], len(images))
        except Exception as e:
            logger.error(f"PDF 변환 실패: {str(e)}")
            return [], 0

    def merge_images_to_pdf(self, image_list: List[bytes]) -> Optional[bytes]:
        """
        여러 이미지를 하나의 PDF 파일로 병합합니다.
        
        Args:
            image_list (List[bytes]): 병합할 이미지 바이너리 데이터 리스트
            
        Returns:
            Optional[bytes]: 병합된 PDF 파일 바이너리 데이터
            
        Note:
            모든 이미지는 RGB 형식으로 변환됩니다.
        """
        try:
            if not image_list:
                return None

            # 메모리 사용량 최적화를 위한 청크 처리
            pdf_writer = PdfWriter()
            chunk_size = 10  # 한 번에 처리할 이미지 수
            
            for i in range(0, len(image_list), chunk_size):
                chunk = image_list[i:i + chunk_size]
                for img_bytes in chunk:
                    # 이미지 바이트를 PIL Image로 변환
                    img = Image.open(io.BytesIO(img_bytes))
                    
                    # RGB로 변환 (RGBA 이미지 처리를 위해)
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    # 이미지를 임시 PDF로 변환
                    img_buf = io.BytesIO()
                    img.save(img_buf, format='PDF')
                    img_buf.seek(0)
                    
                    # PDF 페이지 추가
                    pdf_reader = PdfReader(img_buf)
                    pdf_writer.add_page(pdf_reader.pages[0])
                    gc.collect()  # 명시적 메모리 정리

            # 최종 PDF를 바이트로 변환
            output_buf = io.BytesIO()
            pdf_writer.write(output_buf)
            output_buf.seek(0)
            return output_buf.getvalue()

        except Exception as e:
            logger.error(f"PDF 병합 실패: {str(e)}")
            return None