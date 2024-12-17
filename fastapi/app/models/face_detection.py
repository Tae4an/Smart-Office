from pydantic import BaseModel

class FaceVerificationResponse(BaseModel):
    """얼굴 검증 결과 모델"""
    verified: bool
    distance: float
    threshold: float
    model: str
    similarity_score: float