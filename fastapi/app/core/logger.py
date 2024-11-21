"""
애플리케이션 전반의 로깅을 설정하고 관리하는 모듈

로그 설정:
    - 로그 레벨: INFO
    - 시간 형식: YYYY-MM-DD HH:MM:SS
    - 로그 형식: 시간 - 로그레벨 - 메시지
"""
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)