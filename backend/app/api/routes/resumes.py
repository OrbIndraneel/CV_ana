"""
resumes.py
API endpoints for uploading, listing, viewing, deleting, and diffing resume versions.
"""

import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.resume import (
    ResumeResponse,
    ResumeDetailResponse,
    ResumeVersionResponse
)
from app.services.resume_service import ResumeService

router = APIRouter()


@router.post(
    "/upload",
    response_model=ResumeDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a new resume version",
    description="Upload a PDF/DOCX resume. Specifying a parent_resume_id registers it as a new version."
)
async def upload_resume(
    file: UploadFile = File(...),
    parent_resume_id: Optional[uuid.UUID] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> ResumeDetailResponse:
    """
    Accepts form-data upload and triggers text parser and segmentation engines.
    """
    resume = await ResumeService.create_resume(
        db=db,
        user_id=current_user.id,
        file=file,
        parent_resume_id=parent_resume_id
    )
    return resume


@router.get(
    "/",
    response_model=List[ResumeResponse],
    status_code=status.HTTP_200_OK,
    summary="List root resumes",
    description="Retrieve all primary (version 1) resumes uploaded by the current authenticated user."
)
async def list_resumes(
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> List[ResumeResponse]:
    """
    Retrieve user root-level resumes.
    """
    resumes = await ResumeService.get_resumes(db=db, user_id=current_user.id)
    return resumes


@router.get(
    "/{id}",
    response_model=ResumeDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get resume details",
    description="Retrieve the raw text and parsed section structures of a specific resume version."
)
async def get_resume(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> ResumeDetailResponse:
    """
    Retrieve single resume details.
    """
    resume = await ResumeService.get_resume_by_id(db=db, resume_id=id, user_id=current_user.id)
    return resume


@router.get(
    "/{id}/versions",
    response_model=List[ResumeResponse],
    status_code=status.HTTP_200_OK,
    summary="Get resume versions",
    description="List all available revisions in the version chain of a specific resume."
)
async def get_resume_versions(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> List[ResumeResponse]:
    """
    Retrieve the version history tree for a resume.
    """
    versions = await ResumeService.get_resume_versions(db=db, resume_id=id, user_id=current_user.id)
    return versions


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a resume",
    description="Permanently delete a resume database record and its associated files."
)
async def delete_resume(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> None:
    """
    Delete resume and clean up filesystem.
    """
    await ResumeService.delete_resume(db=db, resume_id=id, user_id=current_user.id)
    return


@router.get(
    "/{id}/diff/{id2}",
    response_model=List[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Diff two resume versions",
    description="Calculate line-by-line additions, deletions, and equalities between two resume revisions."
)
async def diff_resume_versions(
    id: uuid.UUID,
    id2: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Diff two distinct versions of a resume belonging to the user.
    """
    # Fetch and check access for both files
    resume1 = await ResumeService.get_resume_by_id(db=db, resume_id=id, user_id=current_user.id)
    resume2 = await ResumeService.get_resume_by_id(db=db, resume_id=id2, user_id=current_user.id)

    # Compile line-by-line diff
    diff_results = ResumeService.diff_resumes(resume1, resume2)
    return diff_results
