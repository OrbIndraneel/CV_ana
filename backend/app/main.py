"""
main.py
Main entrypoint for the Resume Analyzer Pro FastAPI application.
Handles lifecycle events, CORS middleware, global exception handlers, and mounts API routers.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from app.api.middleware import setup_cors, RateLimitMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.future import select

from app.api.routes import api_router
from app.config import settings
from app.core.exceptions import AppBaseException
from app.core.logging import setup_logging
from app.db.session import engine


# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown lifecycle events.
    """
    logger.info("Application starting up...")

    # Validate database connection
    try:
        async with engine.connect() as conn:
            await conn.execute(select(1))
        logger.info("Database connection established successfully.")
    except Exception as e:
        logger.critical(f"Database connection failed: {e}")

    yield

    # Shutdown events
    logger.info("Cleaning up engine connections...")
    await engine.dispose()
    logger.info("Application shut down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Resume Analyzer Pro Backend API using NLP to analyze resumes against JDs.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Mount Middlewares (CORS and Redis Rate Limiting)
setup_cors(app)
app.add_middleware(
    RateLimitMiddleware,
    redis_url=settings.REDIS_URL,
    limit=100,
    window=60
)

# Register consolidated API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


# Health check endpoint
@app.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
async def health_check():
    """
    System status endpoint.
    """
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }


# Exception Handler for Custom App Exceptions
@app.exception_handler(AppBaseException)
async def app_exception_handler(request: Request, exc: AppBaseException) -> JSONResponse:
    """
    Formats custom application exceptions into a standardized API shape:
    { "detail": "Human-readable message", "code": "ERROR_CODE" }
    """
    logger.error(f"App exception: {exc.code} - {exc.detail} on request {request.url.path}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "code": exc.code},
        headers=exc.headers
    )


# Exception Handler for Request Validation Errors (Pydantic models validation)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Standardizes validation error shapes to match our error format:
    { "detail": "Human-readable details of invalid inputs", "code": "VALIDATION_ERROR" }
    """
    error_details = exc.errors()
    # Create a cleaner detail message listing the invalid fields
    fields_msg = "; ".join([f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in error_details])
    detail_str = f"Validation failed: {fields_msg}"

    logger.warning(f"Validation failure: {detail_str} on request {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": detail_str,
            "code": "VALIDATION_FAILED"
        }
    )


# General Exception Handler (Fallback)
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catches all unhandled server exceptions, logs trace details, and outputs standard error shape.
    """
    logger.exception(f"Unhandled exception occurred: {exc} on request {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred on the server.",
            "code": "INTERNAL_SERVER_ERROR"
        }
    )
