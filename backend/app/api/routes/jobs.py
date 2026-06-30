"""
jobs.py
API endpoints for creating, listing, and deleting job descriptions.
"""

import uuid
from typing import List, Any
from fastapi import APIRouter, Depends, status

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.job_description import JobDescriptionCreate, JobDescriptionResponse
from app.services.job_service import JobService

router = APIRouter()


@router.post(
    "/",
    response_model=JobDescriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new job description",
    description="Analyze and save a new job description, parsing the required skills and detecting the role category."
)
async def create_job_description(
    jd_in: JobDescriptionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> JobDescriptionResponse:
    """
    Triggers classification and saves job description metadata.
    """
    jd = await JobService.create_job_description(
        db=db,
        user_id=current_user.id,
        jd_in=jd_in
    )
    return jd


@router.get(
    "/",
    response_model=List[JobDescriptionResponse],
    status_code=status.HTTP_200_OK,
    summary="List saved job descriptions",
    description="Retrieve all job descriptions saved by the current user."
)
async def list_job_descriptions(
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> List[JobDescriptionResponse]:
    """
    List user job descriptions.
    """
    jds = await JobService.get_job_descriptions(db=db, user_id=current_user.id)
    return jds


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a job description",
    description="Permanently delete a job description from database."
)
async def delete_job_description(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> None:
    """
    Delete job description.
    """
    await JobService.delete_job_description(db=db, jd_id=id, user_id=current_user.id)
    return
