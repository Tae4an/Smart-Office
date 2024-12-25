from pydantic import BaseModel
from typing import Optional, Dict, Any

class OCRResponse(BaseModel):
    """OCR 응답 모델"""
    status: str = "success"
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class OCRBatchResponse(BaseModel):
    """OCR 일괄 처리 응답 모델"""
    status: str = "success"
    data: list[Dict[str, Any]] = []
    total: int = 0
    processed: int = 0
    failed: int = 0
