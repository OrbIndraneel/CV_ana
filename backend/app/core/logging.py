"""
logging.py
Structured logging setup for Resume Analyzer Pro.
Sets up logging handlers for console output with appropriate formatting.
"""

import logging
import sys
from app.config import settings


def setup_logging() -> None:
    """
    Configure the root logger with a standardized console handler and format.
    Log levels are set based on the environment.
    """
    log_level = logging.INFO
    if settings.ENVIRONMENT == "development":
        log_level = logging.DEBUG

    # Logging format structure
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    # Set specific third-party library levels to avoid log clutter
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)

    logger = logging.getLogger(__name__)
    logger.info(f"Logging initialized with level: {logging.getLevelName(log_level)}")
