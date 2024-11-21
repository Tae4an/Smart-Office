from fastapi import APIRouter
from app.core.config import settings
from app.utils.formatters import format_bytes, format_timestamp, format_load_average
from app.utils.service_checks import check_llama_service
import psutil

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    시스템과 서비스의 전반적인 상태 확인

    Returns:
        Dict: 시스템 및 서비스 상태 정보
            - status: 전체 시스템 상태 ("healthy" 또는 "unhealthy")
            - version: 애플리케이션 버전
            - system: 시스템 리소스 상태
                - cpu_usage: CPU 사용률 (%)
                - memory_usage: 메모리 사용률 (%)
                - disk_usage: 디스크 사용률 (%)
                - swap_usage: 스왑 메모리 사용률 (%)
                - network: 네트워크 트래픽 정보
                - uptime: 시스템 가동 시간 정보
                - load_average: 시스템 부하 평균
                - processes: 실행 중인 프로세스 수
            - services: 외부 서비스 상태
                - llama: LLM 서비스 상태 정보
    """
    cpu_percent = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    swap = psutil.swap_memory()
    net_io = psutil.net_io_counters()
    boot_time = psutil.boot_time()
    load_avg = psutil.getloadavg()
    processes = len(psutil.pids())
    
    service_status, details, model_info = await check_llama_service()
    
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "system": {
            "cpu_usage": f"{cpu_percent}%",
            "memory_usage": f"{memory.percent}%",
            "disk_usage": f"{disk.percent}%",
            "swap_usage": f"{swap.percent}%",
            "network": {
                "sent": format_bytes(net_io.bytes_sent),
                "received": format_bytes(net_io.bytes_recv)
            },
            "uptime": {
                "boot_time": format_timestamp(boot_time)
            },
            "load_average": format_load_average(load_avg),
            "processes": processes
        },
        "services": {
            "llama": {
                "status": service_status,
                "details": details,
                "model": model_info
            }
        }
    }