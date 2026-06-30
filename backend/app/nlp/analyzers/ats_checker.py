"""
ats_checker.py
Scans parsed resume text and layout metadata to detect compatibility issues with Applicant Tracking Systems (ATS).
"""

import re
from typing import Any, Dict, List

# Email and Phone regular expressions
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9\.\_\%\+\-]+@[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,}")
PHONE_REGEX = re.compile(r"(\+?\d{1,4}[-\.\s]??)?(\(?\d{2,3}\)?[-.\s]??)?\d{3,4}[-.\s]??\d{4,6}")

# Social Links regular expressions
LINKEDIN_REGEX = re.compile(r"linkedin\.com/in/[a-zA-Z0-9\-\_]+")
GITHUB_REGEX = re.compile(r"github\.com/[a-zA-Z0-9\-\_]+")


def check_ats_compatibility(
    raw_text: str,
    metadata: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Perform multiple rule-based checks on resume text and parsing metadata.
    Returns a list of dicts:
    {
        "passed": bool,
        "severity": "error" | "warning" | "info",
        "message": str,
        "type": str
    }
    """
    issues = []

    # 1. Scanned Document check (Error)
    if metadata.get("is_scanned", False):
        issues.append({
            "passed": False,
            "severity": "error",
            "message": "Resume appears to be a scanned image. ATS engines cannot parse text from scans.",
            "type": "scanned_document"
        })
    else:
        issues.append({
            "passed": True,
            "severity": "info",
            "message": "Resume contains extractable text.",
            "type": "scanned_document"
        })

    # 2. PDF Tables check (Error)
    if metadata.get("file_type") == "pdf" and metadata.get("tables_detected", False):
        issues.append({
            "passed": False,
            "severity": "error",
            "message": "Tables detected in PDF. ATS systems fail to parse grid layouts correctly, often merging cells out of reading order.",
            "type": "tables_detected"
        })
    else:
        issues.append({
            "passed": True,
            "severity": "info",
            "message": "No table structures detected in PDF layout.",
            "type": "tables_detected"
        })

    # 3. Text Box/Drawing layout check (Warning)
    if metadata.get("has_text_boxes", False):
        issues.append({
            "passed": False,
            "severity": "warning",
            "message": "Text boxes or drawings detected. Text within shapes is frequently ignored by ATS processors.",
            "type": "text_boxes_detected"
        })

    # 4. Email address check (Warning)
    has_email = bool(EMAIL_REGEX.search(raw_text))
    if not has_email:
        issues.append({
            "passed": False,
            "severity": "warning",
            "message": "No email address detected. Recruiters will not be able to contact you.",
            "type": "email_missing"
        })
    else:
        issues.append({
            "passed": True,
            "severity": "info",
            "message": "Valid email address detected.",
            "type": "email_missing"
        })

    # 5. Phone number check (Warning)
    has_phone = bool(PHONE_REGEX.search(raw_text))
    if not has_phone:
        issues.append({
            "passed": False,
            "severity": "warning",
            "message": "No phone number detected. Contact details might be missing or in an unparseable structure.",
            "type": "phone_missing"
        })
    else:
        issues.append({
            "passed": True,
            "severity": "info",
            "message": "Phone number detected.",
            "type": "phone_missing"
        })

    # 6. Social Profile URL checks (Info)
    has_linkedin = bool(LINKEDIN_REGEX.search(raw_text))
    if not has_linkedin:
        issues.append({
            "passed": False,
            "severity": "info",
            "message": "No LinkedIn profile detected. Recruiters often look for online portfolio details.",
            "type": "linkedin_missing"
        })
    else:
        issues.append({
            "passed": True,
            "severity": "info",
            "message": "LinkedIn profile URL found.",
            "type": "linkedin_missing"
        })

    has_github = bool(GITHUB_REGEX.search(raw_text))
    if not has_github:
        issues.append({
            "passed": False,
            "severity": "info",
            "message": "No GitHub link detected. For technical roles, adding GitHub showcases active contributions.",
            "type": "github_missing"
        })
    else:
        issues.append({
            "passed": True,
            "severity": "info",
            "message": "GitHub profile URL found.",
            "type": "github_missing"
        })

    return issues
