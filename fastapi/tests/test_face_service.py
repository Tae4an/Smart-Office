import pytest
import os
import sys

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from app.core.config import settings
from app.services.face_service import FaceService
from app.models.face_detection import FaceVerificationResponse
import redis

class TestImagePaths:
    BASE_DIR = 'tmp/img/deepface/emp'
    TEST_EMP_ID = "DEV003"
    VALID_IMAGE = os.path.join(BASE_DIR, f"{TEST_EMP_ID}.jpg")
    DIFFERENT_PERSON = os.path.join(BASE_DIR, "00006.jpg")

@pytest.fixture(scope="module")
def face_service():
    return FaceService(base_path=TestImagePaths.BASE_DIR)

@pytest.fixture(scope="module")
def redis_client():
    return redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        password=settings.REDIS_PASSWORD,
        decode_responses=False
    )

@pytest.fixture
def cached_test_image(redis_client):
    def _cache_image(image_path: str, cache_key: str):
        with open(image_path, 'rb') as f:
            image_data = f.read()
        redis_client.setex(cache_key, 300, image_data)
        return image_data
    return _cache_image

@pytest.mark.asyncio
async def test_verify_faces_same_person_with_cache(face_service, redis_client, cached_test_image):
    cache_key = f"face:verify:{TestImagePaths.TEST_EMP_ID}"
    cached_test_image(TestImagePaths.VALID_IMAGE, cache_key)
    
    result = await face_service.verify_faces(
        emp_id=TestImagePaths.TEST_EMP_ID,
        image_data=redis_client.get(cache_key)
    )
    
    assert isinstance(result, FaceVerificationResponse)
    assert result.verified is True
    assert result.similarity_score > 0.55
    assert result.distance < result.threshold

@pytest.mark.asyncio
async def test_verify_faces_different_person_with_cache(face_service, redis_client, cached_test_image):
    cache_key = "face:verify:different_person"
    cached_test_image(TestImagePaths.DIFFERENT_PERSON, cache_key)
    
    result = await face_service.verify_faces(
        emp_id=TestImagePaths.TEST_EMP_ID,
        image_data=redis_client.get(cache_key)
    )
    
    assert isinstance(result, FaceVerificationResponse)
    assert result.verified is False
    assert result.similarity_score < 0.55
    assert result.distance > result.threshold
