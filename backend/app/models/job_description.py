"""
job_description.py
SQLAlchemy ORM model for the 'job_descriptions' table.
Tracks user-created/saved job descriptions and extracted entities.
"""

import uuid
from datetime import datetime
from typing import Any, List, Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.declarative import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.analysis import Analysis


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    company: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    raw_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    detected_role: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    # required_skills is a list of extracted skills, stored in JSONB format
    required_skills: Mapped[Optional[List[str]]] = mapped_column(
        JSONB,
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="job_descriptions"
    )
    analyses: Mapped[List["Analysis"]] = relationship(
        "Analysis",
        back_populates="job_description",
        cascade="all, delete-orphan"
    )
