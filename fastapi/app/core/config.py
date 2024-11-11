import os
import sys
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OLLAMA_URL: str = os.getenv('OLLAMA_URL')
    MODEL_NAME: str = "hf.co/QuantFactory/llama-3.2-Korean-Bllossom-3B-GGUF"
    MAX_CONCURRENT_REQUESTS: int = 100
    REQUESTS_PER_MINUTE: int = 600
    MAX_RETRIES: int = 3
    TIMEOUT: int = 60

settings = Settings()