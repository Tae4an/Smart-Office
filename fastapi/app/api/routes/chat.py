from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.services.llama import LlamaClient
from app.core.logger import logger
from app.utils.service_checks import check_llama_service

router = APIRouter()
llama_client = LlamaClient()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_llama(request: ChatRequest):
    """
    Llama 모델과 채팅 진행

    Args:
        request (ChatRequest): 사용자의 채팅 요청
            - prompt: 사용자 입력 메시지
            - system_prompt: 시스템 프롬프트 (선택사항)

    Returns:
        ChatResponse: AI의 응답
            - response: AI 응답 메시지
            - status: 요청 처리 상태 ("성공" 또는 "오류")
            - error: 오류 발생 시 오류 메시지

    Raises:
        HTTPException: API 요청 처리 중 오류 발생 시
    """
    try:
        response_text = await llama_client.get_completion(request)
        return ChatResponse(response=response_text, status="성공")
    except HTTPException as e:
        return ChatResponse(response="", status="오류", error=str(e.detail))

@router.get("/status")
async def status_check():
    """
    Llama 서비스의 현재 상태 확인

    Returns:
        Dict: 서비스 상태 정보
            - status: 서비스 연결 상태 ("connected", "error", "not_configured")
            - details: 상태에 대한 상세 설명
            - client_initialized: 클라이언트 초기화 여부
            - model_info: 실행 중인 모델 정보 (이름, 상태, 크기 등)
    """
    service_status, details, model_info = await check_llama_service()
    return {
        "status": service_status,
        "details": details,
        "client_initialized": llama_client is not None,
        "model_info": model_info
    }