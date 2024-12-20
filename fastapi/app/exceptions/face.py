from .base import BaseApplicationException

class FaceError(BaseApplicationException):
    """얼굴 인식 관련 일반 에러"""
    def __init__(self, message: str = "얼굴 인식 처리 중 오류가 발생했습니다"):
        super().__init__(500, message)

class FaceException(BaseApplicationException):
    """얼굴 인식 관련 기본 예외"""
    pass

class FaceDetectionError(FaceException):
    """얼굴 검출 실패"""
    def __init__(self):
        super().__init__(400, "얼굴을 찾을 수 없거나 인식할 수 없습니다.")

class FaceVerificationError(FaceException):
    """얼굴 검증 실패"""
    def __init__(self):
        super().__init__(401, "얼굴 검증에 실패했습니다.")

class ImageProcessingError(FaceException):
    """이미지 처리 오류"""
    def __init__(self, detail: str):
        super().__init__(400, f"이미지 처리 실패: {detail}")

class StoredImageNotFound(FaceException):
    """저장된 이미지 없음"""
    def __init__(self, emp_id: str):
        super().__init__(404, f"직원 ID {emp_id}의 이미지를 찾을 수 없습니다.")

class VerificationTimeout(FaceException):
    """검증 시간 초과"""
    def __init__(self):
        super().__init__(504, "얼굴 검증 처리 시간이 초과되었습니다.")
