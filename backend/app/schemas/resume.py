"""
resume.py
Pydantic v2 schemas for Resume document serialization.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field, ConfigDict


class ResumeBase(BaseModel):
    filename: str = Field(..., max_length=255, description="Name of the uploaded resume file")


class ResumeResponse(ResumeBase):
    id: uuid.UUID
    user_id: uuid.UUID
    file_path: str = Field(..., description="Internal storage path of the file")
    version_number: int = Field(default=1, description="Version of the resume")
    parent_resume_id: Optional[uuid.UUID] = Field(None, description="Parent resume in the version chain")
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeDetailResponse(ResumeResponse):
    raw_text: str = Field(..., description="Raw text extracted from the document")
    parsed_sections: Optional[Dict[str, Any]] = Field(
        None,
        description="Structured resume data (e.g. experience, education, skills)"
    )


class ResumeVersionResponse(BaseModel):
    id: uuid.UUID
    version_number: int
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)
