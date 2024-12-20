from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class OCRResponse(BaseModel):
    """OCR 처리 결과 응답 모델"""
    status: str = "success"
    text: str = ""
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    pages: Optional[List[Dict[str, Any]]] = None

class OCRBatchResponse(BaseModel):
    """OCR 일괄 처리 결과 응답 모델"""
    status: str = "success"
    results: List[OCRResponse] = []
    error: Optional[str] = None
    total: int = 0
    processed: int = 0
    failed: int = 0
