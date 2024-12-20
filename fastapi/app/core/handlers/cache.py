import asyncio
from typing import Optional, List, Tuple
import cv2
import numpy as np
from .base import BaseRedisHandler
from app.core.logging.logger import logger
from app.utils.image.pdf_handler import PDFHandler

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
        self.default_ttl = 300
        self._lock_ttl = 30
        self.pdf_handler = PDFHandler()

    def _generate_key(self, key: str) -> str:
        """캐시 키 생성"""
        return key

    def _get_lock_key(self, key: str) -> str:
        """락 키 생성"""
        return f"lock:{self._generate_key(key)}"

    async def acquire_lock(self, key: str, retry: int = 3) -> bool:
        """분산 락 획득"""
        lock_key = self._get_lock_key(key)
        for _ in range(retry):
            acquired = await asyncio.to_thread(
                self.redis_client.set,
                lock_key,
                '1',
                nx=True,
                ex=self._lock_ttl
            )
            if acquired:
                return True
            await asyncio.sleep(0.1)
        return False

    async def release_lock(self, key: str):
        """분산 락 해제"""
        await asyncio.to_thread(
            self.redis_client.delete,
            self._get_lock_key(key)
        )

    def save_file(self, key: str, file_data: bytes, ttl: int = None) -> bool:
        """
        파일 데이터를 Redis에 저장
        
        Args:
            key: 파일 식별자 (예: "image:123.jpg")
            file_data: 파일 바이너리 데이터
            ttl: 캐시 유지 시간 (초)
        """
        try:
            # 키 변환 없이 직접 사용
            self.redis_client.setex(
                name=key,
                time=ttl or self.default_ttl,
                value=file_data
            )
            logger.info(f"Redis 저장 성공 - key: {key}")
            return True
        except Exception as e:
            logger.error(f"Redis 파일 저장 실패 - key: {key}, error: {str(e)}")
            return False

    def get_file_sync(self, key: str) -> Optional[bytes]:
        """동기 방식의 파일 조회"""
        try:
            if not self.redis_client:
                logger.error("Redis 클라이언트가 초기화되지 않음")
                return None

            data = self.redis_client.get(key)
            
            if not data:
                logger.info(f"Redis 캐시 미스 - key: {key}")
                return None
            
            if isinstance(data, str):
                data = data.encode('latin1')
                
            return data
            
        except Exception as e:
            logger.error(f"Redis 파일 조회 중 오류 발생: {str(e)}")
            return None

    async def get_file(self, key: str) -> Optional[bytes]:
        """비동기 방식의 파일 조회"""
        try:
            if not self.redis_client:
                logger.error("Redis 클라이언트가 초기화되지 않음")
                return None
                
            data = await asyncio.to_thread(self.redis_client.get, key)
            
            if not data:
                logger.info(f"Redis 캐시 미스 - key: {key}")
                return None
            
            if isinstance(data, str):
                data = data.encode('latin1')
                
            logger.info(f"Redis 캐시 히트 - key: {key}, size: {len(data)} bytes")
            return data
            
        except Exception as e:
            logger.error(f"Redis 파일 조회 중 오류 발생: {str(e)}")
            return None

    def delete_file_sync(self, key: str) -> bool:
        """동기 방식의 파일 삭제"""
        try:
            result = self.redis_client.delete(key)
            return bool(result)
        except Exception as e:
            logger.error(f"Redis 삭제 실패: {str(e)}")
            return False

    async def delete_file(self, key: str) -> bool:
        """비동기 방식의 파일 삭제"""
        try:
            result = await asyncio.to_thread(self.redis_client.delete, key)
            return bool(result)
        except Exception as e:
            logger.error(f"Redis 삭제 실패: {str(e)}")
            return False

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
        """PDF -> 이미지 변환 (PDFHandler로 위임)"""
        return self.pdf_handler.convert_to_images(pdf_bytes)

    def merge_images_to_pdf(self, image_list: List[bytes]) -> Optional[bytes]:
        """이미지 -> PDF 병합 (PDFHandler로 위임)"""
        return self.pdf_handler.merge_images(image_list)