"""
test_gap_detector.py
Tests the experience gap detector and promotion trajectory analyzer.
"""

from app.nlp.analyzers.gap_detector import analyze_timeline


def test_gap_detection() -> None:
    """
    Test that employment gaps between jobs are identified.
    """
    entries = [
        {"title": "Software Engineer", "company": "Tech Corp", "start_date": "January 2018", "end_date": "May 2019"},
        # 10 months gap
        {"title": "Senior Engineer", "company": "Global Solutions", "start_date": "March 2020", "end_date": "Present"}
    ]

    result = analyze_timeline(entries)

    assert len(result["gaps"]) == 1
    gap = result["gaps"][0]
    assert gap["duration_months"] == 10
    assert gap["severity"] == "warning"
    assert "Career gap of 10 months detected" in result["warnings"][0]


def test_promotion_detection() -> None:
    """
    Test that consecutive jobs at the same company with different titles flags a promotion.
    """
    entries = [
        {"title": "Software Engineer", "company": "Google", "start_date": "Jan 2018", "end_date": "Dec 2019"},
        {"title": "Senior Software Engineer", "company": "Google", "start_date": "Jan 2020", "end_date": "Present"}
    ]

    result = analyze_timeline(entries)

    assert len(result["promotions"]) == 1
    promo = result["promotions"][0]
    assert promo["company"] == "Google"
    assert promo["from_title"] == "Software Engineer"
    assert promo["to_title"] == "Senior Software Engineer"


def test_job_hopping_detection() -> None:
    """
    Test that 3 or more jobs within 24 months flags job-hopping.
    """
    entries = [
        {"title": "Dev 1", "company": "A", "start_date": "Jan 2018", "end_date": "May 2018"},
        {"title": "Dev 2", "company": "B", "start_date": "Jun 2018", "end_date": "Nov 2018"},
        {"title": "Dev 3", "company": "C", "start_date": "Dec 2018", "end_date": "Jun 2019"}
    ]

    result = analyze_timeline(entries)

    assert result["job_hopping"] is True
    assert any("Job-hopping pattern" in w for w in result["warnings"])
