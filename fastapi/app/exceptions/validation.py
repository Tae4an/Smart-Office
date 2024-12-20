from .base import BaseApplicationException

class ValidationError(BaseApplicationException):
    """데이터 검증 관련 기본 예외"""
    def __init__(self, field: str, message: str):
        super().__init__(400, f"유효성 검증 실패: {field} - {message}")

class InvalidFormatError(ValidationError):
    """잘못된 형식 예외"""
    def __init__(self, field: str, expected_format: str):
        super().__init__(field, f"잘못된 형식입니다. 예상 형식: {expected_format}")

class FileValidationError(ValidationError):
    """파일 검증 예외"""
    def __init__(self, detail: str):
        super().__init__("file", detail)

class PayloadValidationError(ValidationError):
    """요청 데이터 검증 예외"""
    def __init__(self, field: str):
        super().__init__(field, "잘못된 데이터 형식")

class SizeExceededError(ValidationError):
    """크기 제한 초과 예외"""
    def __init__(self, field: str, max_size: int):
        super().__init__(field, f"최대 크기 초과: {max_size} bytes")
