from .base import BaseApplicationException

class AuthError(BaseApplicationException):
    """인증 기본 예외"""
    pass

class TokenError(AuthError):
    """토큰 관련 기본 예외"""
    pass

class TokenExpiredError(TokenError):
    """토큰 만료"""
    def __init__(self):
        super().__init__(401, "토큰이 만료되었습니다.")

class TokenInvalidError(TokenError):
    """유효하지 않은 토큰"""
    def __init__(self):
        super().__init__(401, "유효하지 않은 토큰입니다.")

class TokenMissingError(TokenError):
    """토큰 누락"""
    def __init__(self):
        super().__init__(401, "인증 토큰이 필요합니다.")

class PermissionError(AuthError):
    """권한 없음"""
    def __init__(self, required_role: str):
        super().__init__(403, f"필요한 권한이 없습니다. 필요 권한: {required_role}")
