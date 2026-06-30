"""
section_segmenter.py
Segments clean resume text into structured section blocks (education, experience, skills, summary, projects).
Uses fuzzy regex patterns and standalone line length heuristics to determine section bounds.
"""

import logging
import re
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

# Heuristic mapping for standardizing section categories
SECTION_MAP = {
    "experience": [
        "experience", "work history", "professional experience", "employment",
        "employment history", "professional history", "career history", "work experience"
    ],
    "education": [
        "education", "academic background", "academic history", "studies",
        "education and credentials", "qualifications", "degree", "degrees"
    ],
    "skills": [
        "skills", "technical skills", "technologies", "tech stack", "languages",
        "skills & tools", "core competencies", "proficiencies", "skills and expertise"
    ],
    "projects": [
        "projects", "personal projects", "key projects", "selected projects",
        "open source", "academic projects", "technical projects", "portfolio"
    ],
    "summary": [
        "summary", "profile", "professional summary", "objective",
        "career objective", "about me", "executive summary", "personal profile"
    ]
}


def _normalize_header(line: str) -> str:
    """
    Cleans a line for header matching (lowercase, removes non-alphabetic characters).
    """
    cleaned = line.lower().strip()
    # Remove leading numbers, bullet signs, and trailing colons/symbols
    cleaned = re.sub(r"^[•\-\*\d\.\s\t]+", "", cleaned)
    cleaned = re.sub(r"[:\-\#\s]+$", "", cleaned)
    return cleaned.strip()


def _is_header(line: str, normalized_line: str) -> bool:
    """
    Check if a line matches any known section heading based on length and match profiles.
    """
    # Standalone line length check (headers should be short)
    if len(line) > 40 or len(line.split()) > 5:
        return False

    # Prevent matching bullet points that happen to contain keywords
    if line.strip().startswith(("•", "-", "*", "1.", "2.", "3.")):
        return False

    # Match against lists in SECTION_MAP
    for section_key, aliases in SECTION_MAP.items():
        if normalized_line in aliases:
            return True

    return False


def segment_sections(raw_text: str) -> Dict[str, List[str]]:
    """
    Segment raw text into structured lists of strings per section.
    Output format: { education: [], experience: [], skills: [], summary: [], projects: [], other: [] }
    """
    lines = raw_text.split("\n")
    sections: Dict[str, List[str]] = {
        "summary": [],
        "experience": [],
        "skills": [],
        "education": [],
        "projects": [],
        "other": []
    }

    current_section = "other"  # Default fallback before any section header is found

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue

        normalized = _normalize_header(line_str)

        # Detect if this line represents a new section header
        if _is_header(line_str, normalized):
            found_header = False
            for section_key, aliases in SECTION_MAP.items():
                if normalized in aliases:
                    current_section = section_key
                    found_header = True
                    break

            if found_header:
                logger.debug(f"Segmenter: Transitioned to section: {current_section}")
                # We skip appending the header itself to keep the parsed blocks clean
                continue

        # Append lines into the currently active section list
        sections[current_section].append(line_str)

    # Post-processing: check if critical sections are empty and log a warning
    missing = [sec for sec, content in sections.items() if not content and sec != "other"]
    if missing:
        logger.info(f"Segmenter finished. Missing critical sections: {missing}")

    return sections
