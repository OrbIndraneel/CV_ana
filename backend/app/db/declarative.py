"""
declarative.py
Standard SQLAlchemy declarative base declaration.
Separated to prevent circular imports during model registration.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Consolidated DeclarativeBase. Models import Base from here.
    """
    pass
