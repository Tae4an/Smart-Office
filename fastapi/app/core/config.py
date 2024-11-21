import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    애플리케이션의 전역 설정을 관리하는 클래스

    Attributes:
        APP_VERSION (str): 애플리케이션 버전
        OLLAMA_URL (str): Ollama API 서버 URL (환경 변수에서 로드)
        MODEL_NAME (str): 사용할 LLM 모델명
        MAX_CONCURRENT_REQUESTS (int): 최대 동시 요청 수
        REQUESTS_PER_MINUTE (int): 분당 최대 요청 수 제한
        MAX_RETRIES (int): API 요청 실패 시 최대 재시도 횟수
        TIMEOUT (int): API 요청 타임아웃 (초)

    Note:
        환경 변수를 통해 설정 오버라이드
        예: export OLLAMA_URL="http://localhost:11434"
    """
    APP_VERSION: str = "1.0.0"
    OLLAMA_URL: str = os.getenv('OLLAMA_URL')
    MODEL_NAME: str = "hf.co/QuantFactory/llama-3.2-Korean-Bllossom-3B-GGUF"
    MAX_CONCURRENT_REQUESTS: int = 100
    REQUESTS_PER_MINUTE: int = 600
    MAX_RETRIES: int = 3
    TIMEOUT: int = 60

settings = Settings()