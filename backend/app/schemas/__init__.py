"""
__init__.py
Exports all Pydantic schemas for easy reference throughout the app.
"""

from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    Token,
    TokenPayload,
)
from app.schemas.resume import (
    ResumeBase,
    ResumeResponse,
    ResumeDetailResponse,
    ResumeVersionResponse,
)
from app.schemas.job_description import (
    JobDescriptionBase,
    JobDescriptionCreate,
    JobDescriptionResponse,
)
from app.schemas.analysis import (
    AnalysisStartRequest,
    AnalysisCompareRequest,
    AnalysisStatusResponse,
    AnalysisResponse,
    AnalysisDetailResponse,
)

__all__ = [
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "Token",
    "TokenPayload",
    "ResumeBase",
    "ResumeResponse",
    "ResumeDetailResponse",
    "ResumeVersionResponse",
    "JobDescriptionBase",
    "JobDescriptionCreate",
    "JobDescriptionResponse",
    "AnalysisStartRequest",
    "AnalysisCompareRequest",
    "AnalysisStatusResponse",
    "AnalysisResponse",
    "AnalysisDetailResponse",
]
