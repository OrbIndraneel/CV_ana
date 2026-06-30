"""
resume.py
SQLAlchemy ORM model for the 'resumes' table.
Tracks uploaded files, their versions, and parsed text/sections.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Integer, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.declarative import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.analysis import Analysis


class Resume(Base):
    __tablename__ = "resumes"

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
    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )
    raw_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    # parsed_sections contains structured JSON data e.g. {education: [], experience: [], skills: []}
    parsed_sections: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True
    )
    version_number: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False
    )
    parent_resume_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="SET NULL"),
        nullable=True
    )
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="resumes"
    )
    parent_resume: Mapped[Optional["Resume"]] = relationship(
        "Resume",
        remote_side=[id],
        backref="versions"
    )
    analyses: Mapped[List["Analysis"]] = relationship(
        "Analysis",
        back_populates="resume",
        cascade="all, delete-orphan"
    )
