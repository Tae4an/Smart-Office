from fastapi import APIRouter, HTTPException
from app.services.ocr_service import OCRService

router = APIRouter()
ocr_service = OCRService()

<<<<<<< Updated upstream
@router.post("/process")
async def process_document(filename: str):
=======
@router.post(
    "/process",
    response_model=OCRResponse,
    responses={
        200: {"model": OCRResponse},
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def process_document(
    filename: str,
    background_tasks: BackgroundTasks
) -> OCRResponse:
>>>>>>> Stashed changes
    """
    ## 문서 이미지에 대해 OCR 처리를 수행하는 엔드포인트
    
        Args:
            filename (str): GCS에 저장된 이미지 파일명
            
        Returns:
            dict: OCR 처리 결과
                {
                    "status": "success",
                    "data": {
                        "apiVersion": str,
                        "confidence": float,
                        "metadata": dict,
                        "mimeType": str,
                        "text": str,
                        ...
                    }
                }
                
        Raises:
            HTTPException: OCR 처리 중 오류 발생 시 (500)
        
        Note:
            - 파일은 GCS의 설정된 경로에 미리 업로드되어 있어야 함
            - 전처리된 이미지는 processed/ 경로에 자동 저장됨
    """
    try:
        result = await ocr_service.process_document(filename)
<<<<<<< Updated upstream
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
=======
        background_tasks.add_task(cache_handler.delete_file, f"pdf:{filename}")
        return OCRResponse(**result)  # 서비스의 응답을 그대로 모델로 변환
    except (OCRError, FileProcessingError, APIError,
            InvalidFormatError, TimeoutError) as e:
        return OCRResponse(
            status="error",
            error=str(e)
        )
    except Exception as e:
        logger.error(f"OCR 처리 중 오류 발생: {str(e)}")
        return OCRResponse(
            status="error",
            error="OCR 처리 중 오류가 발생했습니다"
        )

@router.post(
    "/ocr",
    response_model=OCRResponse
)
async def process_ocr(file: UploadFile = File(...)) -> OCRResponse:
    """단일 파일 OCR 처리"""
    try:
        result = await ocr_service.process_file(file)
        return OCRResponse(
            status="success",
            data=result
        )
    except Exception as e:
        return OCRResponse(
            status="error",
            error=str(e)
        )

@router.post(
    "/ocr/batch",
    response_model=OCRBatchResponse
)
async def process_batch_ocr(files: List[UploadFile] = File(...)) -> OCRBatchResponse:
    """여러 파일 OCR 처리"""
    results = []
    failed = 0
    
    for file in files:
        try:
            result = await ocr_service.process_file(file)
            results.append(result)
        except Exception as e:
            failed += 1
            results.append({"error": str(e)})
    
    return OCRBatchResponse(
        status="success",
        data=results,
        total=len(files),
        processed=len(files) - failed,
        failed=failed
    )
>>>>>>> Stashed changes
