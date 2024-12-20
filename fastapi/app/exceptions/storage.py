from .base import BaseApplicationException

class StorageError(BaseApplicationException):
    """저장소 관련 기본 예외"""
    pass

class FileUploadError(StorageError):
    """파일 업로드 실패"""
    def __init__(self, filename: str):
        super().__init__(500, f"파일 업로드 실패: {filename}")

class FileDownloadError(StorageError):
    """파일 다운로드 실패"""
    def __init__(self, filename: str):
        super().__init__(500, f"파일 다운로드 실패: {filename}")

class FileNotFoundError(StorageError):
    """파일을 찾을 수 없음"""
    def __init__(self, filename: str):
        super().__init__(404, f"파일을 찾을 수 없음: {filename}")

class CacheError(StorageError):
    """캐시 처리 오류"""
    def __init__(self, operation: str, detail: str):
        super().__init__(500, f"캐시 {operation} 실패: {detail}")
