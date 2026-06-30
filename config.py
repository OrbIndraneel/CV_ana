"""
Centralized app configuration. Pulls from environment variables / .env file.
Keeping this in one place avoids magic strings scattered across services.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "AI Resume Analyzer"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/resume_analyzer"

    # Auth
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # NLP model names — centralized so swapping models is a one-line change
    SPACY_MODEL: str = "en_core_web_sm"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Upload constraints
    MAX_UPLOAD_SIZE_MB: int = 5
    ALLOWED_EXTENSIONS: set[str] = {".pdf", ".docx"}

    # Scoring weights — tunable without touching service logic
    WEIGHT_SEMANTIC_MATCH: float = 0.35
    WEIGHT_KEYWORD_MATCH: float = 0.15
    WEIGHT_BULLET_QUALITY: float = 0.25
    WEIGHT_ATS_COMPATIBILITY: float = 0.15
    WEIGHT_STRUCTURE: float = 0.10


settings = Settings()
