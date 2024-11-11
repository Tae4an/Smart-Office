from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.services.llama import LlamaClient
from app.core.logger import logger

router = APIRouter()
llama_client = LlamaClient()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_llama(request: ChatRequest):
    try:
        response_text = await llama_client.get_completion(request)
        return ChatResponse(response=response_text, status="성공")
    except HTTPException as e:
        return ChatResponse(response="", status="오류", error=str(e.detail))

@router.get("/status")
async def status_check():
    return {"상태": "정상 작동 중"}