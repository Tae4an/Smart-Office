import cv2
import numpy as np
from app.core.logging.logger import logger
from PIL import Image
from typing import Tuple
import os

class ImageProcessor:
    """
    문서 이미지 전처리를 위한 클래스
    
    문서의 외곽선을 감지하고 투시 변환을 적용하여 정면 이미지로 변환
    
    Methods:
        preprocess_document: 문서 이미지 전처리 수행
        _order_points: 코너 포인트 정렬
        _apply_perspective_transform: 투시 변환 적용
    """
    
    def __init__(self):
        self.logger = logger

    def preprocess_document(self, image):
        """
        문서 이미지 전처리를 수행합니다.
        
        Args:
            image (numpy.ndarray): 입력 이미지
            
        Returns:
            numpy.ndarray: 전처리된 이미지 또는 원본 이미지
        """
        try:
            # 원본 이미지 복사
            processed = image.copy()
            
            # 그레이스케일 변환 및 노이즈 제거
            gray = cv2.cvtColor(processed, cv2.COLOR_BGR2GRAY)
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # 외곽선 검출
            edges = cv2.Canny(denoised, 100, 200)
            
            # 문서 외곽선 찾기
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                self.logger.warning("문서 외곽선을 찾을 수 없습니다. 기본 전처리만 적용합니다.")
                return self._enhance_image_quality(processed)
            
            # 가장 큰 외곽선 선택
            doc_contour = max(contours, key=cv2.contourArea)
            
            # 코너 포인트 근사화
            epsilon = 0.02 * cv2.arcLength(doc_contour, True)
            corners = cv2.approxPolyDP(doc_contour, epsilon, True)
            
            if len(corners) != 4:
                self.logger.warning("문서의 4개 코너를 찾을 수 없습니다. 기본 전처리만 적용합니다.")
                return self._enhance_image_quality(processed)
            
            # 투시 변환 적용
            corners = self._order_points(corners.reshape(4, 2))
            processed = self._apply_perspective_transform(processed, corners)
            
            # 이미지 품질 개선만 적용
            return self._enhance_image_quality(processed)
            
        except Exception as e:
            self.logger.error(f"이미지 전처리 중 오류 발생: {str(e)}")
            return image

    def _enhance_image_quality(self, image):
        """
        이미지 품질을 개선합니다.
        
        Args:
            image (numpy.ndarray): 입력 이미지
            
        Returns:
            numpy.ndarray: 품질이 개선된 이미지
        """
        try:
            # 1. 노이즈 제거 (최소한의 처리)
            denoised = cv2.fastNlMeansDenoisingColored(
                image,
                None,
                h=3,          # 필터 강도 최소화
                hColor=3,     # 컬러 필터 강도 최소화
                templateWindowSize=7,
                searchWindowSize=21
            )
            
            # 2. 대비 개선 (약한 수준)
            lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8,8))
            l = clahe.apply(l)
            enhanced = cv2.merge([l, a, b])
            enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
            
            return enhanced
            
        except Exception as e:
            self.logger.error(f"이미지 품질 개선 중 오류 발생: {str(e)}")
            return image

    def _order_points(self, pts):
        """
        4개의 코너 포인트를 시계방향으로 정렬합니다.
        
        Args:
            pts (numpy.ndarray): 정렬할 4개의 코너 포인트
            
        Returns:
            numpy.ndarray: 정렬된 코너 포인트 [좌상, 우상, 우하, 좌하]
        """
        rect = np.zeros((4, 2), dtype=np.float32)
        
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]  # top-left
        rect[2] = pts[np.argmax(s)]  # bottom-right
        
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]  # top-right
        rect[3] = pts[np.argmax(diff)]  # bottom-left
        
        return rect

    def _apply_perspective_transform(self, image, corners):
        """
        이미지에 투시 변환을 적용합니다.
        
        Args:
            image (numpy.ndarray): 원본 이미지
            corners (numpy.ndarray): 변환에 사용할 4개의 코너 포인트
            
        Returns:
            numpy.ndarray: 투시 변환이 적용된 이미지
        """
        (tl, tr, br, bl) = corners
        
        # 결과 이미지의 최대 너비 계산
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        max_width = max(int(widthA), int(widthB))
        
        # 결과 이미지의 최대 높이 계산
        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        max_height = max(int(heightA), int(heightB))
        
        # 변환 후 좌표
        dst = np.array([
            [0, 0],
            [max_width - 1, 0],
            [max_width - 1, max_height - 1],
            [0, max_height - 1]
        ], dtype=np.float32)
        
        # 투시 변환 행렬 계산 및 적용
        matrix = cv2.getPerspectiveTransform(corners, dst)
        warped = cv2.warpPerspective(image, matrix, (max_width, max_height))
        
        return warped

    @staticmethod
    def load_image(image_path: str) -> np.ndarray:
        """이미지를 로드하여 numpy 배열로 변환"""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"이미지를 찾을 수 없습니다: {image_path}")
        
        image = Image.open(image_path)
        return np.array(image)

    @staticmethod
    def validate_image(image_path: str) -> Tuple[bool, str]:
        """이미지 파일 유효성 검사"""
        try:
            img = Image.open(image_path)
            img.verify()
            return True, "이미지가 유효합니다"
        except Exception as e:
            return False, str(e)