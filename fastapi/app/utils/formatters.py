from datetime import datetime
from typing import Tuple, Dict, List, Union

BYTE_UNITS: List[str] = ['B', 'KB', 'MB', 'GB', 'TB']
BYTES_PER_UNIT: int = 1024
DATETIME_FORMAT: str = "%Y-%m-%d %H:%M:%S"
LOAD_AVG_PERIODS: List[str] = ['1분', '5분', '15분']

def format_bytes(bytes_value: Union[int, float]) -> str:
    """
    바이트 값을 사람이 읽기 쉬운 형식으로 변환

    Args:
        bytes_value: 변환할 바이트 값 (정수 또는 실수)

    Returns:
        str: 단위가 포함된 문자열 (예: "1.23MB")

    Raises:
        ValueError: 음수 값이 입력된 경우
    """
    if bytes_value < 0:
        raise ValueError("바이트 값은 음수가 될 수 없습니다")
        
    for unit in BYTE_UNITS:
        if bytes_value < BYTES_PER_UNIT:
            return f"{bytes_value:.2f}{unit}"
        bytes_value /= BYTES_PER_UNIT
    return f"{bytes_value:.2f}{BYTE_UNITS[-1]}"

def format_timestamp(timestamp: float) -> str:
    """
    UNIX 타임스탬프를 읽기 쉬운 날짜/시간 형식으로 변환

    Args:
        timestamp: UNIX 타임스탬프 값

    Returns:
        str: "YYYY-MM-DD HH:MM:SS" 형식의 문자열

    Raises:
        ValueError: 유효하지 않은 타임스탬프가 입력된 경우
    """
    try:
        return datetime.fromtimestamp(timestamp).strftime(DATETIME_FORMAT)
    except (ValueError, TypeError, OSError) as e:
        raise ValueError(f"유효하지 않은 타임스탬프입니다: {timestamp}") from e

def format_load_average(load_avg: Tuple[float, float, float]) -> Dict[str, str]:
    """
    시스템 부하 평균값을 구조화된 형식으로 변환

    Args:
        load_avg: (1분, 5분, 15분) 평균 부하를 담은 튜플

    Returns:
        Dict[str, str]: 각 기간별 부하 평균을 담은 딕셔너리
            (예: {"1분": "1.23", "5분": "1.45", "15분": "1.67"})

    Raises:
        ValueError: 튜플의 길이가 3이 아닌 경우
    """
    if len(load_avg) != 3:
        raise ValueError("로드 평균은 정확히 3개의 값이 필요합니다")
        
    return {
        period: f"{value:.2f}"
        for period, value in zip(LOAD_AVG_PERIODS, load_avg)
    }