from .base import BaseApplicationException

class SecurityError(BaseApplicationException):
    """보안 관련 기본 예외"""
    pass

class InvalidCredentialsError(SecurityError):
    """잘못된 인증 정보"""
    def __init__(self):
        super().__init__(401, "잘못된 인증 정보입니다.")

class AccessDeniedError(SecurityError):
    """접근 권한 없음"""
    def __init__(self, resource: str):
        super().__init__(403, f"접근 권한이 없습니다: {resource}")

class RateLimitExceededError(SecurityError):
    """요청 제한 초과"""
    def __init__(self, limit: int, period: str):
        super().__init__(429, f"요청 제한 초과: {limit}회/{period}")

class InvalidIPError(SecurityError):
    """허용되지 않는 IP"""
    def __init__(self, ip: str):
        super().__init__(403, f"허용되지 않는 IP 주소: {ip}")
