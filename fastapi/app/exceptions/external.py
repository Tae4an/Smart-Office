from .base import BaseApplicationException

class ExternalServiceError(BaseApplicationException):
    """외부 서비스 연동 관련 기본 예외"""
    pass

class APIError(BaseApplicationException):
    """일반적인 API 오류"""
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code, f"API 오류: {detail}")

class APIRequestError(ExternalServiceError):
    """API 요청 실패"""
    def __init__(self, service: str, status_code: int, detail: str):
        super().__init__(service, "API 요청", f"상태 코드: {status_code}, 상세: {detail}")

class ServiceUnavailableError(ExternalServiceError):
    """서비스 불가용"""
    def __init__(self, service: str):
        super().__init__(service, "연결", "서비스가 일시적으로 불가능합니다.")

class TimeoutError(ExternalServiceError):
    """요청 시간 초과"""
    def __init__(self, service: str, timeout: int):
        super().__init__(service, "시간 초과", f"{timeout}초 초과")
