"""
test_segmenter.py
Tests the section segmenter's heuristic grouping patterns.
"""

from app.nlp.parsers.section_segmenter import segment_sections


def test_segment_sections_basic() -> None:
    """
    Test that standard headings are detected and the text between them is grouped correctly.
    """
    resume_text = (
        "John Doe\n"
        "Summary\n"
        "Experienced software developer.\n"
        "Work Experience\n"
        "- Built React apps.\n"
        "- Optimized queries in Postgres.\n"
        "Academic Background\n"
        "BS in Computer Science, 2020\n"
        "Skills\n"
        "Python, React, SQL"
    )

    segmented = segment_sections(resume_text)

    # Check that standard sections are present
    assert "summary" in segmented
    assert "experience" in segmented
    assert "education" in segmented
    assert "skills" in segmented

    # Check section contents
    assert segmented["summary"] == ["Experienced software developer."]
    assert segmented["experience"] == ["- Built React apps.", "- Optimized queries in Postgres."]
    assert segmented["education"] == ["BS in Computer Science, 2020"]
    assert segmented["skills"] == ["Python, React, SQL"]


def test_segment_sections_fuzzy_matching() -> None:
    """
    Test that non-standard/fuzzy section headings are mapped properly (e.g. 'Tech Stack' -> 'skills').
    """
    resume_text = (
        "Tech Stack\n"
        "Python, Docker, AWS\n"
        "Employment History\n"
        "SWE at Tech Inc.\n"
    )

    segmented = segment_sections(resume_text)

    assert segmented["skills"] == ["Python, Docker, AWS"]
    assert segmented["experience"] == ["SWE at Tech Inc."]
