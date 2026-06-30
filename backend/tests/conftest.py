"""
conftest.py
Configures pytest fixtures for the Resume Analyzer Pro test suite.
Provides TestClient instances for routing and security integration testing.
"""

import pytest
from typing import Generator
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    """
    Fixture providing a synchronous TestClient configured with the FastAPI app.
    """
    with TestClient(app) as test_client:
        yield test_client
