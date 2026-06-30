"""
__init__.py
Exports Celery application configurations.
"""

from app.tasks.analysis_tasks import celery_app, process_analysis_task

__all__ = ["celery_app", "process_analysis_task"]
