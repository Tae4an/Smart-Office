import json
import logging
from .base import BaseRedisHandler
from app.core.config import settings

class RedisLogHandler(logging.Handler):
    """
    Redis에 로그를 전송하는 커스텀 로깅 핸들러
    
    애플리케이션에서 발생하는 로그를 Redis 리스트에 저장
    메시지, 에러 정보, 메모리 사용량 등의 상세 정보를 포함
    
    Attributes:
        redis_client (redis.Redis): Redis 클라이언트 인스턴스
        key (str): 로그 저장에 사용할 Redis 키
        
    Note:
        로그 데이터는 JSON 형식으로 저장
        저장되는 필드: level, thread, logger, message, application, 
                     pathname, lineno, function, memory, exception
    """
    
    def __init__(self):
        super().__init__()
        self.redis_client = BaseRedisHandler().redis_client
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