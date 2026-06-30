"""
base.py
Imports all models in the application to ensure Alembic registers them for migrations.
Also exports the Base class from app.db.declarative.
"""

from app.db.declarative import Base  # noqa: F401

# Import all models here so that they are registered on the metadata
# before Alembic runs autogenerate.
from app.models.user import User  # noqa: F401
from app.models.resume import Resume  # noqa: F401
from app.models.job_description import JobDescription  # noqa: F401
from app.models.analysis import Analysis  # noqa: F401
