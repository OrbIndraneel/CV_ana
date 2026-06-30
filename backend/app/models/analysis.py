"""
analysis.py
SQLAlchemy ORM model for the 'analyses' table.
Stores overall/component scores and detailed JSONB reports from the NLP analyzer pipeline.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Float, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.declarative import Base

if TYPE_CHECKING:
    from app.models.resume import Resume
    from app.models.job_description import JobDescription


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    resume_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    job_description_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_descriptions.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
        nullable=False
    )

    # Component and overall scores (0.0 to 1.0)
    overall_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ats_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    keyword_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    semantic_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    bullet_quality_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    formatting_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Detailed results stored as JSONB for high flexibility
    ats_issues: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSONB, nullable=True)
    keyword_matches: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSONB, nullable=True)
    bullet_feedback: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSONB, nullable=True)
    gap_analysis: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSONB, nullable=True)
    score_breakdown: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    role_detected: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    resume: Mapped["Resume"] = relationship(
        "Resume",
        back_populates="analyses"
    )
    job_description: Mapped[Optional["JobDescription"]] = relationship(
        "JobDescription",
        back_populates="analyses"
    )
