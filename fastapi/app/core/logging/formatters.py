import logging
from .utils import get_memory_usage
"""
로그 메시지 포맷터 모듈

주요 기능:
    - 로그 레벨별 다른 형식 적용
    - 밀리초 단위 타임스탬프 포함
    - 메모리 사용량 정보 추가
    - 프로세스 정보 포함 (디버그 레벨)

포맷 형식:
    1. 기본 형식 (INFO 이상):
        2024-01-01 12:34:56.789 [INFO] [file.py:123] 메시지

    2. 디버그 형식:
        2024-01-01 12:34:56.789 [DEBUG] [file.py:123] 메시지
        └─ [MainProcess:1234] [MEM:256MB]

사용:
    formatter = EnhancedFormatter()
    handler.setFormatter(formatter)
"""

class EnhancedFormatter(logging.Formatter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.basic_formatter = logging.Formatter(
            '%(asctime)s.%(msecs)03d [%(levelname)s] [%(filename)s:%(lineno)d] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        self.debug_formatter = logging.Formatter(
            '%(asctime)s.%(msecs)03d [%(levelname)s] [%(filename)s:%(lineno)d] %(message)s\n'
            '  └─ [%(processName)s:%(process)d] [MEM:%(memory)s]',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

    def format(self, record):
        record.memory = get_memory_usage()
        if record.levelno <= logging.DEBUG:
            return self.debug_formatter.format(record)
        return self.basic_formatter.format(record)