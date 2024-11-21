# app/utils/service_checks.py
from typing import Literal, Tuple, Dict, Any
import httpx
from app.core.config import settings
from app.core.logger import logger

async def check_llama_service() -> Tuple[Literal["connected", "error", "not_configured"], str, Dict[str, Any]]:
    """
    Llama 서비스의 상태와 실행 중인 모델 정보 확인

    Returns:
        Tuple[상태, 상세메시지, 모델정보]:
            - 상태: 'connected', 'error', 'not_configured' 중 하나
            - 상세메시지: 현재 상태에 대한 설명
            - 모델정보: 실행 중인 모델의 상세 정보를 포함하는 딕셔너리
                - model_name: 모델명
                - status: 모델 상태 ('running' 또는 'no_models_running')
                - details: 모델 상세 정보
                - size: 모델 크기 (GB 단위)
    
    Raises:
        Exception: API 요청 실패 시 발생하며 로깅 후 error 상태 반환
    """
    if not settings.OLLAMA_URL:
        return "not_configured", "OLLAMA_URL이 설정되지 않았습니다", {}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.OLLAMA_URL}/api/ps")
            if response.status_code != 200:
                return "error", f"서비스 응답 코드: {response.status_code}", {}

            data = response.json()
            model_info = {}
            
            if data.get("models") and len(data["models"]) > 0:
                model = data["models"][0]
                model_info = {
                    "model_name": model["name"],
                    "status": "running",
                    "details": model["details"],
                    "size": f"{model['size'] / (1024*1024*1024):.2f}GB"
                }
            else:
                model_info = {
                    "status": "no_models_running",
                    "details": {}
                }
            
            return "connected", "서비스가 정상 작동 중입니다", model_info

    except Exception as e:
        logger.error(f"Llama 서비스 연결 실패: {str(e)}")
        return "error", f"연결 실패: {str(e)}", {}