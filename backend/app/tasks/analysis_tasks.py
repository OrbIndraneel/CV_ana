"""
analysis_tasks.py
Celery application instance and asynchronous worker task configurations.
Handles running the heavy NLP analyzers out-of-process.
"""

import asyncio
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List
from celery import Celery

from app.config import settings
from app.db.session import AsyncSessionLocal
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.models.job_description import JobDescription

# Configure logging for celery task worker context
logger = logging.getLogger(__name__)

# Initialize Celery App using Redis as broker and results backend
celery_app = Celery(
    "analysis_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True
)

# Date range regex to parse timeline items from experience strings (e.g. Jan 2018 - Present, 2015-2018)
DATE_RANGE_REGEX = re.compile(
    r"\b((?:[a-z]{3,9}\.?\s+\d{4})|(?:\d{1,2}/\d{4})|(?:\d{4}))\s*(?:\-|\bto\b)\s*((?:[a-z]{3,9}\.?\s+\d{4})|(?:\d{1,2}/\d{4})|(?:\d{4})|\bpresent\b|\bcurrent\b|\bnow\b)",
    re.IGNORECASE
)


def _extract_experience_blocks(experience_lines: List[str]) -> List[Dict[str, Any]]:
    """
    Scan lines in the experience section to parse date blocks and titles.
    Converts list of text lines into timeline structures for gap analysis.
    """
    entries = []
    current_entry = None

    for line in experience_lines:
        line_str = line.strip()
        if not line_str:
            continue

        match = DATE_RANGE_REGEX.search(line_str)
        if match:
            # If we had a previous entry in progress, save it
            if current_entry:
                entries.append(current_entry)

            start_date_str = match.group(1)
            end_date_str = match.group(2)

            # Strip out the date range to isolate company and title text
            line_sans_date = line_str.replace(match.group(0), "").strip(" ,-–—")
            parts = [p.strip() for p in re.split(r"[\-\–\—\,\|]", line_sans_date) if p.strip()]

            title = parts[0] if len(parts) > 0 else "Software Developer"
            company = parts[1] if len(parts) > 1 else "Technology Services"

            current_entry = {
                "title": title,
                "company": company,
                "start_date": start_date_str,
                "end_date": end_date_str
            }
        else:
            # If it's descriptive text (like bullet points), skip it for chronological timelines
            pass

    if current_entry:
        entries.append(current_entry)

    logger.info(f"Extracted {len(entries)} timeline blocks from experience text.")
    return entries


async def _run_analysis_pipeline(analysis_id: uuid.UUID) -> None:
    """
    Run all NLP core modules, compile scores, and write results back to Postgres.
    """
    async with AsyncSessionLocal() as db:
        # 1. Fetch Analysis record
        query = select(Analysis).filter(Analysis.id == analysis_id)
        result = await db.execute(query)
        analysis = result.scalars().first()

        if not analysis:
            logger.error(f"Analysis record {analysis_id} not found in database.")
            return

        # Set status to processing
        analysis.status = "processing"
        await db.commit()
        logger.info(f"Started processing analysis: {analysis_id}")

        try:
            # 2. Fetch Resume and JobDescription
            resume_query = select(Resume).filter(Resume.id == analysis.resume_id)
            resume_res = await db.execute(resume_query)
            resume = resume_res.scalars().first()

            jd_query = select(JobDescription).filter(JobDescription.id == analysis.job_description_id)
            jd_res = await db.execute(jd_query)
            jd = jd_res.scalars().first()

            if not resume or not jd:
                logger.error(f"Documents missing. Resume: {resume}, JD: {jd}")
                analysis.status = "failed"
                await db.commit()
                return

            # Ensure models are loaded in memory
            from app.nlp.model_loader import model_loader
            model_loader.load_models()

            # --- STEP 1: ATS layout checklist ---
            from app.nlp.analyzers.ats_checker import check_ats_compatibility
            ats_issues = check_ats_compatibility(resume.raw_text, resume.metadata or {})

            # --- STEP 2: Keyword matching ---
            from app.nlp.analyzers.keyword_matcher import match_keywords
            jd_skills = jd.required_skills or []
            keyword_matches = match_keywords(resume.raw_text, jd_skills)

            # --- STEP 3: Semantic scorers ---
            from app.nlp.analyzers.semantic_scorer import extract_requirements, compute_semantic_scores
            jd_req_sentences = extract_requirements(jd.raw_text)

            experience_lines = resume.parsed_sections.get("experience", []) if resume.parsed_sections else []
            # Gather experience bullet sentences (lines starting with lists markers or short phrases)
            bullet_points = [line for line in experience_lines if line.strip().startswith(("•", "-", "*"))]
            if not bullet_points:
                # Fallback to all lines in experience section
                bullet_points = experience_lines

            semantic_results = compute_semantic_scores(bullet_points, jd_req_sentences)

            # --- STEP 4: Bullet Quality Evaluator ---
            from app.nlp.analyzers.bullet_analyzer import analyze_bullets
            bullet_results = analyze_bullets(bullet_points)

            # --- STEP 5: Career Gap timeline tracking ---
            from app.nlp.analyzers.gap_detector import analyze_timeline
            experience_entries = _extract_experience_blocks(experience_lines)
            gap_results = analyze_timeline(experience_entries)

            # --- STEP 6: Consolidated Aggregator ---
            from app.nlp.analyzers.score_aggregator import aggregate_scores
            report = aggregate_scores(
                ats_issues=ats_issues,
                keyword_matches=keyword_matches,
                semantic_results=semantic_results,
                bullet_results=bullet_results,
                gap_results=gap_results
            )

            # --- STEP 7: Save records ---
            analysis.status = "complete"
            analysis.overall_score = report["overall"] / 100.0
            analysis.ats_score = report["section_scores"]["ats"]["score"] / 100.0
            analysis.keyword_score = report["section_scores"]["keywords"]["score"] / 100.0
            analysis.semantic_score = report["section_scores"]["semantic"]["score"] / 100.0
            analysis.bullet_quality_score = report["section_scores"]["bullets"]["score"] / 100.0
            analysis.formatting_score = report["section_scores"]["formatting"]["score"] / 100.0

            analysis.ats_issues = report["section_scores"]["ats"]["issues"]
            analysis.keyword_matches = keyword_matches
            analysis.bullet_feedback = report["section_scores"]["bullets"]["weak"]
            analysis.gap_analysis = report["section_scores"]["semantic"]["gaps"]
            analysis.score_breakdown = report
            analysis.role_detected = jd.detected_role
            analysis.completed_at = datetime.now(timezone.utc)

            await db.commit()
            logger.info(f"Completed processing analysis: {analysis_id}. Overall: {report['overall']}%")

        except Exception as err:
            logger.exception(f"Exception raised in Celery runner task: {err}")
            analysis.status = "failed"
            await db.commit()


@celery_app.task(name="app.tasks.analysis_tasks.process_analysis_task")
def process_analysis_task(analysis_id_str: str) -> None:
    """
    Synchronous entrypoint for Celery runner executing the async SQL event loop.
    """
    analysis_id = uuid.UUID(analysis_id_str)
    # Spin up connection context using standard event loop
    asyncio.get_event_loop().run_until_complete(_run_analysis_pipeline(analysis_id))
