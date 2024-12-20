from .base import BaseApplicationException
from typing import Optional

class LlamaError(BaseApplicationException):
    """Llama 관련 기본 예외"""
    pass

class ModelNotFoundError(LlamaError):
    """모델을 찾을 수 없음"""
    def __init__(self, model_name: str):
        super().__init__(404, f"요청한 모델을 찾을 수 없습니다: {model_name}")

class ModelLoadError(LlamaError):
    """모델 로딩 실패"""
    def __init__(self, model_name: str, detail: Optional[str] = None):
        message = f"모델 로딩 실패: {model_name}"
        if detail:
            message += f" - {detail}"
        super().__init__(500, message)

class CompletionError(LlamaError):
    """응답 생성 실패"""
    def __init__(self, detail: str):
        super().__init__(500, f"응답 생성 실패: {detail}")

class ContextLengthExceededError(LlamaError):
    """컨텍스트 길이 초과"""
    def __init__(self, max_length: int):
        super().__init__(400, f"입력 텍스트가 최대 길이를 초과했습니다. (최대 {max_length}토큰)")

class ServiceUnavailableError(LlamaError):
    """Llama 서비스 불가용"""
    def __init__(self):
        super().__init__(503, "Llama 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.")
