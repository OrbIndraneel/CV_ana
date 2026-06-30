"""
role_classifier.py
Classifies job descriptions into standard role categories (SWE, Data Science, ML Engineer, DevOps, PM, Design, Other)
using precomputed role prototype embeddings and cosine similarity.
"""

import logging
from typing import Dict, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from app.nlp.model_loader import model_loader

logger = logging.getLogger(__name__)

# Text prototypes defining the core scope of standard tech roles
ROLE_PROTOTYPES = {
    "Software Engineer": (
        "software engineer, fullstack developer, backend developer, frontend developer, "
        "software architecture, web applications, coding standards, databases, REST APIs, "
        "typescript, java, python, c++, computer science fundamentals, git, system design"
    ),
    "Data Scientist": (
        "data scientist, statistical modeling, data analysis, pandas, numpy, scikit-learn, "
        "exploratory data analysis, SQL queries, Jupyter notebooks, dashboards, metrics, R, "
        "predictive analytics, experimentation, A/B testing"
    ),
    "ML Engineer": (
        "machine learning engineer, deep learning, PyTorch, TensorFlow, neural networks, "
        "model deployment, ML pipelines, NLP, computer vision, large language models, LLMs, "
        "model optimization, reinforcement learning, MLops"
    ),
    "DevOps Engineer": (
        "devops engineer, site reliability engineer, SRE, CI/CD pipelines, containerization, "
        "kubernetes, docker, terraform, infrastructure as code, AWS, GCP, cloud architecture, "
        "ansible, linux administration, system monitoring, prometheus, grafana"
    ),
    "Product Manager": (
        "product manager, PM, product roadmap, requirements gathering, PRD, user stories, "
        "agile, scrum, product strategy, stakeholder management, product lifecycle, "
        "customer research, market analysis, KPI definition"
    ),
    "UX/UI Designer": (
        "ux designer, ui designer, product designer, figma, user experience, user interface, "
        "wireframing, prototyping, user research, design systems, usability testing, "
        "user journeys, mockups, interaction design"
    )
}

# In-memory cache for prototype embeddings
_prototype_embeddings: Dict[str, np.ndarray] = {}


def _get_prototype_embeddings() -> Dict[str, np.ndarray]:
    """
    Lazy-load and cache the embeddings for the role prototypes.
    """
    global _prototype_embeddings
    if not _prototype_embeddings:
        logger.info("Computing embeddings for role prototypes...")
        model = model_loader.sentence_transformer
        for role, description in ROLE_PROTOTYPES.items():
            # Encode description and store vector
            _prototype_embeddings[role] = model.encode(description)
        logger.info("Role prototype embeddings cached.")
    return _prototype_embeddings


def classify_role(jd_text: str) -> Tuple[str, Dict[str, float]]:
    """
    Encode job description text and compare it to role prototype embeddings.
    Returns:
        tuple (best_matched_role, dict_of_all_similarities)
    """
    if not jd_text or not jd_text.strip():
        return "Other", {}

    try:
        model = model_loader.sentence_transformer
        jd_vector = model.encode(jd_text).reshape(1, -1)
        prototypes = _get_prototype_embeddings()

        similarities = {}
        for role, proto_vector in prototypes.items():
            proto_vector_reshaped = proto_vector.reshape(1, -1)
            # Calculate cosine similarity
            sim = float(cosine_similarity(jd_vector, proto_vector_reshaped)[0][0])
            similarities[role] = sim

        # Identify highest similarity score
        best_role = "Other"
        max_sim = 0.0

        if similarities:
            best_role = max(similarities, key=similarities.get)
            max_sim = similarities[best_role]

        # Apply a threshold to classify as "Other" if matching is very low
        if max_sim < 0.22:
            logger.info(f"Low similarity match ({max_sim:.2f}). Fallback to 'Other'.")
            best_role = "Other"

        logger.info(f"Classified JD role as: {best_role} (sim: {max_sim:.2f})")
        return best_role, similarities

    except Exception as e:
        logger.error(f"Error during role classification: {e}", exc_info=True)
        return "Other", {}
