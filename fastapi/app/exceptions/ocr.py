from .base import BaseApplicationException
from typing import Optional, Dict, Any

class OCRError(BaseApplicationException):
    """OCR 처리 중 발생하는 일반적인 오류"""
    def __init__(self, message: str = "OCR 처리 중 오류가 발생했습니다"):
        super().__init__(500, message)

class FileProcessingError(BaseApplicationException):
    """파일 처리 중 발생하는 오류"""
    def __init__(self, message: str = "파일 처리 중 오류가 발생했습니다"):
        super().__init__(500, message)

class FileConversionError(BaseApplicationException):
    """파일 변환 중 발생하는 오류"""
    def __init__(self, message: str = "파일 변환 중 오류가 발생했습니다"):
        super().__init__(500, message)

class PDFProcessingError(BaseApplicationException):
    """PDF 처리 중 발생하는 오류"""
    def __init__(self, message: str = "PDF 처리 중 오류가 발생했습니다"):
        super().__init__(500, message)
