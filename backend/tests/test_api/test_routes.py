"""
test_routes.py
API endpoints integration tests.
Tests health status, route security boundaries, and mocks active session handlers.
"""

import uuid
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.dependencies import get_current_active_user, get_db
from datetime import datetime
from app.models.user import User
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.services.resume_service import ResumeService
from app.services.job_service import JobService
from app.services.analysis_service import AnalysisService

# Mock User instance
mock_user_id = uuid.uuid4()
mock_user = User(
    id=mock_user_id,
    email="testuser@example.com",
    full_name="Test User",
    is_active=True
)


def mock_current_active_user() -> User:
    """Mock dependency check that returns a placeholder user."""
    return mock_user


def mock_db_session() -> MagicMock:
    """Mock database session."""
    return MagicMock()


@pytest.fixture(autouse=True)
def setup_dependency_overrides():
    """
    Override dependencies during test executions and clear them afterwards.
    """
    app.dependency_overrides[get_current_active_user] = mock_current_active_user
    app.dependency_overrides[get_db] = mock_db_session
    yield
    app.dependency_overrides.clear()


def test_health_check(client: TestClient) -> None:
    """
    Test that the unauthenticated health endpoint is accessible and returning success.
    """
    # Temporarily remove active override to test clean path
    app.dependency_overrides.clear()
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_secured_routes_blocked_without_auth(client: TestClient) -> None:
    """
    Test that secured endpoints block unauthenticated requests.
    """
    app.dependency_overrides.clear()
    # Attempting to fetch resumes without token
    response = client.get("/api/v1/resumes/")
    assert response.status_code == 401


def test_list_resumes_endpoint(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """
    Test authenticated resumes list endpoint.
    """
    mock_resumes = [
        Resume(
            id=uuid.uuid4(),
            user_id=mock_user_id,
            filename="cv1.pdf",
            file_path="path/1",
            raw_text="Sample text",
            version_number=1,
            uploaded_at=datetime.now()
        )
    ]

    async def mock_get_resumes(db, user_id):
        return mock_resumes

    # Patch ResumeService
    monkeypatch.setattr(ResumeService, "get_resumes", mock_get_resumes)

    response = client.get("/api/v1/resumes/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["filename"] == "cv1.pdf"


def test_list_jobs_endpoint(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """
    Test authenticated jobs list endpoint.
    """
    mock_jds = [
        JobDescription(
            id=uuid.uuid4(),
            user_id=mock_user_id,
            title="PM",
            company="Google",
            raw_text="text",
            detected_role="PM",
            required_skills=["Agile"],
            created_at=datetime.now()
        )
    ]

    async def mock_get_jds(db, user_id):
        return mock_jds

    # Patch JobService
    monkeypatch.setattr(JobService, "get_job_descriptions", mock_get_jds)

    response = client.get("/api/v1/jobs/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "PM"
    assert data[0]["company"] == "Google"
