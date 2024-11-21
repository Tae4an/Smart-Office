from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class Role(str, Enum):
    """
    채팅 참여자의 역할을 정의하는 열거형

    Attributes:
        SYSTEM: 시스템 지시사항 전달 역할
        USER: 일반 사용자 역할
        IPYTHON: IPython/Jupyter 환경의 사용자 역할
        ASSISTANT: AI 어시스턴트 역할
    """
    SYSTEM = "system"
    USER = "user"
    IPYTHON = "ipython"
    ASSISTANT = "assistant"

class Message(BaseModel):
    """
    채팅 메시지의 기본 구조를 정의

    Attributes:
        role: 메시지 작성자의 역할
        content: 메시지 내용 (최소 1자 이상)
    """
    role: Role
    content: str = Field(..., min_length=1)

class ChatRequest(BaseModel):
    """
    채팅 요청 데이터 모델

    Attributes:
        prompt: 사용자가 입력한 메시지 (최소 1자 이상)
        system_prompt: 시스템 프롬프트 (선택사항)
            - AI의 역할이나 응답 방식을 지정하는 데 사용
    """
    prompt: str = Field(..., min_length=1, description="사용자 입력 메시지")
    system_prompt: Optional[str] = Field(None, description="시스템 프롬프트 (선택사항)")

class ChatResponse(BaseModel):
    """
    채팅 응답 데이터 모델

    Attributes:
        response: AI가 생성한 응답 메시지
        status: 요청 처리 상태 ("성공" 또는 "오류")
        error: 오류 발생 시 오류 메시지
    """
    response: str = Field(..., description="AI 응답 메시지")
    status: str = Field(..., description="요청 처리 상태")
    error: Optional[str] = Field(None, description="에러 메시지 (있는 경우)")