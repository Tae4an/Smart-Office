from .base import BaseApplicationException

class HTTPError(BaseApplicationException):
    """HTTP 관련 기본 예외"""
    pass

class BadRequestError(HTTPError):
    """400 Bad Request"""
    def __init__(self, detail: str):
        super().__init__(400, detail)

class NotFoundError(HTTPError):
    """404 Not Found"""
    def __init__(self, resource: str):
        super().__init__(404, f"리소스를 찾을 수 없습니다: {resource}")

class ConflictError(HTTPError):
    """409 Conflict"""
    def __init__(self, detail: str):
        super().__init__(409, detail)

class TimeoutError(HTTPError):
    """504 Gateway Timeout"""
    def __init__(self):
        super().__init__(504, "요청 처리 시간이 초과되었습니다.")
