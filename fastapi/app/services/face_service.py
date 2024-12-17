from deepface import DeepFace
from app.models.face_detection import FaceVerificationResponse
from app.core.logging.logger import logger
import os
import numpy as np
import cv2
import asyncio
from typing import Optional, Dict, Any

"""
DeepFace 기반 얼굴 인식 서비스

Features:
    - 얼굴 검증 (1:1 매칭)
    - 비동기 이미지 처리
    - 자동 타임아웃 처리
    - 상세 로깅
"""

class CustomHTTPException(Exception):
    """사용자 정의 HTTP 예외"""
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)

class FaceService:
    """얼굴 인식 및 검증 서비스"""
    
    def __init__(self, base_path: Optional[str] = None):
        """
        FaceService 초기화

        Args:
            base_path (str, optional): 직원 이미지가 저장된 기본 경로

        Properties:
            model_name (str): 얼굴 인식 모델
            distance_metric (str): 거리 계산 방식
            detector_backend (str): 얼굴 검출 백엔드
            threshold (float): 일치 판단 임계값
            verification_timeout (int): 검증 제한 시간(초)
        """
        self.model_name = "Facenet512"
        self.distance_metric = "cosine"
        self.detector_backend = "retinaface"
        self.threshold = 0.45
        self.verification_timeout = 30
        self.base_image_path = base_path or "tmp/img/deepface/emp"

    async def verify_faces(self, emp_id: str, image_data: bytes) -> FaceVerificationResponse:
        """
        얼굴 검증 수행

        Args:
            emp_id (str): 직원 ID
            image_data (bytes): 검증할 이미지 데이터

        Returns:
            FaceVerificationResponse: 검증 결과

        Raises:
            CustomHTTPException: 이미지 로드/검증 실패
            TimeoutError: 처리 시간 초과
        """
        try:
            async with asyncio.timeout(self.verification_timeout):
                stored_image = self._get_stored_image_path(emp_id)
                input_image = await self._convert_bytes_to_image(image_data)
                
                try:
                    result = await self._verify_face_with_deepface(stored_image, input_image)
                    return self._create_verification_response(result, emp_id)
                finally:
                    # 메모리 정리
                    del input_image
                    gc.collect()

        except asyncio.TimeoutError as e:
            logger.error(f"얼굴 검증 타임아웃 - 직원 ID: {emp_id}")
            raise CustomHTTPException(504, "얼굴 검증 처리 시간이 초과되었습니다.") from e
        except Exception as e:
            self._handle_verification_error(e, emp_id)

    def _get_stored_image_path(self, emp_id: str) -> str:
        path = os.path.join(self.base_image_path, f"{emp_id}.jpg")
        if not os.path.exists(path):
            raise CustomHTTPException(404, f"직원 ID {emp_id}의 이미지를 찾을 수 없습니다.")
        return path

    async def _convert_bytes_to_image(self, image_data: bytes) -> np.ndarray:
        """이미지 변환 작업을 비동기로 처리"""
        return await asyncio.to_thread(
            cv2.imdecode,
            np.frombuffer(image_data, np.uint8),
            cv2.IMREAD_COLOR
        )

    async def _verify_face_with_deepface(self, img1_path: str, img2_path: np.ndarray) -> Dict[str, Any]:
        try:
            return await asyncio.to_thread(
                DeepFace.verify,
                img1_path=img1_path,
                img2_path=img2_path,
                model_name=self.model_name,
                distance_metric=self.distance_metric,
                detector_backend=self.detector_backend,
                align=True,
                enforce_detection=True
            )
        except ValueError as e:
            logger.error(f"얼굴 검출 실패: {str(e)}")
            raise CustomHTTPException(400, "얼굴을 찾을 수 없거나 인식할 수 없습니다.")

    def _create_verification_response(self, result: Dict[str, Any], emp_id: str) -> FaceVerificationResponse:
        similarity_score = 1 - result["distance"]
        verified = result["distance"] < self.threshold
        self._log_verification_result(emp_id, result["distance"], similarity_score, verified)
        return FaceVerificationResponse(
            verified=verified,
            distance=result["distance"],
            threshold=self.threshold,
            model=self.model_name,
            similarity_score=similarity_score
        )

    def _handle_verification_error(self, error: Exception, emp_id: str) -> None:
        """검증 오류 처리"""
        if isinstance(error, asyncio.TimeoutError):
            logger.error(f"얼굴 검증 타임아웃 - 직원 ID: {emp_id}")
            raise CustomHTTPException(504, "얼굴 검증 처리 시간이 초과되었습니다.")
        elif isinstance(error, CustomHTTPException):
            raise error
        else:
            logger.error(f"얼굴 검증 실패 (직원 ID: {emp_id}) - {str(error)}")
            raise CustomHTTPException(500, "얼굴 검증 처리 중 오류가 발생했습니다.")

    def _log_verification_result(self, emp_id: str, distance: float, similarity: float, verified: bool):
        logger.info("-" * 50)
        logger.info(f"얼굴 검증 결과 - 직원 ID: {emp_id}")
        logger.info(f"거리: {distance:.4f}")
        logger.info(f"유사도: {similarity:.4f}")
        logger.info(f"검증 결과: {'일치' if verified else '불일치'}")
        logger.info("-" * 50)
