from typing import Optional, Dict, Any

class BaseApplicationException(Exception):
    """애플리케이션 기본 예외"""
    def __init__(self, status_code: int, detail: str, data: Optional[Dict[str, Any]] = None):
        self.status_code = status_code
        self.detail = detail
        self.data = data or {}
        super().__init__(self.detail)
