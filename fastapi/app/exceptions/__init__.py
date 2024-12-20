from .base import BaseApplicationException
from .auth import (
    AuthError,
    TokenError,
    TokenExpiredError,
    TokenInvalidError,
    TokenMissingError,
    PermissionError
)
from .face import (
    FaceError,  # FaceError 추가
    FaceException,
    FaceDetectionError,
    FaceVerificationError,
    ImageProcessingError,
    StoredImageNotFound,
    VerificationTimeout
)
from .validation import (
    ValidationError,
    FileValidationError,
    PayloadValidationError,
    SizeExceededError,
    InvalidFormatError  # InvalidFormatError 추가
)
from .external import (
    ExternalServiceError,
    APIError,
    APIRequestError,
    ServiceUnavailableError,
    TimeoutError
)
from .security import (
    SecurityError,
    InvalidCredentialsError,
    AccessDeniedError,
    RateLimitExceededError
)
from .ocr import (  # OCR 관련 예외 추가
    OCRError,
    PDFProcessingError,
    FileProcessingError,
    FileConversionError
)
from .llama import (
    LlamaError,
    ModelNotFoundError,
    ModelLoadError,
    CompletionError,
    ContextLengthExceededError,
    ServiceUnavailableError
)

__all__ = [
    'BaseApplicationException',
    # Auth
    'AuthError',
    'TokenError',
    'TokenExpiredError',
    'TokenInvalidError',
    'TokenMissingError',
    'PermissionError',
    # Face
    'FaceError',  # FaceError 추가
    'FaceException',
    'FaceDetectionError',
    'FaceVerificationError',
    'ImageProcessingError',
    'StoredImageNotFound',
    'VerificationTimeout',
    # Validation
    'ValidationError',
    'FileValidationError',
    'PayloadValidationError',
    'SizeExceededError',
    'InvalidFormatError',
    # External
    'ExternalServiceError',
    'APIError',
    'APIRequestError',
    'ServiceUnavailableError',
    'TimeoutError',
    # Security
    'SecurityError',
    'InvalidCredentialsError',
    'AccessDeniedError',
    'RateLimitExceededError',
    # OCR
    'OCRError',
    'PDFProcessingError',
    'FileProcessingError',
    'FileConversionError',
    # Llama
    'LlamaError',
    'ModelNotFoundError',
    'ModelLoadError',
    'CompletionError',
    'ContextLengthExceededError',
    'ServiceUnavailableError',
]
