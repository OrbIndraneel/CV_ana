"""
resume_service.py
Service layer for handling Resume file uploads, text parsing, section segmentation,
and version chain management in the database.
"""

import os
import uuid
import logging
from typing import List, Optional, Dict, Any
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.models.user import User

from app.core.exceptions import (
    EntityNotFoundException,
    AuthorizationException,
    ValidationException
)
from app.nlp.parsers.pdf_parser import parse_pdf
from app.nlp.parsers.docx_parser import parse_docx
from app.nlp.parsers.section_segmenter import segment_sections
from app.models.resume import Resume

logger = logging.getLogger(__name__)

# Configure uploads directory relative to project root
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")


class ResumeService:
    """
    Business logic coordinator for Resume files and database mappings.
    """

    @staticmethod
    async def save_uploaded_file(file: UploadFile) -> str:
        """
        Save an uploaded file to the local uploads directory.
        Returns the absolute filepath of the saved file.
        """
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        # Generate a unique filename to avoid namespace collisions
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in [".pdf", ".docx"]:
            raise ValidationException(
                detail="Invalid file type. Only PDF and DOCX files are supported.",
                code="INVALID_FILE_TYPE"
            )

        unique_filename = f"{uuid.uuid4()}{file_ext}"
        dest_path = os.path.join(UPLOAD_DIR, unique_filename)

        try:
            with open(dest_path, "wb") as buffer:
                # Read chunks of the file to handle larger documents efficiently
                while content := await file.read(1024 * 1024):  # 1MB chunks
                    buffer.write(content)
            logger.info(f"Saved file {file.filename} to local storage at {dest_path}")
            return dest_path
        except Exception as e:
            logger.error(f"Failed to save uploaded file to disk: {e}", exc_info=True)
            raise ValidationException(
                detail="Failed to save uploaded file to server storage.",
                code="FILE_SAVE_FAILED"
            )

    @classmethod
    async def create_resume(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        file: UploadFile,
        parent_resume_id: Optional[uuid.UUID] = None
    ) -> Resume:
        """
        Processes an uploaded file, runs text extraction and structural segmentation,
        sets up versions, and commits the records to the DB.
        """
        # Get user subscription tier to check version limit
        user_query = select(User).filter(User.id == user_id)
        user_res = await db.execute(user_query)
        user = user_res.scalars().first()
        
        if user:
            tier = user.subscription_tier or "free"
            if tier in ["free", "pro"]:
                max_versions = 1 if tier == "free" else 2
                
                # Count current resumes stored for this user
                count_query = select(func.count(Resume.id)).filter(Resume.user_id == user_id)
                count_res = await db.execute(count_query)
                current_count = count_res.scalar() or 0
                
                if current_count >= max_versions:
                    raise AuthorizationException(
                        detail=f"Storage limit exceeded: You have reached the maximum limit of {max_versions} stored resumes for the '{tier.upper()}' tier. Please upgrade to upload more versions.",
                        code="VERSION_LIMIT_EXCEEDED"
                    )

        # Save file to disk
        file_path = await cls.save_uploaded_file(file)

        # Read binary data for parsing
        try:
            with open(file_path, "rb") as f:
                binary_content = f.read()
        except Exception as e:
            logger.error(f"Failed to read file from path {file_path}: {e}")
            raise ValidationException(
                detail="Could not read uploaded document data.",
                code="FILE_READ_FAILED"
            )

        file_ext = os.path.splitext(file.filename)[1].lower()
        parsed_result = {}

        # Parse text based on document extension
        if file_ext == ".pdf":
            parsed_result = parse_pdf(binary_content)
        elif file_ext == ".docx":
            parsed_result = parse_docx(binary_content)

        raw_text = parsed_result.get("raw_text", "")
        metadata = parsed_result.get("metadata", {})

        if not raw_text.strip():
            # Delete corrupted file if parsing failed completely
            if os.path.exists(file_path):
                os.remove(file_path)
            raise ValidationException(
                detail="Document contains no selectable or parseable text.",
                code="EMPTY_DOCUMENT_TEXT"
            )

        # Run heuristic segmentation
        sections = segment_sections(raw_text)

        # Handle version logic
        version_number = 1
        if parent_resume_id:
            # Query parent resume to confirm existence and user ownership
            parent_query = select(Resume).filter(
                Resume.id == parent_resume_id,
                Resume.user_id == user_id
            )
            parent_result = await db.execute(parent_query)
            parent_resume = parent_result.scalars().first()

            if not parent_resume:
                # Clean up local file on failure
                if os.path.exists(file_path):
                    os.remove(file_path)
                raise EntityNotFoundException(
                    detail="Parent resume version not found.",
                    code="PARENT_RESUME_NOT_FOUND"
                )

            # Query the latest version in the chain to increment correctly
            version_query = select(Resume.version_number).filter(
                Resume.parent_resume_id == parent_resume_id
            ).order_by(Resume.version_number.desc())
            version_result = await db.execute(version_query)
            latest_version = version_result.scalars().first()

            if latest_version:
                version_number = latest_version + 1
            else:
                version_number = parent_resume.version_number + 1

        # Create ORM instance
        new_resume = Resume(
            user_id=user_id,
            filename=file.filename,
            file_path=file_path,
            raw_text=raw_text,
            parsed_sections=sections,
            version_number=version_number,
            parent_resume_id=parent_resume_id
        )

        db.add(new_resume)
        await db.commit()
        await db.refresh(new_resume)

        logger.info(f"Resume {new_resume.id} successfully created for user {user_id}. Version: {version_number}")
        return new_resume

    @staticmethod
    async def get_resumes(db: AsyncSession, user_id: uuid.UUID) -> List[Resume]:
        """
        List all base resumes (where parent_resume_id is Null) belonging to the user.
        """
        # Returns only the root versions. Client can drill down to view sub-versions.
        query = select(Resume).filter(
            Resume.user_id == user_id,
            Resume.parent_resume_id.is_(None)
        ).order_by(Resume.uploaded_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_resume_by_id(db: AsyncSession, resume_id: uuid.UUID, user_id: uuid.UUID) -> Resume:
        """
        Fetch a single resume by ID. Verifies ownership.
        """
        query = select(Resume).filter(Resume.id == resume_id)
        result = await db.execute(query)
        resume = result.scalars().first()

        if not resume:
            raise EntityNotFoundException(
                detail="Resume not found.",
                code="RESUME_NOT_FOUND"
            )

        if resume.user_id != user_id:
            raise AuthorizationException(
                detail="You do not have permission to access this resume.",
                code="RESUME_ACCESS_DENIED"
            )

        return resume

    @staticmethod
    async def delete_resume(db: AsyncSession, resume_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """
        Remove a resume from the database and delete its corresponding physical file from disk.
        """
        query = select(Resume).filter(Resume.id == resume_id)
        result = await db.execute(query)
        resume = result.scalars().first()

        if not resume:
            raise EntityNotFoundException(
                detail="Resume not found.",
                code="RESUME_NOT_FOUND"
            )

        if resume.user_id != user_id:
            raise AuthorizationException(
                detail="You do not have permission to delete this resume.",
                code="RESUME_DELETE_DENIED"
            )

        # Remove physical file from server storage
        if os.path.exists(resume.file_path):
            try:
                os.remove(resume.file_path)
                logger.info(f"Deleted physical file: {resume.file_path}")
            except Exception as e:
                logger.error(f"Failed to remove physical file {resume.file_path}: {e}")

        # Delete database record
        await db.delete(resume)
        await db.commit()
        logger.info(f"Deleted resume record: {resume_id} from database.")

    @staticmethod
    async def get_resume_versions(db: AsyncSession, resume_id: uuid.UUID, user_id: uuid.UUID) -> List[Resume]:
        """
        Fetch all versions of a specific resume (itself, its parent, and sibling versions).
        """
        query = select(Resume).filter(Resume.id == resume_id)
        result = await db.execute(query)
        resume = result.scalars().first()

        if not resume:
            raise EntityNotFoundException(
                detail="Resume not found.",
                code="RESUME_NOT_FOUND"
            )

        if resume.user_id != user_id:
            raise AuthorizationException(
                detail="You do not have permission to access this resume version chain.",
                code="RESUME_ACCESS_DENIED"
            )

        # Trace back to the root parent ID
        root_id = resume.parent_resume_id if resume.parent_resume_id else resume.id

        # Query root resume and all associated children
        version_query = select(Resume).filter(
            (Resume.id == root_id) | (Resume.parent_resume_id == root_id)
        ).order_by(Resume.version_number.asc())
        version_result = await db.execute(version_query)
        return list(version_result.scalars().all())

    @staticmethod
    def diff_resumes(resume1: Resume, resume2: Resume) -> List[Dict[str, Any]]:
        """
        Compare the raw text between two resume versions line-by-line.
        Returns a list of diff entries: [{'type': 'addition'|'deletion'|'equal', 'text': str}]
        """
        import difflib
        r1_lines = resume1.raw_text.splitlines()
        r2_lines = resume2.raw_text.splitlines()

        diff = list(difflib.ndiff(r1_lines, r2_lines))
        parsed_diff = []
        for line in diff:
            marker = line[:2]
            content = line[2:]
            if marker == "- ":
                parsed_diff.append({"type": "deletion", "text": content})
            elif marker == "+ ":
                parsed_diff.append({"type": "addition", "text": content})
            elif marker == "  ":
                parsed_diff.append({"type": "equal", "text": content})

        return parsed_diff
