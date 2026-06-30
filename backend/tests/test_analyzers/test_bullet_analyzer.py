"""
test_bullet_analyzer.py
Tests the experience bullet point quality evaluator.
"""

from app.nlp.analyzers.bullet_analyzer import analyze_bullet_point


def test_strong_bullet_point() -> None:
    """
    Test a high-quality bullet point.
    Led (strong action verb), 50% (metric), active voice, optimal word count (approx 20 words).
    """
    # This bullet is 21 words, starts with strong verb, has metric
    bullet = "Optimized database query performance by 50% for critical services, saving the core engineering team 15 hours of work per week."
    result = analyze_bullet_point(bullet)

    assert result["score"] >= 0.8
    assert "missing_metrics" not in result["issues"]
    assert "missing_action_verb" not in result["issues"]


def test_weak_bullet_point() -> None:
    """
    Test a poor bullet point.
    Too short, missing metrics, and missing action verb.
    """
    bullet = "Assisted with support tickets."
    result = analyze_bullet_point(bullet)

    assert result["score"] < 0.6
    # Should flag missing metric and weak verb
    assert "missing_metrics" in result["issues"]
    assert "weak_verb" in result["issues"] or "missing_action_verb" in result["issues"]
    assert "inappropriate_length" in result["issues"]
