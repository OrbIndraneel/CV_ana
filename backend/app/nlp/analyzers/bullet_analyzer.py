"""
bullet_analyzer.py
Analyzes individual experience bullet points for quality and structure using SpaCy.
Checks for action verbs, quantified results, word count, and passive voice.
"""

import logging
import re
from typing import Any, Dict, List
from app.nlp.model_loader import model_loader

logger = logging.getLogger(__name__)

# Pattern for checking metrics/quantified results (e.g. 50%, $10K, 120 users)
METRIC_REGEX = re.compile(
    r"\b\d+[%xX$kKmM\+]|\$\d+|"
    r"\b\d+\s+(?:users|customers|clients|hours|days|months|years|percent|percent|dollars|people|million|billion|thousand|tasks)\b",
    re.IGNORECASE
)

# Lists of weak/vague starter phrases that should be avoided
WEAK_VERBS = {
    "helped", "assisted", "worked", "responsible", "handled", "managed", "led", "participated", "involved"
}

STRONG_ACTION_VERBS = {
    # Past tense forms
    "led", "built", "designed", "reduced", "optimized", "implemented", "created", "developed", "architected",
    "engineered", "spearheaded", "accelerated", "maximized", "pioneered", "restructured", "streamlined",
    "automated", "decreased", "increased", "generated", "delivered", "formulated", "executed",
    # Infinitive/Lemma base forms
    "lead", "build", "design", "reduce", "optimize", "implement", "create", "develop", "architect",
    "engineer", "spearhead", "accelerate", "maximize", "pioneer", "restructure", "streamline",
    "automate", "decrease", "increase", "generate", "deliver", "formulate", "execute"
}


def analyze_bullet_point(bullet_text: str) -> Dict[str, Any]:
    """
    Score a single bullet point on a scale of 0 to 10.
    Scoring weights:
    - Starts with strong action verb: +3 points
    - Contains quantified results (numbers/percentages/metrics): +4 points
    - Appropriate length (20 - 50 words): +2 points
    - Active voice (absence of passive constructions): +1 point
    """
    if not bullet_text or not bullet_text.strip():
        return {
            "bullet": "",
            "score": 0.0,
            "issues": ["Empty bullet point."],
            "suggestion": "Add detail to describe your achievements."
        }

    nlp = model_loader.spacy_nlp
    doc = nlp(bullet_text)

    score = 0
    issues = []
    suggestions = []

    # 1. Action Verb Check
    # Skip leading non-alpha tokens (like bullet shapes, tabs, spaces)
    first_token_idx = 0
    while first_token_idx < len(doc) and not doc[first_token_idx].is_alpha:
        first_token_idx += 1

    starts_with_action = False
    starts_with_strong_action = False

    if first_token_idx < len(doc):
        first_token = doc[first_token_idx]
        # Check POS tag in SpaCy
        if first_token.pos_ in ["VERB", "AUX"]:
            starts_with_action = True
            token_lower = first_token.text.lower()
            token_lemma = first_token.lemma_.lower()
            if token_lower in STRONG_ACTION_VERBS or token_lemma in STRONG_ACTION_VERBS:
                starts_with_strong_action = True

    if starts_with_strong_action:
        score += 3
    elif starts_with_action:
        score += 2
        issues.append("weak_verb")
        suggestions.append(
            f"Replace weak verb '{doc[first_token_idx].text}' with a stronger accomplishment-driven action verb "
            f"like 'Engineered', 'Spearheaded', or 'Optimized'."
        )
    else:
        issues.append("missing_action_verb")
        suggestions.append(
            "Start the bullet point with a strong action verb (e.g., 'Implemented', 'Created', 'Designed') "
            "rather than task-oriented descriptions."
        )

    # 2. Metric / Quantified Impact Check
    has_metric = bool(METRIC_REGEX.search(bullet_text))
    if has_metric:
        score += 4
    else:
        issues.append("missing_metrics")
        suggestions.append(
            "Add quantifiable metrics (e.g. percentages, headcount, dollars, hours saved) "
            "to demonstrate the scale and business impact of your work."
        )

    # 3. Word Count Check (Optimal: 20 to 50 words)
    words = [token.text for token in doc if not token.is_punct]
    word_count = len(words)

    if 20 <= word_count <= 50:
        score += 2
    else:
        issues.append("inappropriate_length")
        if word_count < 20:
            suggestions.append(
                f"Bullet is too short ({word_count} words). Expand by describing the action, tools used, "
                f"and business outcomes (e.g., 'Using X, designed Y which led to Z')."
            )
        else:
            suggestions.append(
                f"Bullet is wordy ({word_count} words). Keep descriptions concise and impactful "
                f"(ideally under 50 words) to ensure readability."
            )

    # 4. Passive Voice Check
    # In SpaCy, passive is indicated by the dependency tag 'auxpass' (passive auxiliary)
    has_passive = any(token.dep_ == "auxpass" for token in doc)
    if not has_passive:
        score += 1
    else:
        issues.append("passive_voice")
        suggestions.append(
            "Rephrase in the active voice (e.g. use 'Built a API' instead of 'An API was built')."
        )

    # Compile the final suggestions string
    final_suggestion = " ".join(suggestions) if suggestions else "Strong bullet point! No changes needed."

    return {
        "original": bullet_text,
        "score": round(score / 10.0, 2),  # Scale to 0.0 - 1.0 range internally
        "issues": issues,
        "suggestion": final_suggestion
    }


def analyze_bullets(bullets: List[str]) -> Dict[str, Any]:
    """
    Analyze list of bullet points and compile average quality report.
    """
    if not bullets:
        return {
            "average_score": 0.0,
            "feedback": []
        }

    feedback_list = []
    scores = []

    for bullet in bullets:
        res = analyze_bullet_point(bullet)
        feedback_list.append(res)
        scores.append(res["score"])

    avg_score = float(sum(scores) / len(scores)) if scores else 0.0

    return {
        "average_score": round(avg_score, 2),
        "feedback": feedback_list
    }
