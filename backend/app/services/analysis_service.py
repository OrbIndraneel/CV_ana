"""
analysis_service.py
Service layer for orchestrating resume analysis runs.
Validates document ownership, initializes analysis records, and dispatches Celery tasks.
"""

import uuid
import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from sqlalchemy import func
from app.core.exceptions import EntityNotFoundException, AuthorizationException
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.user import User
from app.tasks.analysis_tasks import process_analysis_task

logger = logging.getLogger(__name__)


class AnalysisService:
    """
    Coordinates task execution and results collection for resume evaluations.
    """

    @classmethod
    async def trigger_analysis(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
        job_description_ids: List[uuid.UUID]
    ) -> List[Analysis]:
        """
        Validates ownership for resume and job descriptions, initializes Analysis ORM records,
        commits them, and dispatches the Celery processing tasks.
        """
        # Get user subscription tier
        user_query = select(User).filter(User.id == user_id)
        user_res = await db.execute(user_query)
        user = user_res.scalars().first()

        # Enforce tier-aware analysis monthly count rate limits
        if user:
            tier = user.subscription_tier or "free"
            if tier in ["free", "pro"]:
                max_allowed = 1 if tier == "free" else 5
                
                # Count current month analyses
                from datetime import datetime
                first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                
                usage_query = select(func.count(Analysis.id)).join(Resume).filter(
                    Resume.user_id == user_id,
                    Analysis.created_at >= first_day_of_month
                )
                usage_res = await db.execute(usage_query)
                usage_count = usage_res.scalar() or 0
                
                if usage_count >= max_allowed:
                    raise AuthorizationException(
                        detail=f"Rate limit exceeded: You have reached your monthly analysis limit of {max_allowed} for the '{tier.upper()}' tier. Please upgrade to run more checks.",
                        code="MONTHLY_LIMIT_EXCEEDED"
                    )

        # 1. Verify user owns the resume
        resume_query = select(Resume).filter(Resume.id == resume_id)
        resume_res = await db.execute(resume_query)
        resume = resume_res.scalars().first()

        if not resume:
            raise EntityNotFoundException(
                detail="Resume not found.",
                code="RESUME_NOT_FOUND"
            )

        if resume.user_id != user_id:
            raise AuthorizationException(
                detail="You do not have permission to run analysis on this resume.",
                code="RESUME_ACCESS_DENIED"
            )

        created_analyses = []

        # 2. Process each JD
        for jd_id in job_description_ids:
            jd_query = select(JobDescription).filter(JobDescription.id == jd_id)
            jd_res = await db.execute(jd_query)
            jd = jd_res.scalars().first()

            if not jd:
                raise EntityNotFoundException(
                    detail=f"Job description {jd_id} not found.",
                    code="JOB_DESCRIPTION_NOT_FOUND"
                )

            if jd.user_id != user_id:
                raise AuthorizationException(
                    detail=f"You do not have permission to use job description {jd_id}.",
                    code="JOB_DESCRIPTION_ACCESS_DENIED"
                )

            # Check if there is already a pending/processing run for this resume & JD
            # to avoid duplicating heavy celery worker tasks
            existing_query = select(Analysis).filter(
                Analysis.resume_id == resume_id,
                Analysis.job_description_id == jd_id,
                Analysis.status.in_(["pending", "processing"])
            )
            existing_res = await db.execute(existing_query)
            existing_run = existing_res.scalars().first()

            if existing_run:
                logger.info(f"Analysis for resume {resume_id} and JD {jd_id} already in queue ({existing_run.id}).")
                created_analyses.append(existing_run)
                continue

            # Create new Analysis run
            new_analysis = Analysis(
                resume_id=resume_id,
                job_description_id=jd_id,
                status="pending"
            )

            db.add(new_analysis)
            await db.commit()
            await db.refresh(new_analysis)

            # Dispatch background worker task via Celery
            # Delay parameters must be serializable (e.g. UUID converted to string)
            process_analysis_task.delay(str(new_analysis.id))
            logger.info(f"Dispatched background Celery analysis {new_analysis.id} for JD {jd_id}.")
            created_analyses.append(new_analysis)

        return created_analyses

    @staticmethod
    async def get_analysis_by_id(
        db: AsyncSession,
        analysis_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> Analysis:
        """
        Fetch single analysis and verify user ownership of the underlying resume.
        """
        query = select(Analysis).join(Resume).filter(
            Analysis.id == analysis_id
        )
        result = await db.execute(query)
        analysis = result.scalars().first()

        if not analysis:
            raise EntityNotFoundException(
                detail="Analysis run not found.",
                code="ANALYSIS_NOT_FOUND"
            )

        # Confirm that the user owns the resume associated with the analysis
        if analysis.resume.user_id != user_id:
            raise AuthorizationException(
                detail="You do not have permission to view this analysis report.",
                code="ANALYSIS_ACCESS_DENIED"
            )

        return analysis

    @staticmethod
    async def get_analyses_for_resume(
        db: AsyncSession,
        resume_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> List[Analysis]:
        """
        Fetch all analyses executed on a specific resume. Verifies owner.
        """
        # Confirm user owns the target resume
        res_query = select(Resume).filter(Resume.id == resume_id)
        res_result = await db.execute(res_query)
        resume = res_result.scalars().first()

        if not resume:
            raise EntityNotFoundException(
                detail="Resume not found.",
                code="RESUME_NOT_FOUND"
            )

        if resume.user_id != user_id:
            raise AuthorizationException(
                detail="You do not have permission to view analyses for this resume.",
                code="RESUME_ACCESS_DENIED"
            )

        query = select(Analysis).filter(
            Analysis.resume_id == resume_id
        ).order_by(Analysis.created_at.desc())

        result = await db.execute(query)
        return list(result.scalars().all())

    @classmethod
    async def compare_analyses(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
        job_description_ids: List[uuid.UUID]
    ) -> List[Analysis]:
        """
        Fetch completed analyses for a resume compared to selected JDs.
        Triggers new analyses for any JDs in the list that haven't been run yet.
        """
        # Ensure all job descriptions have completed runs, otherwise trigger them
        analyses = []
        jds_to_trigger = []

        for jd_id in job_description_ids:
            query = select(Analysis).filter(
                Analysis.resume_id == resume_id,
                Analysis.job_description_id == jd_id
            ).order_by(Analysis.created_at.desc())
            result = await db.execute(query)
            run = result.scalars().first()

            if run:
                analyses.append(run)
            else:
                jds_to_trigger.append(jd_id)

        if jds_to_trigger:
            new_runs = await cls.trigger_analysis(
                db=db,
                user_id=user_id,
                resume_id=resume_id,
                job_description_ids=jds_to_trigger
            )
            analyses.extend(new_runs)

        return analyses
