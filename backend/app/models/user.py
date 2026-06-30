"""
user.py
SQLAlchemy ORM model for the 'users' table.
Tracks user accounts, credentials, and relationship to documents.
"""

import uuid
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.declarative import Base

if TYPE_CHECKING:
    from app.models.resume import Resume
    from app.models.job_description import JobDescription


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )
    stripe_customer_id: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )
    stripe_subscription_id: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )
    subscription_tier: Mapped[str] = mapped_column(
        String(50),
        default="free",
        nullable=False
    )
    subscription_status: Mapped[str] = mapped_column(
        String(50),
        default="inactive",
        nullable=False
    )

    # Relationships
    resumes: Mapped[List["Resume"]] = relationship(
        "Resume",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    job_descriptions: Mapped[List["JobDescription"]] = relationship(
        "JobDescription",
        back_populates="user",
        cascade="all, delete-orphan"
    )
