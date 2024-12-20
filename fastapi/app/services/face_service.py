import os
import gc
import asyncio
import base64
from typing import Optional, Dict, Any
import cv2
import numpy as np
from deepface import DeepFace

from app.core.logging.logger import logger
from app.models.face_detection import FaceVerificationResponse
from app.exceptions import (
    FaceError, FaceDetectionError, FaceVerificationError,
    ImageProcessingError, StoredImageNotFound, VerificationTimeout,
    ValidationError
)

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
    """
    DeepFace 기반 얼굴 인식 서비스
    
    주요 기능:
    - 1:1 얼굴 검증
    - 이미지 전처리
    - 결과 정규화
    - 자동 타임아웃
    
    속성:
        model_name (str): 사용할 얼굴 인식 모델명
        distance_metric (str): 거리 계산 방식
        detector_backend (str): 얼굴 검출 백엔드
        threshold (float): 일치 판단 임계값
    """
    
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
        self.distance_metric = "euclidean"
        self.detector_backend = "retinaface"
        self.threshold = 20
        self.verification_timeout = 30
        self.base_image_path = base_path or "tmp/img/deepface/emp"

    async def verify_faces(self, emp_id: str, image_data: bytes) -> FaceVerificationResponse:
        """
        두 얼굴 이미지의 일치 여부를 검증합니다.
        
        처리 단계:
        1. 저장된 직원 이미지 로드
        2. 입력 이미지 전처리
        3. DeepFace 검증 수행
        4. 결과 정규화 및 검증
        
        Args:
            emp_id (str): 직원 ID
            image_data (bytes): 검증할 이미지 데이터
            
        Returns:
            FaceVerificationResponse: 검증 결과
                {
                    verified: bool,
                    distance: float,
                    threshold: float,
                    similarity_score: float
                }
                
        Raises:
            FaceDetectionError: 얼굴 검출 실패
            FaceVerificationError: 검증 실패
            VerificationTimeout: 처리 시간 초과
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

        except asyncio.TimeoutError:
            raise VerificationTimeout()
        except Exception as e:
            self._handle_verification_error(e, emp_id)

    def _get_stored_image_path(self, emp_id: str) -> str:
        path = os.path.join(self.base_image_path, f"{emp_id}.jpg")
        if not os.path.exists(path):
            raise StoredImageNotFound(emp_id)
        return path

    async def _convert_bytes_to_image(self, image_data: bytes) -> np.ndarray:
        """이미지 변환 작업을 비동기로 처리"""
        try:
            if not image_data:
                raise ValidationError("image", "이미지 데이터가 비어있습니다")
                
            # Base64 문자열인 경우 디코딩
            if image_data.startswith(b'/9j/'):
                logger.debug("Base64 인코딩된 JPEG 이미지 감지")
                try:
                    # Base64 디코딩
                    image_data = base64.b64decode(image_data)
                except Exception as e:
                    logger.error(f"Base64 디코딩 실패: {str(e)}")
                    
            logger.debug(f"이미지 변환 시작 - 데이터 크기: {len(image_data)} bytes")
            logger.debug(f"데이터 시작 부분 (hex): {image_data[:20].hex()}")
            
            try:
                # numpy array로 변환
                nparr = np.frombuffer(image_data, np.uint8)
                logger.debug(f"numpy array 변환 완료 - shape: {nparr.shape}")
                
                # OpenCV로 디코딩
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is None:
                    # 이미지 데이터 시작 부분 출력 (디버깅용)
                    preview = image_data[:30].hex()
                    logger.error(f"이미지 디코딩 실패 - 데이터 미리보기 (hex): {preview}")
                    raise CustomHTTPException(400, "이미지를 디코딩할 수 없습니다.")
                    
                logger.debug(f"이미지 디코딩 완료 - shape: {img.shape}")
                return img
                
            except Exception as e:
                logger.error(f"이미지 변환 중 오류: {str(e)}")
                raise CustomHTTPException(400, "이미지 데이터 처리 중 오류가 발생했습니다.")
            
        except CustomHTTPException:
            raise
        except Exception as e:
            logger.error(f"이미지 변환 실패: {str(e)}")
            raise ImageProcessingError(str(e))

    async def _verify_face_with_deepface(self, img1_path: str, img2_path: np.ndarray) -> Dict[str, Any]:
        try:
            # 저장된 이미지 로드
            img1 = cv2.imread(img1_path)
            if img1 is None:
                logger.error(f"저장된 이미지 로드 실패: {img1_path}")
                raise CustomHTTPException(404, "저장된 직원 이미지를 읽을 수 없습니다.")
                
            logger.debug(f"이미지 크기 비교 - 저장된 이미지: {img1.shape}, 입력 이미지: {img2_path.shape}")

            # 이미지 크기 비율 계산 및 리사이징
            size_ratio = (img1.shape[0] * img1.shape[1]) / (img2_path.shape[0] * img2_path.shape[1])
            
            # 크기 차이가 20배 이상일 경우에만 리사이징
            if size_ratio > 20 or size_ratio < 0.05:
                logger.info("이미지 크기 차이가 큼 - 리사이징 수행")
                # 더 작은 이미지를 기준으로 리사이징
                if size_ratio > 1:
                    # 저장된 이미지가 더 큰 경우
                    target_height = int(img2_path.shape[0] * 1.5)  # 50% 더 크게
                    target_width = int(img2_path.shape[1] * 1.5)
                    img1 = cv2.resize(img1, (target_width, target_height), interpolation=cv2.INTER_AREA)
                else:
                    # 입력 이미지가 더 큰 경우
                    target_height = int(img1.shape[0] * 1.5)
                    target_width = int(img1.shape[1] * 1.5)
                    img2_path = cv2.resize(img2_path, (target_width, target_height), interpolation=cv2.INTER_AREA)
                    
                logger.debug(f"리사이징 후 크기 - 저장된 이미지: {img1.shape}, 입력 이미지: {img2_path.shape}")

            # DeepFace 검증 수행 시 파라미터 보강
            result = await asyncio.to_thread(
                DeepFace.verify,
                img1_path=img1,
                img2_path=img2_path,
                model_name=self.model_name,
                distance_metric=self.distance_metric,
                detector_backend=self.detector_backend,
                align=True,  # 얼굴 정렬 수행
                enforce_detection=True,  # 얼굴 검출 강제
                normalization="Facenet",  # Facenet 방식의 정규화
            )
            
            # 추가 검증: 얼굴이 제대로 검출되었는지 확인
            if not result.get("facial_areas"):
                raise CustomHTTPException(400, "얼굴이 제대로 검출되지 않았습니다")

            return result
        except ValueError as e:
            logger.error(f"얼굴 검출 실패: {str(e)}")
            raise CustomHTTPException(400, "얼굴을 찾을 수 없거나 인식할 수 없습니다.")
        except Exception as e:
            logger.error(f"DeepFace 처리 중 오류: {str(e)}")
            raise CustomHTTPException(500, "얼굴 인식 처리 중 오류가 발생했습니다.")

    def _create_verification_response(self, result: Dict[str, Any], emp_id: str) -> FaceVerificationResponse:
        distance = float(result["distance"])
        
        # euclidean 거리 기반 유사도 계산 수정
        max_distance = 50   # 최대 허용 거리를 50으로 낮춤
        min_distance = 0    # 최소 허용 거리를 0으로 설정

        # 거리가 멀수록 다른 사람
        if distance > max_distance:
            verified = False
            similarity_score = 0
        else:
            # 정규화된 유사도 계산 (0~1 범위)
            # 거리가 가까울수록 유사도가 높아짐
            similarity_score = 1 - (distance / max_distance)
            verified = distance < self.threshold

        # 디버그 로깅
        logger.debug(f"""
        얼굴 검증 상세 결과:
        - 모델: Facenet512
        - 얼굴 특징 거리: {distance:.4f}
        - 정규화된 유사도: {similarity_score:.4f}
        - 임계값: {self.threshold}
        - 검증 결과: {'일치' if verified else '불일치'}
        - 얼굴 영역: {result.get('facial_areas', '없음')}
        """)

        self._log_verification_result(emp_id, distance, similarity_score, verified)
        return FaceVerificationResponse(
            verified=verified,
            distance=distance,
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
        logger.info(
            f"얼굴 검증 결과: [직원 ID: {emp_id}] "
            f"거리: {distance:.4f}, 유사도: {similarity:.4f}, "
            f"임계값: {self.threshold:.4f}, "
            f"결과: {'일치' if verified else '불일치'}"
        )