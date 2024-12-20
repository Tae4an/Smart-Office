from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class OCRTextResult(BaseModel):
    """개별 텍스트 인식 결과"""
    page: int = Field(description="페이지 번호")
    text: str = Field(description="인식된 텍스트")
    confidence: float = Field(description="인식 신뢰도 (0~1)")
    boxes: List[List[int]] = Field(description="텍스트 영역 좌표 [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]")
    
    class Config:
        json_schema_extra = {
            "example": {
                "page": 1,
                "text": "발신: 홍길동",
                "confidence": 0.98,
                "boxes": [[100, 200], [300, 200], [300, 250], [100, 250]]
            }
        }

class OCRResponse(BaseModel):
    """OCR 처리 응답"""
    status: str = Field(default="success", description="처리 상태")
    total_pages: int = Field(description="총 페이지 수")
    results: List[OCRTextResult] = Field(description="페이지별 텍스트 인식 결과")
    processed_file: Optional[str] = Field(None, description="처리된 이미지 파일 경로")
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="추가 메타데이터 (처리 시간, 이미지 크기 등)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "total_pages": 2,
                "results": [
                    {
                        "page": 1,
                        "text": "발신: 홍길동",
                        "confidence": 0.98,
                        "boxes": [[100, 200], [300, 200], [300, 250], [100, 250]]
                    },
                    {
                        "page": 1,
                        "text": "수신: 김철수",
                        "confidence": 0.95,
                        "boxes": [[100, 300], [300, 300], [300, 350], [100, 350]]
                    }
                ],
                "processed_file": "processed/doc001.pdf",
                "metadata": {
                    "processing_time": "2.5s",
                    "image_size": "A4",
                    "dpi": 300
                }
            }
        }

# 에러 응답을 위한 모델
class OCRError(BaseModel):
    """OCR 처리 오류"""
    status: str = Field(default="error", description="오류 상태")
    code: int = Field(description="오류 코드")
    message: str = Field(description="오류 메시지")
    details: Optional[Dict[str, Any]] = Field(None, description="상세 오류 정보")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "error",
                "code": 500,
                "message": "OCR 처리 중 오류가 발생했습니다",
                "details": {
                    "error_type": "ProcessingError",
                    "page": 2
                }
            }
        }
