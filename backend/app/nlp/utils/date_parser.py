"""
date_parser.py
Utility for parsing non-standard date strings in resumes into concrete date objects.
Supports formats like 'June 2021', '06/2021', '2019', 'Present'.
"""

import re
from datetime import date, datetime
from typing import Optional

# Mapping for month abbreviations/names to numeric values
MONTHS_MAP = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "september": 9, "sept": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12
}


def parse_resume_date(date_str: str) -> Optional[date]:
    """
    Parses a string representing a date in a resume (e.g. 'Jan 2018', '08/2020', 'Present')
    and returns a datetime.date object. Returns None if parsing fails.
    """
    if not date_str:
        return None

    cleaned_str = date_str.strip().lower()

    # If it represents the current active date
    if cleaned_str in ["present", "current", "now", "ongoing"]:
        return date.today()

    # Format 1: MM/YYYY or M/YYYY (e.g., 08/2020, 8/2020)
    match_numeric = re.match(r"^(\d{1,2})/(\d{4})$", cleaned_str)
    if match_numeric:
        month = int(match_numeric.group(1))
        year = int(match_numeric.group(2))
        if 1 <= month <= 12:
            return date(year, month, 1)

    # Format 2: MM-YYYY or M-YYYY (e.g., 08-2020)
    match_numeric_dash = re.match(r"^(\d{1,2})-(\d{4})$", cleaned_str)
    if match_numeric_dash:
        month = int(match_numeric_dash.group(1))
        year = int(match_numeric_dash.group(2))
        if 1 <= month <= 12:
            return date(year, month, 1)

    # Format 3: Month Year or Abbrev Year (e.g., "June 2021", "Jan 2021", "Jan. 2021")
    # Matches words followed optionally by a dot, and a 4 digit year
    match_alpha = re.match(r"^([a-z]{3,9})\.?\s+(\d{4})$", cleaned_str)
    if match_alpha:
        month_name = match_alpha.group(1)
        year = int(match_alpha.group(2))
        month_num = MONTHS_MAP.get(month_name)
        if month_num:
            return date(year, month_num, 1)

    # Format 4: Year Only (e.g., "2021")
    match_year = re.match(r"^(\d{4})$", cleaned_str)
    if match_year:
        year = int(match_year.group(1))
        # Default to Jan 1st for year-only fallbacks
        return date(year, 1, 1)

    # Format 5: Year Range Fallback - e.g. if we get "2015-2018", parse the end year
    match_range = re.search(r"(\d{4})$", cleaned_str)
    if match_range:
        year = int(match_range.group(1))
        return date(year, 1, 1)

    return None
