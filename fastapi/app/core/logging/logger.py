import logging
import sys
import os
from pathlib import Path
from datetime import datetime
from app.core.config import settings
from .handlers.async_safe import AsyncSafeRotatingFileHandler
from .formatters import EnhancedFormatter
from .utils import cleanup_old_logs
from .handlers.redis import RedisLogHandler

"""
FastAPI 애플리케이션을 위한 로깅 시스템 설정 모듈

주요 기능:
    - 다중 핸들러 지원
        ├─ 콘솔 출력: 실시간 모니터링용
        ├─ 파일 저장: 영구 보관 및 이력 추적용
        └─ Redis 저장: 중앙 집중식 로그 수집용
    
    - 자동화된 로그 관리
        ├─ 일별 로그 파일 순환
        ├─ 오래된 로그 자동 압축 (.gz)
        └─ 설정된 기간 이후 자동 삭제
    
    - 향상된 로그 정보
        ├─ 밀리초 단위 타임스탬프
        ├─ 프로세스/스레드 정보
        ├─ 메모리 사용량 모니터링
        └─ 상세한 예외 정보 기록

설정:
    LOG_LEVEL: 로그 레벨 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    LOG_FILE_PATH: 로그 파일 저장 경로 (기본: logs/)
    LOG_MAX_SIZE: 로그 파일 최대 크기 (기본: 10MB)
    LOG_BACKUP_COUNT: 보관할 로그 파일 수 (기본: 30개)

사용 예시:
    from app.core.logging import logger

    # 기본 로깅
    logger.info("서버 시작")
    logger.debug("상세 디버그 정보")
    
    # 예외 로깅
    try:
        raise ValueError("테스트 에러")
    except Exception as e:
        logger.error("오류 발생", exc_info=True)
        
    # 커스텀 데이터 로깅
    logger.info("사용자 접속", extra={
        'user_id': 'user123',
        'ip': '192.168.1.1'
    })
"""

# 로그 디렉토리 설정
log_dir = Path(settings.LOG_FILE_PATH)
try:
    log_dir.mkdir(parents=True, exist_ok=True)
    if not os.access(log_dir, os.W_OK):
        raise PermissionError(f"로그 디렉토리 쓰기 권한 없음: {log_dir}")
except Exception as e:
    print(f"로그 디렉토리 생성 실패: {e}", file=sys.stderr)
    sys.exit(1)

# 로거 설정
try:
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL))

    formatter = EnhancedFormatter()

    # 콘솔 핸들러
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG)
    root_logger.addHandler(console_handler)

    # 파일 핸들러
    log_datetime = datetime.now().strftime('%Y%m%d')
    log_filename = log_dir / f"fastapi-app-{log_datetime}.log"

    file_handler = AsyncSafeRotatingFileHandler(
        filename=str(log_filename),
        when='midnight',
        interval=1,
        backupCount=settings.LOG_BACKUP_COUNT,
        encoding='utf-8',
        delay=True
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(getattr(logging, settings.LOG_LEVEL))
    root_logger.addHandler(file_handler)

    # Redis 핸들러
    redis_handler = RedisLogHandler()
    redis_handler.setFormatter(formatter)
    redis_handler.setLevel(getattr(logging, settings.LOG_LEVEL))
    root_logger.addHandler(redis_handler)

except Exception as e:
    print(f"로거 초기화 실패: {e}", file=sys.stderr)
    sys.exit(1)

logger = logging.getLogger(__name__)
logger.propagate = True

def setup_uvicorn_logging():
    """
    Uvicorn의 로깅을 애플리케이션의 로깅 시스템과 통합
    
    Uvicorn의 기본 로거와 접근 로거의 핸들러를 제거하고 루트 로거로 전파되도록 설정
    """
    try:
        for logger_name in ("uvicorn", "uvicorn.access"):
            uvicorn_logger = logging.getLogger(logger_name)
            uvicorn_logger.handlers = []
            uvicorn_logger.propagate = True
    except Exception as e:
        root_logger.error(f"Uvicorn 로거 설정 실패: {e}")

setup_uvicorn_logging()
cleanup_old_logs(log_dir)