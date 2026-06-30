"""
analysis.py
Pydantic v2 schemas for Resume Analysis requests, responses, and scoring details.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class AnalysisStartRequest(BaseModel):
    resume_id: uuid.UUID = Field(..., description="ID of the resume to analyze")
    job_description_ids: List[uuid.UUID] = Field(
        ...,
        min_length=1,
        description="IDs of job descriptions to compare/analyze against"
    )


class AnalysisCompareRequest(BaseModel):
    resume_id: uuid.UUID
    job_description_ids: List[uuid.UUID] = Field(..., min_length=1, max_length=5)


class AnalysisStatusResponse(BaseModel):
    id: uuid.UUID
    status: str = Field(..., description="Job status: pending, processing, complete, failed")
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AnalysisResponse(AnalysisStatusResponse):
    resume_id: uuid.UUID
    job_description_id: Optional[uuid.UUID] = None
    overall_score: Optional[float] = None
    ats_score: Optional[float] = None
    keyword_score: Optional[float] = None
    semantic_score: Optional[float] = None
    bullet_quality_score: Optional[float] = None
    formatting_score: Optional[float] = None
    role_detected: Optional[str] = None


class AnalysisDetailResponse(AnalysisResponse):
    ats_issues: Optional[List[Dict[str, Any]]] = None
    keyword_matches: Optional[List[Dict[str, Any]]] = None
    bullet_feedback: Optional[List[Dict[str, Any]]] = None
    gap_analysis: Optional[List[Dict[str, Any]]] = None
    score_breakdown: Optional[Dict[str, Any]] = None
