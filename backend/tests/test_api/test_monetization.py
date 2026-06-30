"""
test_monetization.py
Integration tests for the monetization API endpoints.
Mocks StripeService responses to verify proper request and response mapping.
"""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.dependencies import get_current_active_user, get_db
from app.models.user import User

# Mock User instance
mock_user_id = uuid.uuid4()
mock_user = User(
    id=mock_user_id,
    email="premiumuser@example.com",
    full_name="Premium Tester",
    is_active=True,
    subscription_tier="free",
    subscription_status="inactive"
)


def mock_current_active_user() -> User:
    return mock_user


def mock_db_session():
    return AsyncMock()


@pytest.fixture(autouse=True)
def setup_dependency_overrides():
    app.dependency_overrides[get_current_active_user] = mock_current_active_user
    app.dependency_overrides[get_db] = mock_db_session
    yield
    app.dependency_overrides.clear()


@pytest.mark.anyio
async def test_create_checkout_session_success(client: TestClient) -> None:
    """
    Test successful Stripe checkout session URL generation.
    """
    mock_url = "https://checkout.stripe.com/pay/cs_test_mockurl"
    
    with patch("app.services.stripe_service.StripeService.create_checkout_session", new_callable=AsyncMock) as mock_checkout:
        mock_checkout.return_value = mock_url
        
        response = client.post(
            "/api/v1/monetization/checkout",
            json={
                "tier": "pro",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel"
            }
        )
        
        assert response.status_code == 200
        assert response.json() == {"url": mock_url}
        mock_checkout.assert_called_once_with(
            user_id=mock_user_id,
            tier="pro",
            success_url="https://example.com/success",
            cancel_url="https://example.com/cancel",
            db=pytest.anyint if hasattr(pytest, "anyint") else mock_checkout.call_args[1]["db"]
        )


@pytest.mark.anyio
async def test_create_checkout_session_failure(client: TestClient) -> None:
    """
    Test checkout session URL generation failure handles HTTP 400.
    """
    with patch("app.services.stripe_service.StripeService.create_checkout_session", new_callable=AsyncMock) as mock_checkout:
        mock_checkout.return_value = None
        
        response = client.post(
            "/api/v1/monetization/checkout",
            json={
                "tier": "invalid_tier",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel"
            }
        )
        
        assert response.status_code == 400
        assert "Invalid tier selection" in response.json()["detail"]


@pytest.mark.anyio
async def test_create_portal_session_success(client: TestClient) -> None:
    """
    Test successful customer billing portal session URL generation.
    """
    mock_url = "https://billing.stripe.com/p/session/mock_portal_url"
    
    with patch("app.services.stripe_service.StripeService.create_portal_session", new_callable=AsyncMock) as mock_portal:
        mock_portal.return_value = mock_url
        
        response = client.post(
            "/api/v1/monetization/portal",
            json={"return_url": "https://example.com/settings"}
        )
        
        assert response.status_code == 200
        assert response.json() == {"url": mock_url}


@pytest.mark.anyio
async def test_create_portal_session_failure(client: TestClient) -> None:
    """
    Test billing portal session failure returns HTTP 400.
    """
    with patch("app.services.stripe_service.StripeService.create_portal_session", new_callable=AsyncMock) as mock_portal:
        mock_portal.return_value = None
        
        response = client.post(
            "/api/v1/monetization/portal",
            json={"return_url": "https://example.com/settings"}
        )
        
        assert response.status_code == 400
        assert "Could not initialize billing portal" in response.json()["detail"]


@pytest.mark.anyio
async def test_webhook_success(client: TestClient) -> None:
    """
    Test Stripe webhook endpoint returns 200 on successful event processing.
    """
    with patch("app.services.stripe_service.StripeService.process_webhook_event", new_callable=AsyncMock) as mock_webhook:
        mock_webhook.return_value = True
        
        response = client.post(
            "/api/v1/monetization/webhook",
            content=b"event_payload",
            headers={"stripe-signature": "t=123,v1=abc"}
        )
        
        assert response.status_code == 200
        assert response.json() == {"status": "success"}


@pytest.mark.anyio
async def test_webhook_failure(client: TestClient) -> None:
    """
    Test Stripe webhook endpoint returns 400 on signature/verification failure.
    """
    with patch("app.services.stripe_service.StripeService.process_webhook_event", new_callable=AsyncMock) as mock_webhook:
        mock_webhook.return_value = False
        
        response = client.post(
            "/api/v1/monetization/webhook",
            content=b"event_payload",
            headers={"stripe-signature": "invalid"}
        )
        
        assert response.status_code == 400
        assert "Invalid signature" in response.json()["detail"]
