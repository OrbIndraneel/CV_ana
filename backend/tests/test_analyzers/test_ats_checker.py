"""
test_ats_checker.py
Tests the ATS compatibility analyzer rules.
"""

from app.nlp.analyzers.ats_checker import check_ats_compatibility


def test_ats_compatibility_clean() -> None:
    """
    Test standard clean resume output (should pass scanned check and contain email/phone).
    """
    text = "John Doe\njohn.doe@example.com\n+1 (555) 019-2834\nlinkedin.com/in/johndoe\ngithub.com/johndoe"
    metadata = {
        "is_scanned": False,
        "tables_detected": False,
        "has_text_boxes": False,
        "file_type": "pdf"
    }

    issues = check_ats_compatibility(text, metadata)

    # Scanned check should pass
    scanned_issue = next(i for i in issues if i["type"] == "scanned_document")
    assert scanned_issue["passed"] is True

    # Tables check should pass
    tables_issue = next(i for i in issues if i["type"] == "tables_detected")
    assert tables_issue["passed"] is True

    # Contact checks should pass
    email_issue = next(i for i in issues if i["type"] == "email_missing")
    assert email_issue["passed"] is True


def test_ats_compatibility_issues() -> None:
    """
    Test scanned document warnings, table flags, and missing contacts.
    """
    text = "John Doe\nNo contacts here."
    metadata = {
        "is_scanned": True,
        "tables_detected": True,
        "has_text_boxes": True,
        "file_type": "pdf"
    }

    issues = check_ats_compatibility(text, metadata)

    scanned_issue = next(i for i in issues if i["type"] == "scanned_document")
    assert scanned_issue["passed"] is False
    assert scanned_issue["severity"] == "error"

    tables_issue = next(i for i in issues if i["type"] == "tables_detected")
    assert tables_issue["passed"] is False
    assert tables_issue["severity"] == "error"

    email_issue = next(i for i in issues if i["type"] == "email_missing")
    assert email_issue["passed"] is False
    assert email_issue["severity"] == "warning"
