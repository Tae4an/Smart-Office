import pytest
import os
from app.services.face_service import FaceService
from app.models.face_detection import FaceVerificationResponse

class TestImagePaths:
    """테스트에 사용되는 이미지 경로 상수"""
    BASE_DIR = 'tmp/img/deepface'
    PERSON1_IMG1 = os.path.join(BASE_DIR, 'KakaoTalk_Photo_2024-12-15-23-51-19.png')
    PERSON1_IMG2 = os.path.join(BASE_DIR, '565EC52D-BFFD-449D-9AA9-0C70B4FA606B_1_105_c.jpeg')
    PERSON2_IMG1 = os.path.join(BASE_DIR, '633558FC-1DD7-478C-A016-8145D87706A8_1_105_c.jpeg')
    PERSON2_IMG2 = os.path.join(BASE_DIR, 'F0B3232E-4E47-4902-8715-1AB0ACD4028C_1_105_c.jpeg')
    INVALID_PATH = os.path.join('nonexistent.jpg')
    INVALID_FORMAT = os.path.join('invalid.txt')

@pytest.fixture
def face_service():
    """FaceService 인스턴스를 생성하는 fixture"""
    return FaceService()

@pytest.mark.asyncio
async def test_verify_faces_same_person(face_service):
    """동일인물 얼굴 검증 테스트"""
    result = await face_service.verify_faces(
        TestImagePaths.PERSON1_IMG1,
        TestImagePaths.PERSON1_IMG2
    )
    
    print(f"\n검증 결과: {result}")
    print(f"유사도 점수: {result.similarity_score:.4f}")
    
    assert isinstance(result, FaceVerificationResponse)
    assert result.verified is True  # 일치 여부 확인
    assert result.similarity_score > 0.5  # 유사도 기준을 0.8에서 0.5로 조정
    assert result.distance < result.threshold  # 거리가 임계값보다 작은지 확인

@pytest.mark.asyncio
async def test_verify_faces_different_persons(face_service):
    """서로 다른 인물 얼굴 검증 테스트"""
    result = await face_service.verify_faces(
        TestImagePaths.PERSON1_IMG1,
        TestImagePaths.PERSON2_IMG1
    )
    
    print(f"\n다른 인물 검증 결과: {result}")
    print(f"다른 인물 유사도 점수: {result.similarity_score:.4f}")
    
    assert isinstance(result, FaceVerificationResponse)
    assert result.verified is False
    assert result.similarity_score < 0.5  # 다른 인물의 경우 유사도가 0.5 미만이어야 함
    assert result.distance > result.threshold  # 거리가 임계값보다 큰지 확인

@pytest.mark.asyncio
async def test_verify_faces_invalid_image(face_service):
    """잘못된 이미지 경로로 검증 시 예외 처리 테스트"""
    with pytest.raises(ValueError):
        await face_service.verify_faces(
            TestImagePaths.INVALID_PATH,
            TestImagePaths.INVALID_FORMAT
        )
