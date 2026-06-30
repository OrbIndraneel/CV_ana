"""
semantic_scorer.py
Calculates semantic similarity between resume bullet points and job description requirements.
Uses sentence-transformers to encode sentences and computes cosine similarity matrices.
"""

import logging
from typing import Any, Dict, List
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from app.nlp.model_loader import model_loader

logger = logging.getLogger(__name__)

# Heuristic list of words indicating that a sentence contains a job requirement
REQUIREMENT_KEYWORDS = [
    "must", "required", "should", "preferred", "experience", "years", "knowledge",
    "understanding", "ability", "proficient", "skills", "background", "degree",
    "bs", "ms", "phd", "expert", "strong", "familiarity", "build", "design", "develop"
]


def extract_requirements(jd_text: str) -> List[str]:
    """
    Split the job description text into sentences and filter for sentences
    that likely describe candidate requirements or job specifications.
    """
    if not jd_text:
        return []

    nlp = model_loader.spacy_nlp
    doc = nlp(jd_text)
    sentences = [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 15]

    req_sentences = []
    for sent in sentences:
        sent_lower = sent.lower()
        # If the sentence contains any of the requirement indicator terms, keep it
        if any(keyword in sent_lower for keyword in REQUIREMENT_KEYWORDS):
            req_sentences.append(sent)

    # Fallback to all sentences if the filter ends up empty
    if not req_sentences:
        req_sentences = sentences[:15]  # Limit to first 15 lines as fallback

    logger.info(f"Extracted {len(req_sentences)} requirement sentences from JD.")
    return req_sentences


def compute_semantic_scores(
    resume_bullets: List[str],
    jd_requirements: List[str]
) -> Dict[str, Any]:
    """
    Compute semantic scores between resume bullets and JD requirements.
    Rules:
    - Encode bullets and requirements as embedding vectors.
    - Compute cosine similarity matrix.
    - Find max similarity for each requirement.
    - overall_score = average of max similarities.
    - Gaps: requirements with max similarity < 0.3.
    - Strong matches: requirements with max similarity > 0.7.
    """
    if not resume_bullets or not jd_requirements:
        return {
            "semantic_score": 0.0,
            "top_matches": [],
            "gaps": [],
            "matches_detail": []
        }

    try:
        model = model_loader.sentence_transformer

        # Encode sentences
        logger.debug("Encoding resume bullets and JD requirements...")
        bullet_embeddings = model.encode(resume_bullets)
        req_embeddings = model.encode(jd_requirements)

        # Compute cosine similarity matrix: shape (len(requirements), len(bullets))
        # Note: cosine_similarity returns a 2D array
        sim_matrix = cosine_similarity(req_embeddings, bullet_embeddings)

        gaps = []
        strong_matches = []
        matches_detail = []
        max_similarities = []

        for req_idx, req_text in enumerate(jd_requirements):
            # Row similarities for the current requirement
            req_similarities = sim_matrix[req_idx]
            max_sim_idx = int(np.argmax(req_similarities))
            max_similarity = float(req_similarities[max_sim_idx])
            matched_bullet = resume_bullets[max_sim_idx]

            max_similarities.append(max_similarity)

            match_data = {
                "requirement": req_text,
                "matched_bullet": matched_bullet,
                "similarity": round(max_similarity, 3)
            }

            matches_detail.append(match_data)

            if max_similarity < 0.35:
                gaps.append({
                    "requirement": req_text,
                    "max_similarity": round(max_similarity, 3)
                })
            elif max_similarity >= 0.70:
                strong_matches.append(match_data)

        # Calculate average semantic similarity
        overall_semantic_score = float(np.mean(max_similarities)) if max_similarities else 0.0

        result = {
            "semantic_score": round(overall_semantic_score, 3),
            "top_matches": strong_matches[:5],  # Top 5 strongest matching items
            "gaps": gaps,
            "matches_detail": matches_detail
        }

        logger.info(f"Semantic scoring completed. Score: {overall_semantic_score:.3f}")
        return result

    except Exception as e:
        logger.error(f"Error computing semantic scores: {e}", exc_info=True)
        return {
            "semantic_score": 0.0,
            "top_matches": [],
            "gaps": [
                {"requirement": req, "max_similarity": 0.0} for req in jd_requirements
            ],
            "matches_detail": []
        }
