"""
config.py
Module-level configuration for the Resume Analyzer Pro application.
Loads and validates settings from environment variables.
"""

import json
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Resume Analyzer Pro"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/resume_analyzer"

    # Redis (used for Celery broker and backend)
    REDIS_URL: str = "redis://redis:6379/0"

    # Security & JWT
    SECRET_KEY: str = "supersecretkeychangeinproduction"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Stripe Settings
    STRIPE_SECRET_KEY: str = "sk_test_51MockSecretKeyForCVDada2026"
    STRIPE_PUBLISHABLE_KEY: str = "pk_test_51MockPublishableKeyForCVDada2026"
    STRIPE_WEBHOOK_SECRET: str = "whsec_MockWebhookSecretKeyForCVDada2026"
    
    # Stripe Price IDs mapping to subscription tiers
    STRIPE_PRICE_PRO: str = "price_pro_monthly"
    STRIPE_PRICE_PRO_PLUS: str = "price_pro_plus_monthly"
    STRIPE_PRICE_TEAM: str = "price_team_monthly"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                raise ValueError(f"Could not parse CORS_ORIGINS as JSON list: {v}")
        return v

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
