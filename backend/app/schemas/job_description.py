"""
job_description.py
Pydantic v2 schemas for JobDescription serialization.
"""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class JobDescriptionBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255, description="Job role title")
    company: Optional[str] = Field(None, max_length=255, description="Target hiring company")
    raw_text: str = Field(..., description="Full raw job description text")


class JobDescriptionCreate(JobDescriptionBase):
    pass


class JobDescriptionResponse(JobDescriptionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    detected_role: Optional[str] = Field(None, description="NLP-classified role category")
    required_skills: Optional[List[str]] = Field(None, description="List of NLP-extracted key skills required")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
