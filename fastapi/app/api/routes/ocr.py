from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from app.services.ocr_service import OCRService
from app.models.ocr import OCRResponse, OCRBatchResponse
from app.models.error import ErrorResponse
from app.exceptions import (
    OCRError, FileProcessingError, APIError,
    InvalidFormatError, TimeoutError, ValidationError
)
from app.utils.cache_handler import cache_handler
from app.core.logging.logger import logger
from typing import List

router = APIRouter()
ocr_service = OCRService()

@router.post(
    "/process",
    response_model=OCRResponse,
    responses={
        200: {"model": OCRResponse, "description": "성공적으로 처리됨"},
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 오류"}
    }
)
async def process_document(
    filename: str,
    background_tasks: BackgroundTasks
) -> OCRResponse:
    """
    문서 이미지의 OCR 처리를 수행합니다.
    
    처리 과정:
    1. GCS에서 파일 로드
    2. 이미지 전처리 및 OCR
    3. 결과 캐시 정리
    
    Args:
        filename (str): GCS에 저장된 파일명
        background_tasks: 백그라운드 작업 핸들러
        
    Returns:
        OCRResponse: OCR 처리 결과
            {
                "status": str,
                "data": dict,
                "error": Optional[str]
            }
            
    Raises:
        HTTPException: 처리 실패시 (400, 500)
    """
    try:
        result = await ocr_service.process_document(filename)
        background_tasks.add_task(cache_handler.delete_file, f"pdf:{filename}")
        return result
    except (OCRError, FileProcessingError, APIError,
            InvalidFormatError, TimeoutError, ValidationError) as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.detail, "code": e.status_code}
        )
    except Exception as e:
        logger.error(f"OCR 처리 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"message": "OCR 처리 중 오류가 발생했습니다", "code": 500}
        )

@router.post(
    "/ocr",
    response_model=OCRResponse,
    responses={
        200: {"model": OCRResponse},
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    summary="단일 파일 OCR 처리",
    description="업로드된 파일에서 텍스트를 추출합니다."
)
async def process_ocr(file: UploadFile = File(...)):
    try:
        result = await ocr_service.process_file(file)
        return OCRResponse(
            text=result.get("text", ""),
            metadata=result.get("metadata"),
            confidence=result.get("confidence")
        )
    except (OCRError, FileProcessingError) as e:
        return OCRResponse(status="error", error=str(e))

@router.post(
    "/ocr/batch",
    response_model=OCRBatchResponse,
    responses={
        200: {"model": OCRBatchResponse},
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    summary="여러 파일 OCR 처리",
    description="여러 파일을 일괄적으로 처리합니다."
)
async def process_batch_ocr(files: List[UploadFile] = File(...)):
    results = []
    failed = 0
    
    for file in files:
        try:
            result = await ocr_service.process_file(file)
            results.append(OCRResponse(
                text=result.get("text", ""),
                metadata=result.get("metadata"),
                confidence=result.get("confidence")
            ))
        except (OCRError, FileProcessingError) as e:
            failed += 1
            results.append(OCRResponse(status="error", error=str(e)))
    
    return OCRBatchResponse(
        results=results,
        total=len(files),
        processed=len(files) - failed,
        failed=failed
    )
