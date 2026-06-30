"""
exceptions.py
Custom exception classes for Resume Analyzer Pro.
These exceptions are handled globally to return consistent error response schemas.
"""

from typing import Any, Dict, Optional


class AppBaseException(Exception):
    """Base application exception."""
    status_code: int = 500
    code: str = "INTERNAL_SERVER_ERROR"
    detail: str = "An unexpected error occurred."

    def __init__(
        self,
        detail: Optional[str] = None,
        code: Optional[str] = None,
        status_code: Optional[int] = None,
        headers: Optional[Dict[str, Any]] = None
    ) -> None:
        super().__init__(detail or self.detail)
        if detail:
            self.detail = detail
        if code:
            self.code = code
        if status_code is not None:
            self.status_code = status_code
        self.headers = headers


class EntityNotFoundException(AppBaseException):
    """Exception raised when a requested resource is not found."""
    status_code: int = 404
    code: str = "NOT_FOUND"
    detail: str = "Resource not found."


class AuthenticationException(AppBaseException):
    """Exception raised for credential validation or login failures."""
    status_code: int = 401
    code: str = "UNAUTHENTICATED"
    detail: str = "Could not validate credentials."


class AuthorizationException(AppBaseException):
    """Exception raised when a user lacks permission for a resource."""
    status_code: int = 403
    code: str = "UNAUTHORIZED"
    detail: str = "Permission denied."


class DuplicateEntityException(AppBaseException):
    """Exception raised when an entity already exists (e.g. unique constraint)."""
    status_code: int = 409
    code: str = "CONFLICT"
    detail: str = "Resource already exists."


class ValidationException(AppBaseException):
    """Exception raised when business rules validation fails."""
    status_code: int = 422
    code: str = "VALIDATION_FAILED"
    detail: str = "Invalid input data."


class NLPProcessingException(AppBaseException):
    """Exception raised when parsing or processing document text fails."""
    status_code: int = 500
    code: str = "NLP_PROCESSING_FAILED"
    detail: str = "Error occurred during NLP analysis."
