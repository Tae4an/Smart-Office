from pydantic_settings import BaseSettings
"""
애플리케이션 설정 관리 모듈

설정 그룹:
    - AppSettings: 기본 앱 설정 (버전, 환경, 디버그 모드)
    - ServerSettings: 서버 관련 설정 (호스트, 포트, 워커)
    - RedisSettings: Redis 연결 및 설정
    - LogSettings: 로깅 시스템 설정
    - APISettings: 외부 API 연동 설정
    - StorageSettings: 파일 저장소 관련 설정

특징:
    - Pydantic 기반 타입 검증
    - 환경 변수 자동 로드 (.env 파일 지원)
    - 계층적 설정 구조
    - 문서화된 설정 필드

사용:
    from app.core.config import settings
    
    debug_mode = settings.DEBUG
    redis_host = settings.REDIS_HOST
"""

class AppSettings(BaseSettings):
    """
    앱 기본 설정
    
    Attributes:
        APP_VERSION: 앱 버전
        ENV: 실행 환경 (development/production)
        DEBUG: 디버그 모드 여부
    """
    APP_VERSION: str = "1.0.0"
    ENV: str
    DEBUG: bool

class ServerSettings(BaseSettings):
    """
    서버 관련 설정
    
    Attributes:
        SERVER_HOST: 서버 호스트 주소
        SERVER_PORT: 서버 포트
        RELOAD: 자동 리로드 여부
        WORKERS: 워커 프로세스 수
    """
    SERVER_HOST: str
    SERVER_PORT: int
    RELOAD: bool
    WORKERS: int
    
class RedisSettings(BaseSettings):
    """
    Redis 관련 설정
    
    Attributes:
        REDIS_HOST: Redis 호스트 주소
        REDIS_PORT: Redis 포트
        REDIS_PASSWORD: Redis 비밀번호
        REDIS_LOG_KEY: Redis 로그 저장 키
    """
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    REDIS_LOG_KEY: str

class LogSettings(BaseSettings):
    """
    로깅 관련 설정
    
    Attributes:
        LOG_LEVEL: 로깅 레벨 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        LOG_FILE_PATH: 로그 파일이 저장될 경로
        LOG_MAX_SIZE: 각 로그 파일의 최대 크기 (bytes)
        LOG_BACKUP_COUNT: 보관할 로그 파일의 최대 개수
    """
    LOG_LEVEL: str
    LOG_FILE_PATH: str = "logs/"
    LOG_MAX_SIZE: int = 10 * 1024 * 1024
    LOG_BACKUP_COUNT: int = 30

class APISettings(BaseSettings):
    """
    API 및 서비스 설정
    
    Attributes:
        OLLAMA_URL: Ollama 서비스 접속 URL
        MODEL_NAME: 사용할 AI 모델명
        MAX_CONCURRENT_REQUESTS: 동시 처리 가능한 최대 요청 수
        REQUESTS_PER_MINUTE: 분당 최대 요청 처리 수
        MAX_RETRIES: 요청 실패 시 최대 재시도 횟수
        TIMEOUT: 요청 타임아웃 시간 (초)
        UPSTAGE_API_KEY: Upstage OCR API 인증 키
    """
    OLLAMA_URL: str
    MODEL_NAME: str
    MAX_CONCURRENT_REQUESTS: int
    REQUESTS_PER_MINUTE: int
    MAX_RETRIES: int
    TIMEOUT: int
    UPSTAGE_API_KEY: str

class StorageSettings(BaseSettings):
    """
    스토리지 관련 설정
    
    Attributes:
        GOOGLE_CREDENTIALS_PATH: Google Cloud 인증 정보 파일 경로
        GCS_BUCKET_NAME: Google Cloud Storage 버킷 이름
        GCS_DOWNLOAD_PATH: GCS에서 다운로드할 이미지 경로
        GCS_UPLOAD_PATH: GCS에 업로드할 처리된 파일 경로
        LOCAL_DOWNLOAD_PATH: 로컬 임시 저장 경로
    """
    GOOGLE_CREDENTIALS_PATH: str
    GCS_BUCKET_NAME: str
    GCS_DOWNLOAD_PATH: str = "img/"
    GCS_UPLOAD_PATH: str = "processed/"
    LOCAL_DOWNLOAD_PATH: str = "tmp/img/original/"
    LOCAL_PROCESSED_PATH: str = "tmp/img/processed/"

class Settings(
    AppSettings,
    ServerSettings,
    RedisSettings,
    LogSettings,
    APISettings,
    StorageSettings
):
    """
    통합 설정 클래스
    
    모든 설정 클래스를 상속받아 통합된 설정 제공
    환경 변수나 .env 파일에서 설정값 로드
    """
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True
    }

settings = Settings()