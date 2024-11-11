from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import chat
from app.core.logger import logger
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
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
    """,
    version="1.0.0",
        docs_url="/docs",   # Swagger UI
    redoc_url="/redoc",     # ReDoc
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # 모든 도메인에 대해 CORS 허용
    allow_credentials=True, # 쿠키를 주고받을 수 있도록 허용
    allow_methods=["*"],    # GET, POST 등 허용할 HTTP 메서드
    allow_headers=["*"],    # 허용할 HTTP 헤더
)

app.include_router(chat.router, prefix="/api/llama", tags=["llama"])