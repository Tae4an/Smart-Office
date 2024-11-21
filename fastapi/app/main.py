from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import chat, health
from app.core.logger import logger
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI 애플리케이션의 수명 주기를 관리

    Args:
        app (FastAPI): FastAPI 애플리케이션 인스턴스

    Yields:
        None: 애플리케이션 실행 중 컨텍스트

    Note:
        - 시작 시: 서버 시작 로그 기록
        - 종료 시: Llama 클라이언트 정리 및 서버 종료 로그 기록
    """
    # Startup
    logger.info("AI 통합 서비스 API 서버 시작")
    yield
    # Shutdown
    await chat.llama_client.cleanup()
    logger.info("AI 통합 서비스 API 서버 종료")

# 비동기 콘텍스트 매니저를 사용한 앱 초기화
app = FastAPI(
    title="AI 통합 서비스 API",
    description="""
    여러 AI 서비스를 통합한 API 서버:
        - Llama 챗봇 서비스
        - 시스템 상태 모니터링
        - 서비스 헬스체크
    
    엔드포인트:
        - /api/v1/llama/chat: Llama 모델과 대화
        - /api/v1/llama/status: Llama 서비스 상태 확인
        - /api/v1/health: 시스템 전반적인 상태 확인
    """,
    version="1.0.0",
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc
    lifespan=lifespan
)

"""
CORS 설정을 통해 다음을 허용:
    - 모든 도메인에서의 접근 (allow_origins=["*"])
    - 쿠키 사용 (allow_credentials=True)
    - 모든 HTTP 메서드 (allow_methods=["*"])
    - 모든 HTTP 헤더 (allow_headers=["*"])
"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # 모든 도메인에 대해 CORS 허용
    allow_credentials=True, # 쿠키를 주고받을 수 있도록 허용
    allow_methods=["*"],    # GET, POST 등 허용할 HTTP 메서드
    allow_headers=["*"],    # 허용할 HTTP 헤더
)

# API 라우터 설정
app.include_router(chat.router, prefix="/api/v1/llama", tags=["llama"])
app.include_router(health.router, prefix="/api/v1", tags=["health"])