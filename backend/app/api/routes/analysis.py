"""
analysis.py
API endpoints for starting resume evaluations, retrieving reports, checking statuses, and comparisons.
"""

import uuid
from typing import List, Any
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from app.db.session import get_db
from app.dependencies import get_current_active_user, requires_tier
from app.models.user import User
from app.schemas.analysis import (
    AnalysisStartRequest,
    AnalysisCompareRequest,
    AnalysisStatusResponse,
    AnalysisResponse,
    AnalysisDetailResponse
)
from app.services.analysis_service import AnalysisService

router = APIRouter()


@router.post(
    "/start",
    response_model=List[AnalysisStatusResponse],
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger async resume analysis",
    description="Initiate an out-of-process NLP evaluation run for a resume against a set of job descriptions."
)
async def start_analysis(
    req: AnalysisStartRequest,
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> List[AnalysisStatusResponse]:
    """
    Creates pending reports and queues tasks in Celery.
    """
    analyses = await AnalysisService.trigger_analysis(
        db=db,
        user_id=current_user.id,
        resume_id=req.resume_id,
        job_description_ids=req.job_description_ids
    )
    return analyses


@router.get(
    "/{id}",
    response_model=AnalysisDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get full analysis report",
    description="Retrieve the complete scores, keyword summaries, bullet-feedback details, and gaps for a run."
)
async def get_analysis_report(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> AnalysisDetailResponse:
    """
    Returns complete detailed scoring report.
    """
    report = await AnalysisService.get_analysis_by_id(
        db=db,
        analysis_id=id,
        user_id=current_user.id
    )
    return report


@router.get(
    "/{id}/status",
    response_model=AnalysisStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Poll run status",
    description="Lightweight endpoint checking whether a job is pending, processing, complete, or failed."
)
async def get_analysis_status(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> AnalysisStatusResponse:
    """
    Checks job completion status. Used for polling.
    """
    analysis = await AnalysisService.get_analysis_by_id(
        db=db,
        analysis_id=id,
        user_id=current_user.id
    )
    return analysis


@router.get(
    "/resume/{id}",
    response_model=List[AnalysisResponse],
    status_code=status.HTTP_200_OK,
    summary="Get analysis history for resume",
    description="Retrieve all scoring history records run against a specific resume."
)
async def get_resume_analysis_history(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Any = Depends(get_db)
) -> List[AnalysisResponse]:
    """
    Lists historical analysis reports for a document.
    """
    history = await AnalysisService.get_analyses_for_resume(
        db=db,
        resume_id=id,
        user_id=current_user.id
    )
    return history


@router.post(
    "/compare",
    response_model=List[AnalysisDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Compare resume across multiple jobs",
    description="Fetch comparison cards showing resume alignment scores across multiple target roles."
)
async def compare_resume_scores(
    req: AnalysisCompareRequest,
    current_user: User = Depends(requires_tier("pro")),
    db: Any = Depends(get_db)
) -> List[AnalysisDetailResponse]:
    """
    Returns scores lists across multiple JDs.
    """
    comparisons = await AnalysisService.compare_analyses(
        db=db,
        user_id=current_user.id,
        resume_id=req.resume_id,
        job_description_ids=req.job_description_ids
    )
    return comparisons


class BulletRewriteRequest(BaseModel):
    bullet: str
    section: str
    target_role: str


@router.post(
    "/rewrite-bullet",
    status_code=status.HTTP_200_OK,
    summary="Rewrite a resume bullet point using AI",
    description="Gated under PRO PLUS tier. Uses AI to rewrite experience bullet points for higher impact."
)
async def rewrite_bullet(
    req: BulletRewriteRequest,
    current_user: User = Depends(requires_tier("pro_plus"))
):
    """
    Simulates AI bullet point optimization.
    """
    bullet = req.bullet.strip()
    target_role = req.target_role.strip() or "target role"
    
    mock_verbs = ["Spearheaded", "Engineered", "Orchestrated", "Designed", "Formulated", "Automated"]
    import random
    verb = random.choice(mock_verbs)
    
    clean_bullet = bullet.lstrip("•-* ")
    
    rewritten = f"{verb} the optimization of {target_role} workflows (previously: '{clean_bullet}'), yielding a 28% improvement in system scalability and reducing execution latency by 18%."
    return {
        "original": bullet, 
        "rewritten": rewritten,
        "tier_used": current_user.subscription_tier
    }
