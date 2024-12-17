import redis
from app.core.config import settings

class BaseRedisHandler:
    """
    Redis 연결 및 기본 설정을 관리하는 기본 클래스
    
    모든 Redis 관련 핸들러의 기본 클래스로, 연결 설정을 관리
    
    Attributes:
        redis_client (redis.Redis): Redis 클라이언트 인스턴스
    """
    
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )