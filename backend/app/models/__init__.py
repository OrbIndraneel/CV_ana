"""
__init__.py
Exports all SQLAlchemy models for easy import throughout the application.
"""

from app.models.user import User
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.analysis import Analysis

__all__ = ["User", "Resume", "JobDescription", "Analysis"]
