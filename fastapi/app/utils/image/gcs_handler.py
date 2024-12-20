import asyncio
from google.cloud import storage
from typing import List, Optional, Tuple
from app.core.config import settings
from app.core.logging.logger import logger
from app.core.handlers.cache import RedisCacheHandler

class GCSHandler:
    """
    Google Cloud Storage 작업을 처리하는 핸들러 클래스
    
    파일 업로드/다운로드, 캐시 처리, URL 인코딩을 담당합니다.
    
    Attributes:
        client (storage.Client): GCS 클라이언트
        bucket (storage.Bucket): GCS 버킷
        gcs_download_path (str): 다운로드 기본 경로
        upload_path (str): 업로드 기본 경로
        cache_handler (RedisCacheHandler): Redis 캐시 핸들러
    """
    def __init__(self):
        """
        GCSHandler 초기화
        
        Google Cloud Storage 인증 정보를 설정하고 버킷에 연결
        """
        self.client = storage.Client.from_service_account_json(settings.GOOGLE_CREDENTIALS_PATH)
        self.bucket = self.client.bucket(settings.GCS_BUCKET_NAME)
        self.gcs_download_path = settings.GCS_DOWNLOAD_PATH
        self.upload_path = settings.GCS_UPLOAD_PATH
        self.cache_handler = RedisCacheHandler()

    async def download_as_bytes(self, filename: str) -> Tuple[bool, Optional[bytes]]:
        """
        GCS의 파일을 바이트 데이터로 비동기 다운로드
        
        Args:
            filename (str): 다운로드할 파일명
            
        Returns:
            Tuple[bool, Optional[bytes]]: (성공 여부, 파일 데이터)
                - 성공: (True, bytes)
                - 실패: (False, None)
        """
        try:
            if not filename:
                logger.error("파일명이 비어있음")
                return False, None

            gcs_source_path = self.gcs_download_path + filename
            logger.debug(f"GCS 다운로드 시도: {gcs_source_path}")
            
            blob = self.bucket.blob(gcs_source_path)
            if not blob.exists():
                logger.error(f"파일이 존재하지 않음: {gcs_source_path}")
                return False, None
                
            data = await asyncio.to_thread(blob.download_as_bytes)
            if not data:
                return False, None
                
            return True, data
            
        except Exception as e:
            logger.error(f"GCS 다운로드 실패: {str(e)}")
            return False, None

    def upload_bytes(self, file_bytes: bytes, destination_filename: str) -> bool:
        """
        바이트 데이터를 GCS에 업로드합니다.
        
        Args:
            file_bytes (bytes): 업로드할 파일 데이터
            destination_filename (str): 저장될 파일명
            
        Returns:
            bool: 업로드 성공 여부
        """
        try:
            destination_path = self.upload_path + destination_filename
            blob = self.bucket.blob(destination_path)
            blob.upload_from_string(file_bytes)
            return True
        except Exception as e:
            logger.error(f"바이트 데이터 업로드 실패: {str(e)}")
            return False

    def delete_file(self, filename: str, is_upload_path: bool = False) -> bool:
        """
        GCS의 파일을 삭제
        
        Args:
            filename (str): 삭제할 파일명
            is_upload_path (bool, optional): 업로드 경로 사용 여부. Defaults to False.
            
        Returns:
            bool: 삭제 성공 시 True, 실패 시 False
        """
        try:
            base_path = self.upload_path if is_upload_path else self.gcs_download_path
            file_path = base_path + filename
            blob = self.bucket.blob(file_path)
            blob.delete()
            
            # 캐시에서도 삭제
            self.cache_handler.delete_file(filename)
            
            return True
        except Exception as e:
            logger.error(f"삭제 실패: {str(e)}")
            return False

    def list_files(self, use_upload_path: bool = False) -> List[str]:
        """
        GCS 버킷의 파일 목록을 조회
        
        Args:
            use_upload_path (bool, optional): 업로드 경로 사용 여부. Defaults to False.
            
        Returns:
            List[str]: 파일명 목록
        """
        try:
            base_path = self.upload_path if use_upload_path else self.gcs_download_path
            blobs = self.bucket.list_blobs(prefix=base_path)
            return [
                blob.name.replace(base_path, '')
                for blob in blobs 
                if blob.name.startswith(base_path) and not blob.name.endswith('/')
            ]
        except Exception as e:
            logger.error(f"목록 조회 실패: {str(e)}")
            return []

    def get_file_url(self, blob_name: str) -> Optional[str]:
        """
        GCS 파일의 공개 URL을 반환
        
        Args:
            blob_name (str): 파일의 전체 경로명
            
        Returns:
            Optional[str]: 파일의 공개 URL, 실패 시 None
        """
        try:
            blob = self.bucket.blob(blob_name)
            return blob.public_url
        except Exception as e:
            logger.error(f"URL 가져오기 실패: {str(e)}")
            return None

    def check_file_exists(self, filename: str, is_upload_path: bool = False) -> bool:
        """
        GCS에 파일이 존재하는지 확인
        
        Args:
            filename (str): 확인할 파일명
            is_upload_path (bool, optional): 업로드 경로 사용 여부. Defaults to False.
            
        Returns:
            bool: 파일 존재 시 True, 미존재 또는 확인 실패 시 False
        """
        try:
            base_path = self.upload_path if is_upload_path else self.gcs_download_path
            blob = self.bucket.blob(base_path + filename)
            return blob.exists()
        except Exception as e:
            logger.error(f"존재 여부 확인 실패: {str(e)}")
            return False