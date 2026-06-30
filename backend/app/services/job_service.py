"""
job_service.py
Service layer for handling Job Description document creation and metadata extraction.
Utilizes NLP analyzers to extract skills and classify roles.
"""

import uuid
import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.exceptions import EntityNotFoundException, AuthorizationException
from app.nlp.analyzers.keyword_matcher import extract_skills
from app.nlp.analyzers.role_classifier import classify_role
from app.models.job_description import JobDescription
from app.schemas.job_description import JobDescriptionCreate

logger = logging.getLogger(__name__)


class JobService:
    """
    Business logic layer mapping job descriptions to NLP parsers and DB.
    """

    @staticmethod
    async def create_job_description(
        db: AsyncSession,
        user_id: uuid.UUID,
        jd_in: JobDescriptionCreate
    ) -> JobDescription:
        """
        Create a new job description.
        Automatically classifies the targeted role and extracts core requirements.
        """
        # Run NLP classifications
        detected_role, _ = classify_role(jd_in.raw_text)
        required_skills = extract_skills(jd_in.raw_text)

        # Create ORM instance
        new_jd = JobDescription(
            user_id=user_id,
            title=jd_in.title,
            company=jd_in.company,
            raw_text=jd_in.raw_text,
            detected_role=detected_role,
            required_skills=required_skills
        )

        db.add(new_jd)
        await db.commit()
        await db.refresh(new_jd)

        logger.info(f"Created JobDescription {new_jd.id} for user {user_id}. Role: {detected_role}")
        return new_jd

    @staticmethod
    async def get_job_descriptions(
        db: AsyncSession,
        user_id: uuid.UUID
    ) -> List[JobDescription]:
        """
        List all saved job descriptions belonging to the user.
        """
        query = select(JobDescription).filter(
            JobDescription.user_id == user_id
        ).order_by(JobDescription.created_at.desc())

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_jd_by_id(
        db: AsyncSession,
        jd_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> JobDescription:
        """
        Fetch a single job description. Verifies owner.
        """
        query = select(JobDescription).filter(JobDescription.id == jd_id)
        result = await db.execute(query)
        jd = result.scalars().first()

        if not jd:
            raise EntityNotFoundException(
                detail="Job description not found.",
                code="JOB_DESCRIPTION_NOT_FOUND"
            )

        if jd.user_id != user_id:
            raise AuthorizationException(
                detail="You do not have permission to access this job description.",
                code="JOB_DESCRIPTION_ACCESS_DENIED"
            )

        return jd

    @staticmethod
    async def delete_job_description(
        db: AsyncSession,
        jd_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> None:
        """
        Delete a job description. Verifies owner.
        """
        query = select(JobDescription).filter(JobDescription.id == jd_id)
        result = await db.execute(query)
        jd = result.scalars().first()

        if not jd:
            raise EntityNotFoundException(
                detail="Job description not found.",
                code="JOB_DESCRIPTION_NOT_FOUND"
            )

        if jd.user_id != user_id:
            raise AuthorizationException(
                detail="You do not have permission to delete this job description.",
                code="JOB_DESCRIPTION_DELETE_DENIED"
            )

        await db.delete(jd)
        await db.commit()
        logger.info(f"Deleted JobDescription {jd_id} from database.")
