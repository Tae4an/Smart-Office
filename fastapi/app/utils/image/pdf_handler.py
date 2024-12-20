from typing import List, Tuple, Optional
import gc
import io
import cv2
import numpy as np
from PIL import Image
from PyPDF2 import PdfWriter, PdfReader
import pdf2image
from app.core.logging.logger import logger

class PDFHandler:
    """PDF 파일 처리를 위한 유틸리티 클래스"""

    @staticmethod
    def convert_to_images(pdf_bytes: bytes) -> Tuple[List[bytes], int]:
        """
        PDF 파일을 개별 이미지로 변환
        
        Args:
            pdf_bytes (bytes): PDF 파일 바이너리 데이터
            
        Returns:
            Tuple[List[bytes], int]: (이미지 바이너리 리스트, 총 페이지 수)
        """
        try:
            images = pdf2image.convert_from_bytes(pdf_bytes)
            return ([
                cv2.imencode('.jpg', cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR))[1].tobytes()
                for img in images
            ], len(images))
        except Exception as e:
            logger.error(f"PDF 변환 실패: {str(e)}")
            return [], 0

    @staticmethod
    def merge_images(image_list: List[bytes]) -> Optional[bytes]:
        """
        여러 이미지를 하나의 PDF로 병합
        
        Args:
            image_list (List[bytes]): 병합할 이미지 리스트
            
        Returns:
            Optional[bytes]: 병합된 PDF 데이터
        """
        try:
            if not image_list:
                return None

            pdf_writer = PdfWriter()
            chunk_size = 10  # 메모리 최적화를 위한 청크 크기
            
            for i in range(0, len(image_list), chunk_size):
                chunk = image_list[i:i + chunk_size]
                for img_bytes in chunk:
                    # 이미지를 PIL로 변환
                    img = Image.open(io.BytesIO(img_bytes))
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    # 이미지를 PDF 페이지로 변환
                    img_buf = io.BytesIO()
                    img.save(img_buf, format='PDF')
                    img_buf.seek(0)
                    
                    # PDF 페이지 추가
                    pdf_reader = PdfReader(img_buf)
                    pdf_writer.add_page(pdf_reader.pages[0])
                    gc.collect()

            # 최종 PDF 생성
            output_buf = io.BytesIO()
            pdf_writer.write(output_buf)
            output_buf.seek(0)
            return output_buf.getvalue()

        except Exception as e:
            logger.error(f"PDF 병합 실패: {str(e)}")
            return None

    @staticmethod
    def get_pdf_info(pdf_bytes: bytes) -> dict:
        """PDF 메타데이터 조회"""
        try:
            pdf = PdfReader(io.BytesIO(pdf_bytes))
            return {
                "pages": len(pdf.pages),
                "metadata": pdf.metadata
            }
        except Exception as e:
            logger.error(f"PDF 정보 조회 실패: {str(e)}")
            return {}
