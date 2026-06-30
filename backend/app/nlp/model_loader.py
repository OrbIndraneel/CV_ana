"""
model_loader.py
Thread-safe singleton class for loading and accessing heavy NLP models.
Loads models once during startup lifespan events.
"""

import logging
import time
from threading import Lock
from typing import Optional

import spacy
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class ModelLoader:
    _instance: Optional["ModelLoader"] = None
    _lock: Lock = Lock()

    def __new__(cls, *args, **kwargs):
        """
        Thread-safe singleton initialization.
        """
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ModelLoader, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return

        self._spacy_model = None
        self._sentence_transformer = None
        self._initialized = True

    def load_models(self) -> None:
        """
        Loads the NLP models into memory.
        Safe to call multiple times (checks if already loaded).
        """
        with self._lock:
            # Load SpaCy model
            if self._spacy_model is None:
                logger.info("Loading SpaCy en_core_web_lg model...")
                start_time = time.time()
                try:
                    self._spacy_model = spacy.load("en_core_web_lg")
                    logger.info(f"SpaCy model loaded in {time.time() - start_time:.2f} seconds.")
                except Exception as e:
                    logger.critical(f"Failed to load SpaCy model: {e}")
                    raise RuntimeError(f"Could not initialize SpaCy model: {e}") from e

            # Load Sentence Transformer model
            if self._sentence_transformer is None:
                logger.info("Loading SentenceTransformer all-MiniLM-L6-v2 model...")
                start_time = time.time()
                try:
                    self._sentence_transformer = SentenceTransformer("all-MiniLM-L6-v2")
                    logger.info(f"SentenceTransformer loaded in {time.time() - start_time:.2f} seconds.")
                except Exception as e:
                    logger.critical(f"Failed to load SentenceTransformer: {e}")
                    raise RuntimeError(f"Could not initialize SentenceTransformer model: {e}") from e

    @property
    def spacy_nlp(self) -> spacy.language.Language:
        """
        Get the loaded SpaCy NLP pipeline.
        Implicitly loads models if not loaded yet.
        """
        if self._spacy_model is None:
            self.load_models()
        return self._spacy_model

    @property
    def sentence_transformer(self) -> SentenceTransformer:
        """
        Get the loaded SentenceTransformer model.
        Implicitly loads models if not loaded yet.
        """
        if self._sentence_transformer is None:
            self.load_models()
        return self._sentence_transformer


# Initialize the global loader singleton instance
model_loader = ModelLoader()
