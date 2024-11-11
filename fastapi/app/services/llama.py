from app.core.config import settings
from app.core.logger import logger
from app.models.chat import ChatRequest, Role
from fastapi import HTTPException
import httpx
import asyncio
from datetime import datetime, timedelta
from contextlib import AsyncExitStack
from typing import List, Optional

class RateLimiter:
    def __init__(self, requests_per_minute: int):
        self.requests_per_minute = requests_per_minute
        self.requests: List[datetime] = []
        self._lock = asyncio.Lock()

    async def acquire(self) -> bool:
        async with self._lock:
            now = datetime.now()
            self.requests = [req for req in self.requests
                           if now - req < timedelta(minutes=1)]
            
            if len(self.requests) >= self.requests_per_minute:
                return False
            
            self.requests.append(now)
            return True

class LlamaClient:
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None
        self._exit_stack = AsyncExitStack()
        self._semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_REQUESTS)
        self._rate_limiter = RateLimiter(settings.REQUESTS_PER_MINUTE)
        self._lock = asyncio.Lock()
        logger.info("Llama 클라이언트 초기화 완료")

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            async with self._lock:
                if self._client is None:
                    self._client = await self._exit_stack.enter_async_context(
                        httpx.AsyncClient(timeout=settings.TIMEOUT)
                    )
        return self._client

    async def cleanup(self):
        if self._client:
            await self._exit_stack.aclose()
            self._client = None

    async def get_completion(self, request: ChatRequest) -> str:
        if not await self._rate_limiter.acquire():
            raise HTTPException(
                status_code=429,
                detail="너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요."
            )

        async with self._semaphore:
            messages = []
            if request.system_prompt:
                messages.append({"role": Role.SYSTEM, "content": request.system_prompt})
                logger.debug(f"시스템 프롬프트 추가됨: {request.system_prompt[:50]}...")

            messages.append({"role": Role.USER, "content": request.prompt})
            logger.debug(f"사용자 메시지 추가됨: {request.prompt[:50]}...")

            client = await self._get_client()
            retries = 0

            while retries <= settings.MAX_RETRIES:
                try:
                    llama_request = {
                        "model": settings.MODEL_NAME,
                        "messages": messages,
                        "stream": False
                    }

                    logger.info("Llama 서버에 요청 전송 중...")
                    response = await client.post(
                        settings.LLAMA_URL,
                        json=llama_request,
                        timeout=settings.TIMEOUT
                    )
                    response.raise_for_status()

                    data = response.json()
                    logger.info("Llama 서버로부터 응답 수신 완료")

                    response_text = data.get('message', {}).get('content')
                    if not response_text:
                        raise HTTPException(
                            status_code=502,
                            detail="응답에서 텍스트를 찾을 수 없음"
                        )

                    return response_text

                except httpx.TimeoutException:
                    retries += 1
                    if retries > settings.MAX_RETRIES:
                        logger.error("최대 재시도 횟수 초과 (timeout)")
                        raise HTTPException(
                            status_code=504,
                            detail="서버 응답 시간 초과"
                        )
                    await asyncio.sleep(1 * retries)

                except Exception as e:
                    retries += 1
                    if retries > settings.MAX_RETRIES:
                        logger.error(f"요청 처리 중 오류 발생: {str(e)}")
                        raise HTTPException(
                            status_code=502,
                            detail="Llama 서버와 통신 중 오류 발생"
                        )
                    await asyncio.sleep(1 * retries)