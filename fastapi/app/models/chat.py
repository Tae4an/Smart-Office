from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class Role(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class Message(BaseModel):
    role: Role
    content: str = Field(..., min_length=1)

class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="사용자 입력 메시지")
    system_prompt: Optional[str] = Field(None, description="시스템 프롬프트 (선택사항)")

class ChatResponse(BaseModel):
    response: str = Field(..., description="AI 응답 메시지")
    status: str = Field(..., description="요청 처리 상태")
    error: Optional[str] = Field(None, description="에러 메시지 (있는 경우)")