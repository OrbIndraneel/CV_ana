"""
score_aggregator.py
Consolidates parsing results and individual component scores into a single aggregate rating.
Outputs grade classifications and detailed explainability breakdowns.
"""

import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


def _calculate_grade(score: float) -> str:
    """Convert a score (0.0 to 1.0) into an academic grade string."""
    score_pct = score * 100
    if score_pct >= 95:
        return "A+"
    elif score_pct >= 90:
        return "A"
    elif score_pct >= 85:
        return "B+"
    elif score_pct >= 80:
        return "B"
    elif score_pct >= 75:
        return "C+"
    elif score_pct >= 70:
        return "C"
    elif score_pct >= 60:
        return "D"
    else:
        return "F"


def _generate_dynamic_summary(
    overall_pct: int,
    matched_kws: int,
    total_kws: int,
    weak_bullets: int,
    gaps_count: int
) -> str:
    """Create a narrative summary highlighting major drivers of the score."""
    phrases = []

    # Keyword match assessment
    kw_rate = (matched_kws / total_kws) if total_kws > 0 else 1.0
    if kw_rate >= 0.8:
        phrases.append("Strong technical skill set matching the job requirements.")
    elif kw_rate >= 0.5:
        phrases.append(f"Moderate keyword alignment; matched {matched_kws} of {total_kws} critical skills.")
    else:
        phrases.append("Significant technical skill gaps detected compared to the core job details.")

    # Bullet point assessment
    if weak_bullets > 0:
        phrases.append(f"Found {weak_bullets} experience bullet points that lack strong action verbs or metrics.")
    else:
        phrases.append("Accomplishments are well-structured and action-oriented.")

    # Gap assessment
    if gaps_count > 0:
        phrases.append(f"Detected {gaps_count} gap areas in requirement coverage.")

    return " ".join(phrases)


def aggregate_scores(
    ats_issues: List[Dict[str, Any]],
    keyword_matches: List[Dict[str, Any]],
    semantic_results: Dict[str, Any],
    bullet_results: Dict[str, Any],
    gap_results: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Consolidates sub-components and computes final scores.
    Weights:
      - ats_score:      0.20
      - keyword_score:  0.25
      - semantic_score: 0.30
      - bullet_score:   0.15
      - format_score:   0.10
    """
    # 1. ATS Score calculation (based on issues found)
    ats_errors = sum(1 for issue in ats_issues if issue.get("severity") == "error" and not issue.get("passed", True))
    ats_warnings = sum(1 for issue in ats_issues if issue.get("severity") == "warning" and not issue.get("passed", True))

    ats_score = 1.0 - (ats_errors * 0.40) - (ats_warnings * 0.15)
    ats_score = max(0.0, min(1.0, ats_score))

    # Compile drivers and issues for ATS section
    ats_drivers = [issue["message"] for issue in ats_issues if issue.get("passed", False)]
    ats_flagged = [issue["message"] for issue in ats_issues if not issue.get("passed", True)]

    # 2. Keyword Match Score (ratio of found keywords)
    total_keywords = len(keyword_matches)
    matched_keywords = sum(1 for kw in keyword_matches if kw.get("found", False))
    keyword_score = (matched_keywords / total_keywords) if total_keywords > 0 else 1.0

    matched_kw_names = [kw["keyword"] for kw in keyword_matches if kw.get("found", False)]
    missing_kw_names = [kw["keyword"] for kw in keyword_matches if not kw.get("found", False)]

    # 3. Semantic Similarity Score
    semantic_score = semantic_results.get("semantic_score", 0.0)
    top_matches = semantic_results.get("top_matches", [])
    semantic_gaps = semantic_results.get("gaps", [])

    # 4. Bullet Point Quality Score
    bullet_score = bullet_results.get("average_score", 0.0)
    bullet_feedback = bullet_results.get("feedback", [])
    strong_bullets = [bf["original"] for bf in bullet_feedback if bf.get("score", 0.0) >= 0.7]
    weak_bullets = [bf for bf in bullet_feedback if bf.get("score", 0.0) < 0.6]

    # 5. Formatting/Presentation Score
    # Decrements based on layout parameters (text boxes, gaps, layout warnings)
    formatting_deductions = 0.0
    formatting_issues = []

    # Check for text boxes
    if any(issue.get("type") == "text_boxes_detected" for issue in ats_issues):
        formatting_deductions += 0.20
        formatting_issues.append("Detected text box containers which are problematic for parsing.")

    # Check for gaps > 12 months as a warning in presentation
    major_gaps = [gap for gap in gap_results.get("gaps", []) if gap.get("duration_months", 0) > 12]
    if major_gaps:
        formatting_deductions += 0.15
        formatting_issues.append("Unexplained employment gaps of greater than 1 year.")

    format_score = max(0.0, min(1.0, 1.0 - formatting_deductions))

    # 6. Final Aggregate Weighted Score
    overall_score = (
        ats_score * 0.20 +
        keyword_score * 0.25 +
        semantic_score * 0.30 +
        bullet_score * 0.15 +
        format_score * 0.10
    )
    overall_score = round(max(0.0, min(1.0, overall_score)), 3)

    overall_pct = int(overall_score * 100)
    grade = _calculate_grade(overall_score)

    summary = _generate_dynamic_summary(
        overall_pct=overall_pct,
        matched_kws=matched_keywords,
        total_kws=total_keywords,
        weak_bullets=len(weak_bullets),
        gaps_count=len(semantic_gaps)
    )

    # Compile the final explainability package
    explainability_report = {
        "overall": overall_pct,
        "grade": grade,
        "summary": summary,
        "section_scores": {
            "ats": {
                "score": int(ats_score * 100),
                "drivers": ats_drivers,
                "issues": ats_flagged
            },
            "keywords": {
                "score": int(keyword_score * 100),
                "matched": matched_kw_names,
                "missing": missing_kw_names
            },
            "semantic": {
                "score": int(semantic_score * 100),
                "top_matches": top_matches,
                "gaps": semantic_gaps
            },
            "bullets": {
                "score": int(bullet_score * 100),
                "strong": strong_bullets[:5],
                "weak": weak_bullets[:5]
            },
            "formatting": {
                "score": int(format_score * 100),
                "issues": formatting_issues
            }
        }
    }

    logger.info(f"Aggregate score compiled: {overall_pct}% (Grade: {grade})")
    return explainability_report
