import json
import logging
import redis
from app.core.config import settings
"""
Redis 로그 핸들러 모듈

주요 기능:
    - 로그 메시지를 Redis에 JSON 형식으로 저장
    - 로그 레벨, 스레드, 메모리 사용량 등 메타데이터 포함
    - 예외 발생 시 스택 트레이스 저장

로그 엔트리 구조:
    - level: 로그 레벨
    - thread: 스레드 이름
    - logger: 로거 이름
    - message: 로그 메시지
    - application: 애플리케이션 식별자
    - pathname: 로그 발생 파일 경로
    - lineno: 로그 발생 라인 번호
    - function: 로그 발생 함수명
    - memory: 메모리 사용량 (옵션)
    - exception: 예외 정보 (발생 시)

설정:
    - Redis 연결 정보는 settings에서 관리
    - REDIS_LOG_KEY로 저장될 키 지정
"""

class RedisLogHandler(logging.Handler):
    """Redis에 로그를 전송하는 커스텀 핸들러"""
    def __init__(self):
        super().__init__()
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        self.key = settings.REDIS_LOG_KEY

    def emit(self, record: logging.LogRecord) -> None:
        try:
            log_entry = {
                "level": record.levelname,
                "thread": record.threadName,
                "logger": record.name,
                "message": record.getMessage(),
                "application": "fastapi-app",
                "pathname": record.pathname,
                "lineno": record.lineno,
                "function": record.funcName,
                "memory": getattr(record, 'memory', None)
            }
            
            if record.exc_info:
                log_entry["exception"] = logging.Formatter().formatException(record.exc_info)

            self.redis_client.lpush(self.key, json.dumps(log_entry))
        except Exception as e:
            print(f"Redis 로그 전송 실패: {e}")