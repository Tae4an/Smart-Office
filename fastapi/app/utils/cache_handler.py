from app.core.handlers.cache import RedisCacheHandler

# 싱글톤 패턴으로 캐시 핸들러 인스턴스 생성
cache_handler = RedisCacheHandler()

# 전역에서 사용할 수 있도록 export
__all__ = ['cache_handler']
