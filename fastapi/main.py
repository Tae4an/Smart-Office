import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import chat, health, ocr, log_test
from app.core.logging import logger
from app.core.logging.logger import setup_uvicorn_logging
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    ## FastAPI 애플리케이션의 수명 주기를 관리

        Args:
            app (FastAPI): FastAPI 애플리케이션 인스턴스

        Yields:
            None: 애플리케이션 실행 중 컨텍스트

        Note:
            - 시작 시: 서버 시작 로그 기록
            - 종료 시: Llama 클라이언트 정리 및 서버 종료 로그 기록
    """
    logger.info("AI 통합 서비스 API 서버 시작")
    yield
    await chat.llama_client.cleanup()
    logger.info("AI 통합 서비스 API 서버 종료")

# 비동기 콘텍스트 매니저를 사용한 앱 초기화
app = FastAPI(
    title="AI 통합 서비스 API",
    description="""
    여러 AI 서비스를 통합한 API 서버:
        - Llama 챗봇 서비스
        - OCR (문서 텍스트 추출) 서비스
        - 시스템 상태 모니터링
        - 서비스 헬스체크
    
    엔드포인트:
        - /api/v1/llama/chat: Llama 모델과 대화
        - /api/v1/llama/status: Llama 서비스 상태 확인
        - /api/v1/ocr/process: 이미지 문서의 텍스트 추출
        - /api/v1/health: 시스템 전반적인 상태 확인
    """,
    version="1.0.0",
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc
    lifespan=lifespan
)

"""
CORS 설정을 위해 다음을 허용:
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

# CORS 미들웨어 설정 이후에 로깅 미들웨어 추가
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """모든 HTTP 요청과 응답을 로깅하는 미들웨어"""
    # 요청 로깅
    logger.info(f"Request: {request.method} {request.url}")
    
    # 요청 처리
    response = await call_next(request)
    
    # 응답 로깅
    logger.info(f"Response: Status {response.status_code}")
    
    return response

# API 라우터 설정
app.include_router(chat.router, prefix="/api/v1/llama", tags=["llama"])
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(ocr.router, prefix="/api/v1/ocr", tags=["ocr"])
app.include_router(log_test.router, prefix="/api/v1/logs", tags=["logs"])  # 로그 테스트 라우터 추가

if __name__ == "__main__":
    setup_uvicorn_logging()
    
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.RELOAD,
        workers=settings.WORKERS,
        log_config=None
    )