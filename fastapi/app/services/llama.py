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
    """
    API 요청에 대한 속도 제한을 관리합니다.

    Attributes:
        requests_per_minute (int): 분당 최대 허용 요청 수
        requests (List[datetime]): 최근 요청 시간 기록
        _lock (asyncio.Lock): 동시성 제어를 위한 락
    """

    def __init__(self, requests_per_minute: int):
        """
        RateLimiter 초기화

        Args:
            requests_per_minute (int): 분당 최대 허용 요청 수
        """
        self.requests_per_minute = requests_per_minute
        self.requests: List[datetime] = []
        self._lock = asyncio.Lock()

    async def acquire(self) -> bool:
        """
        요청 가능 여부를 확인하고 요청을 기록합니다.

        Returns:
            bool: 요청 가능 여부 (True: 가능, False: 제한됨)
        """
        async with self._lock:
            now = datetime.now()
            self.requests = [req for req in self.requests
                           if now - req < timedelta(minutes=1)]
            
            if len(self.requests) >= self.requests_per_minute:
                return False
            
            self.requests.append(now)
            return True

class LlamaClient:
    """
    Llama 모델과의 통신을 관리하는 클라이언트

    비동기 HTTP 통신, 속도 제한, 재시도 로직을 포함

    Attributes:
        _client (Optional[httpx.AsyncClient]): 비동기 HTTP 클라이언트 인스턴스
        _exit_stack (AsyncExitStack): 비동기 컨텍스트 관리자
        _semaphore (asyncio.Semaphore): 동시 요청 수 제한을 위한 세마포어
        _rate_limiter (RateLimiter): API 요청 속도 제한 관리자
        _lock (asyncio.Lock): 클라이언트 초기화를 위한 동기화 락
    """

    def __init__(self):
        """
        LlamaClient를 초기화

        초기화 내용:
        - 비동기 HTTP 클라이언트 (lazy initialization)
        - 동시성 제어를 위한 세마포어
        - API 요청 속도 제한 관리자
        - 리소스 정리를 위한 AsyncExitStack
        """
        self._client: Optional[httpx.AsyncClient] = None
        self._exit_stack = AsyncExitStack()
        self._semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_REQUESTS)
        self._rate_limiter = RateLimiter(settings.REQUESTS_PER_MINUTE)
        self._lock = asyncio.Lock()
        logger.info("Llama 클라이언트 초기화 완료")

    async def _get_client(self) -> httpx.AsyncClient:
        """
        HTTP 클라이언트를 가져오거나 초기화

        싱글톤 패턴으로 구현되어 있어 클라이언트 인스턴스를 재사용

        Returns:
            httpx.AsyncClient: 초기화된 HTTP 클라이언트

        Note:
            - 스레드 안전을 위해 asyncio.Lock 사용
            - 타임아웃 설정이 적용된 클라이언트 생성
        """
        if self._client is None:
            async with self._lock:
                if self._client is None:
                    self._client = await self._exit_stack.enter_async_context(
                        httpx.AsyncClient(timeout=settings.TIMEOUT)
                    )
        return self._client

    async def cleanup(self):
        """클라이언트 리소스를 정리
    
        Note:
            - HTTP 클라이언트 종료
            - AsyncExitStack을 통한 컨텍스트 정리
        """
        if self._client:
            await self._exit_stack.aclose()
            self._client = None

    async def get_completion(self, request: ChatRequest) -> str:
        """
        Llama 모델에 채팅 요청을 보내고 응답을 받음

        Args:
            request (ChatRequest): 채팅 요청 정보
                - prompt: 사용자 입력 텍스트
                - system_prompt: 시스템 프롬프트 (선택사항)

        Returns:
            str: 모델이 생성한 응답 텍스트

        Raises:
            HTTPException: 다음 상황에서 발생
                - 429: 요청 속도 제한 초과
                - 502: 서버 응답 파싱 실패
                - 504: 요청 타임아웃

        Note:
            - 재시도 로직 포함 (settings.MAX_RETRIES 횟수만큼)
            - 지수 백오프 방식의 재시도 대기 시간
            - 요청 속도 제한 및 동시성 제어 적용
        """
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
                        settings.OLLAMA_URL + "/api/chat",
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