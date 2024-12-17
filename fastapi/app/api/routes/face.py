from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.core.logging.logger import logger
from app.services.face_service import FaceService, CustomHTTPException
from app.core.handlers.cache import RedisCacheHandler
from app.models.face_detection import FaceVerificationResponse
import asyncio

"""
얼굴 인식 검증 API 라우터

Features:
    - Redis 캐시 기반 이미지 처리
    - 분산 락을 통한 동시성 제어
    - 비동기 처리와 백그라운드 작업
    - 자동 캐시 정리
"""

# 상수 정의
CACHE_KEY_PREFIX = "face:verify:"
CACHE_TIMEOUT = 5.0
LOCK_TIMEOUT = 30

# 응답 예제
RESPONSE_EXAMPLE = {
    "verified": True,
    "distance": 0.2116,
    "threshold": 0.45,
    "model": "Facenet512",
    "similarity_score": 0.7884
}

router = APIRouter(prefix="", tags=["face"])
face_service = FaceService()
cache_handler = RedisCacheHandler()

@router.post(
    "/verify/{emp_id}",
    response_model=FaceVerificationResponse,
    responses={
        200: {
            "description": "얼굴 검증 성공",
            "content": {"application/json": {"example": RESPONSE_EXAMPLE}}
        },
        404: {"description": "이미지를 찾을 수 없음"},
        409: {"description": "동시성 제어 충돌"},
        504: {"description": "시간 초과"}
    }
)
async def verify_face(emp_id: str, background_tasks: BackgroundTasks) -> FaceVerificationResponse:
    """
    ## 직원 얼굴 검증 엔드포인트

        Parameters:
            emp_id (str): 검증할 직원의 ID
            background_tasks: 백그라운드 작업 객체

        Returns:
            FaceVerificationResponse: 얼굴 검증 결과
                - verified: 일치 여부
                - similarity_score: 유사도 점수 (0~1)
                - distance: 얼굴 특징 간 거리
                - threshold: 판단 기준값
                - model: 사용된 모델명

        Raises:
            HTTPException (404): 캐시된 이미지 없음
            HTTPException (409): 동시 검증 시도
            HTTPException (504): 시간 초과
            
        Note:
            - Redis에 캐시된 이미지가 있어야 함
            - 검증 후 캐시 자동 정리
            - 5초 타임아웃 적용
    """
    cache_key = f"{CACHE_KEY_PREFIX}{emp_id}"
    lock_acquired = False
    
    try:
        # 락 획득 재시도 로직 추가
        for attempt in range(3):
            if await cache_handler.acquire_lock(cache_key):
                lock_acquired = True
                break
            await asyncio.sleep(0.5)
            
        if not lock_acquired:
            raise HTTPException(409, "다른 검증 작업이 진행 중입니다.")

        try:
            cached_image = await asyncio.wait_for(
                cache_handler.get_file(cache_key),
                timeout=CACHE_TIMEOUT
            )
        except asyncio.TimeoutError:
            raise HTTPException(504, "캐시 조회 시간 초과")

        if not cached_image:
            raise HTTPException(404, "캐시된 이미지를 찾을 수 없습니다.")

        result = await face_service.verify_faces(emp_id, cached_image)
        
        # 즉시 캐시 정리 시도 후 실패시 백그라운드로 재시도
        try:
            await asyncio.wait_for(
                cache_handler.delete_file(cache_key),
                timeout=1.0
            )
        except:
            background_tasks.add_task(cache_handler.delete_file, cache_key)
            
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"얼굴 검증 처리 중 오류 발생: {str(e)}")
        raise HTTPException(500, "얼굴 검증 처리 중 오류가 발생했습니다.")
    finally:
        if lock_acquired:
            try:
                await cache_handler.release_lock(cache_key)
            except Exception as e:
                logger.error(f"락 해제 실패: {str(e)}")

def handle_verification_error(error: Exception, cache_key: str) -> None:
    """검증 오류 처리"""
    if isinstance(error, asyncio.TimeoutError):
        raise HTTPException(504, "캐시 조회 시간 초과")
    elif isinstance(error, CustomHTTPException):
        raise HTTPException(error.status_code, error.detail)
    elif isinstance(error, HTTPException):
        raise error
    else:
        raise HTTPException(500, "얼굴 검증 처리 중 오류가 발생했습니다.")
