"""
text_cleaner.py
Utility for normalizing and cleaning parsed resume and job description text.
Ensures we preserve linebreaks (crucial for formatting and segmentation) and technical characters.
"""

import re
import unicodedata


def clean_text(text: str) -> str:
    """
    Cleans raw text by resolving unicode inconsistencies and spacing anomalies.
    Critical constraints:
    - Retain newlines (\\n) for section heuristics.
    - Keep technical abbreviations (C++, .NET, CI/CD, node.js).
    """
    if not text:
        return ""

    # Normalize unicode encoding (replaces characters like non-breaking spaces \xa0)
    text = unicodedata.normalize("NFKC", text)

    # Replace smart quotes and special dashes with standard equivalents
    text = re.sub(r"[\u201c\u201d\u201f\xaa\u2033\u2036]", '"', text)
    text = re.sub(r"[\u2018\u2019\u201b\xb4\u2032\u2035]", "'", text)
    text = re.sub(r"[\u2013\u2014\u2015\u2212]", "-", text)

    # Normalize paragraph-ending carriage returns
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Clean multiple spacing in a single line, but preserve single newlines
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        # Collapse multiple inline spaces (excluding newlines)
        cleaned_line = re.sub(r"[ \t\u00a0]+", " ", line)
        cleaned_lines.append(cleaned_line.strip())

    # Rejoin lines with standard newlines, removing redundant empty lines (>2 empty lines in a row)
    cleaned_text = "\n".join(cleaned_lines)
    cleaned_text = re.sub(r"\n{3,}", "\n\n", cleaned_text)

    return cleaned_text.strip()
