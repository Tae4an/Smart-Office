from pydantic import BaseModel
from typing import Optional, Any, Dict

class ErrorResponse(BaseModel):
    """API 에러 응답 모델"""
    status: str = "error"
    code: int
    message: str
    details: Optional[Dict[str, Any]] = None
