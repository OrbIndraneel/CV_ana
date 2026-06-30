"""
gap_detector.py
Analyzes experience entries for timeline gaps, career trajectory, promotions, and job-hopping.
"""

import logging
from datetime import date
from typing import Any, Dict, List, Optional

from app.nlp.utils.date_parser import parse_resume_date

logger = logging.getLogger(__name__)

# Seniority level keyword lists
SENIORITY_RANKS = {
    0: ["intern", "coop", "co-op", "trainee", "student"],
    1: ["junior", "jr", "associate", "entry"],
    2: ["mid", "developer", "engineer", "analyst", "consultant"],
    3: ["senior", "sr", "lead", "specialist"],
    4: ["principal", "architect", "lead developer", "lead engineer"],
    5: ["manager", "director", "vp", "head", "chief", "cto", "cio"]
}


def _detect_seniority_level(title: str) -> int:
    """
    Heuristic to rank career seniority level based on job title keywords.
    Defaults to mid-level (2) if no explicit keyword matches.
    """
    title_lower = title.lower()
    for level, keywords in sorted(SENIORITY_RANKS.items(), reverse=True):
        if any(keyword in title_lower for keyword in keywords):
            return level
    return 2  # Default mid-level


def _diff_months(start: date, end: date) -> int:
    """Calculate date difference in full months."""
    return (end.year - start.year) * 12 + end.month - start.month


def analyze_timeline(experience_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Perform gap and trajectory checks.
    Input structure:
    [{ "title": str, "company": str, "start_date": str, "end_date": str }]
    """
    if not experience_entries:
        return {
            "gaps": [],
            "promotions": [],
            "job_hopping": False,
            "seniority_progression": "neutral",
            "warnings": []
        }

    parsed_entries = []
    for entry in experience_entries:
        start = parse_resume_date(entry.get("start_date"))
        end = parse_resume_date(entry.get("end_date"))

        if start and end:
            parsed_entries.append({
                "title": entry.get("title", "Unknown"),
                "company": entry.get("company", "Unknown"),
                "start": start,
                "end": end,
                "duration_months": _diff_months(start, end)
            })

    # Sort chronological earliest-to-latest
    parsed_entries.sort(key=lambda x: x["start"])

    gaps = []
    promotions = []
    warnings = []
    total_months_experience = sum(e["duration_months"] for e in parsed_entries)

    # 1. Gap Detection & Promotion Detection
    for i in range(len(parsed_entries) - 1):
        curr_role = parsed_entries[i]
        next_role = parsed_entries[i + 1]

        # Calculate gap in months
        gap_duration = _diff_months(curr_role["end"], next_role["start"])

        if gap_duration > 1:
            severity = "info"
            if gap_duration > 12:
                severity = "error"
                warnings.append(
                    f"Significant career gap of {gap_duration} months detected between "
                    f"'{curr_role['title']}' and '{next_role['title']}'."
                )
            elif gap_duration > 6:
                severity = "warning"
                warnings.append(
                    f"Career gap of {gap_duration} months detected between "
                    f"'{curr_role['title']}' and '{next_role['title']}'."
                )

            gaps.append({
                "start": curr_role["end"].strftime("%Y-%m-%d"),
                "end": next_role["start"].strftime("%Y-%m-%d"),
                "duration_months": gap_duration,
                "severity": severity,
                "message": f"Employment gap of {gap_duration} months."
            })

        # Promotion check: same company, later entry has title change
        curr_company = curr_role["company"].lower().strip()
        next_company = next_role["company"].lower().strip()

        if curr_company != "unknown" and curr_company == next_company:
            curr_level = _detect_seniority_level(curr_role["title"])
            next_level = _detect_seniority_level(next_role["title"])

            if next_level > curr_level or curr_role["title"] != next_role["title"]:
                promotions.append({
                    "company": curr_role["company"],
                    "from_title": curr_role["title"],
                    "to_title": next_role["title"],
                    "message": f"Promotion detected at {curr_role['company']} from {curr_role['title']} to {next_role['title']}."
                })

    # 2. Job Hopping Check (> 3 roles within 24 months)
    # Check sliding window of 3 roles
    job_hopping = False
    if len(parsed_entries) >= 3:
        for i in range(len(parsed_entries) - 2):
            window_start = parsed_entries[i]["start"]
            window_end = parsed_entries[i + 2]["end"]
            window_duration = _diff_months(window_start, window_end)

            if window_duration <= 24:
                job_hopping = True
                warnings.append(
                    f"Job-hopping pattern detected: 3 roles held within a {window_duration} month span."
                )
                break

    # 3. Seniority Progression and Total Experience Mismatch Check
    seniority_progression = "stable"
    if len(parsed_entries) >= 2:
        levels = [_detect_seniority_level(e["title"]) for e in parsed_entries]
        # Check if rank order is strictly increasing or generally trending up
        is_improving = all(levels[i] <= levels[i + 1] for i in range(len(levels) - 1))
        has_increased = levels[-1] > levels[0]

        if is_improving and has_increased:
            seniority_progression = "positive"
        elif any(levels[i] > levels[i + 1] for i in range(len(levels) - 1)):
            seniority_progression = "fluctuating"

    # Mismatch check: Senior title but less than 3 years (36 months) total experience
    if parsed_entries:
        latest_role = parsed_entries[-1]
        latest_level = _detect_seniority_level(latest_role["title"])

        if latest_level >= 3 and total_months_experience < 36:
            warnings.append(
                f"Seniority mismatch: Job title contains senior keywords ('{latest_role['title']}'), "
                f"but total work duration is only {total_months_experience} months (under 3 years)."
            )

    return {
        "gaps": gaps,
        "promotions": promotions,
        "job_hopping": job_hopping,
        "seniority_progression": seniority_progression,
        "warnings": warnings,
        "total_months_experience": total_months_experience
    }
