"""
test_security.py
Unit tests for checking security utilities, password hashing, and JWT token operations.
"""

import pytest
from datetime import timedelta
from jose import jwt
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.config import settings


def test_password_hashing() -> None:
    """
    Test that passwords are hashed and can be verified correctly.
    """
    password = "supersecretpassword123"
    hashed = get_password_hash(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_jwt_access_token_creation_and_decoding() -> None:
    """
    Test that access tokens can be created and decoded correctly.
    """
    user_id = "550e8400-e29b-41d4-a716-446655440000"
    token = create_access_token(subject=user_id)
    decoded = decode_token(token)

    assert decoded["sub"] == user_id
    assert decoded["type"] == "access"
    assert "exp" in decoded


def test_jwt_refresh_token_creation_and_decoding() -> None:
    """
    Test that refresh tokens can be created and decoded correctly.
    """
    user_id = "550e8400-e29b-41d4-a716-446655440000"
    token = create_refresh_token(subject=user_id)
    decoded = decode_token(token)

    assert decoded["sub"] == user_id
    assert decoded["type"] == "refresh"
    assert "exp" in decoded


def test_jwt_token_expiration() -> None:
    """
    Test that tokens configured with small or expired lifespan raise errors when decoded.
    """
    from jose.exceptions import ExpiredSignatureError

    user_id = "550e8400-e29b-41d4-a716-446655440000"
    # Create token that expired 1 second ago
    token = create_access_token(subject=user_id, expires_delta=timedelta(seconds=-1))

    with pytest.raises(ExpiredSignatureError):
        decode_token(token)
