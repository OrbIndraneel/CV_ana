"""
__init__.py
Consolidates all API routers into a single root router (api_router) to register in the FastAPI app.
"""

from fastapi import APIRouter
from app.api.routes import auth, resumes, jobs, analysis, monetization, challenge

api_router = APIRouter()

# Register routes with prefixes and tags
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(monetization.router, prefix="/monetization", tags=["Monetization"])
api_router.include_router(challenge.router, prefix="/challenge", tags=["Challenge"])
