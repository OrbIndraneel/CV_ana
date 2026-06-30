"""
keyword_matcher.py
Extracts required skills from job descriptions using a predefined skills taxonomy and SpaCy.
Checks exact, abbreviation, and synonym matches in resume text.
"""

import logging
import re
from typing import Any, Dict, List, Set
from app.nlp.model_loader import model_loader

logger = logging.getLogger(__name__)

# Basic Skills Taxonomy
SKILLS_TAXONOMY = {
    # Programming Languages
    "python": ["python", "py"],
    "javascript": ["javascript", "js", "react.js", "node.js"],
    "typescript": ["typescript", "ts"],
    "go": ["go", "golang"],
    "rust": ["rust"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp"],
    "java": ["java"],
    "ruby": ["ruby", "rails"],
    "php": ["php"],
    "swift": ["swift"],
    "kotlin": ["kotlin"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite"],
    "bash": ["bash", "shell"],

    # Frameworks and Libraries
    "react": ["react", "reactjs", "react.js"],
    "next.js": ["next.js", "nextjs"],
    "vue": ["vue", "vuejs", "vue.js"],
    "angular": ["angular", "angularjs"],
    "django": ["django"],
    "flask": ["flask"],
    "fastapi": ["fastapi"],
    "spring boot": ["spring boot", "spring"],
    "pytorch": ["pytorch"],
    "tensorflow": ["tensorflow", "tf"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],

    # Cloud & DevOps & Platforms
    "docker": ["docker", "containerization"],
    "kubernetes": ["kubernetes", "k8s"],
    "aws": ["aws", "amazon web services"],
    "gcp": ["gcp", "google cloud platform", "google cloud"],
    "azure": ["azure", "microsoft azure"],
    "terraform": ["terraform"],
    "git": ["git", "github", "gitlab"],
    "jenkins": ["jenkins", "ci/cd", "ci-cd"],
    "linux": ["linux", "unix"],

    # Databases
    "postgresql": ["postgresql", "postgres"],
    "mongodb": ["mongodb", "mongo"],
    "redis": ["redis"],
    "elasticsearch": ["elasticsearch", "elastic"],

    # Methodology & Core Concepts
    "agile": ["agile", "scrum", "kanban"],
    "rest api": ["rest api", "restful api", "rest", "apis"],
    "graphql": ["graphql"],
    "microservices": ["microservices", "soa"],
    "machine learning": ["machine learning", "ml", "deep learning"],
    "data science": ["data science", "analytics"]
}


def _normalize_token(text: str) -> str:
    """Normalizes string for comparison: lowercases, removes dots/dashes."""
    return re.sub(r"[\s\.\-\_]", "", text.lower())


def extract_skills(text: str) -> List[str]:
    """
    Extract skills present in the text based on our SKILLS_TAXONOMY.
    Uses basic string and token boundary checks.
    """
    nlp = model_loader.spacy_nlp
    doc = nlp(text.lower())
    doc_text = doc.text

    extracted_skills = []

    for skill, synonyms in SKILLS_TAXONOMY.items():
        # Check all synonyms
        for syn in synonyms:
            # Match word boundaries to avoid partial matching (e.g. 'go' matching 'google')
            # C++ needs special boundary handling since '+' is a regex metacharacter
            escaped_syn = re.escape(syn)
            if syn in ["c++", "c#"]:
                pattern = r"(?:^|\s|[,\.;:\'\"])" + escaped_syn + r"(?:$|\s|[,\.;:\'\"])"
            else:
                pattern = r"\b" + escaped_syn + r"\b"

            if re.search(pattern, doc_text):
                extracted_skills.append(skill)
                break  # If one synonym is found, skill is present. Move to next.

    return list(set(extracted_skills))


def match_keywords(
    resume_text: str,
    jd_skills: List[str]
) -> List[Dict[str, Any]]:
    """
    Check matching rates of JD skills within the resume text.
    Returns detail mapping of matched/missing keywords:
    [{ "keyword": str, "found": bool, "synonym_matched": bool, "matched_alias": str }]
    """
    normalized_resume = resume_text.lower()
    results = []

    for skill in jd_skills:
        aliases = SKILLS_TAXONOMY.get(skill, [skill])
        found = False
        synonym_matched = False
        matched_alias = ""

        for idx, alias in enumerate(aliases):
            # Check boundaries
            escaped_alias = re.escape(alias)
            if alias in ["c++", "c#"]:
                pattern = r"(?:^|\s|[,\.;:\'\"])" + escaped_alias + r"(?:$|\s|[,\.;:\'\"])"
            else:
                pattern = r"\b" + escaped_alias + r"\b"

            if re.search(pattern, normalized_resume):
                found = True
                matched_alias = alias
                # If matched the main name, it is a primary match; else synonym match
                if idx > 0:
                    synonym_matched = True
                break

        results.append({
            "keyword": skill,
            "found": found,
            "synonym_matched": synonym_matched,
            "matched_alias": matched_alias if found else None
        })

    return results
