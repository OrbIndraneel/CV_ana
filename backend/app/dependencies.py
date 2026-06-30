"""
dependencies.py
FastAPI dependency injection utilities for route handlers.
Handles database session lifecycle and JWT user authentication checks.
"""

from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.core.exceptions import AuthenticationException, EntityNotFoundException
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User

# OAuth2 scheme definition, reading Bearer token from Authorization headers.
# Points to login path for auto-swagger authorization integration.
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Validate the request's JWT access token and return the associated User model.
    Raises AuthenticationException if token is invalid or expired.
    """
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")

        if user_id is None or token_type != "access":
            raise AuthenticationException(
                detail="Could not validate credentials: invalid token scope.",
                code="INVALID_TOKEN"
            )
    except JWTError:
        raise AuthenticationException(
            detail="Could not validate credentials: token has expired or is invalid.",
            code="EXPIRED_OR_INVALID_TOKEN"
        )

    # Query the user from the database
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise EntityNotFoundException(
            detail="User not found associated with this token.",
            code="USER_NOT_FOUND"
        )

    if not user.is_active:
        raise AuthenticationException(
            detail="This user account has been deactivated.",
            code="USER_INACTIVE"
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Ensure the current user is active. (Sub-dependency of get_current_user).
    """
    # Active check is already performed in get_current_user, but we export this
    # to maintain separation of concerns if future validation rules are added.
    return current_user


def requires_tier(min_tier: str):
    """
    Dependency factor to restrict routes to specific subscription tiers.
    Raises HTTP 402 (Payment Required) if user is not eligible.
    """
    async def dependency(current_user: User = Depends(get_current_active_user)) -> User:
        tier_hierarchy = {
            "free": 0,
            "pro": 1,
            "pro_plus": 2,
            "team": 3
        }
        
        user_tier = current_user.subscription_tier or "free"
        
        # Hierarchy eligibility check
        if tier_hierarchy.get(user_tier, 0) < tier_hierarchy.get(min_tier, 0):
            # Check if subscription status is past due/canceled
            if user_tier != "free" and current_user.subscription_status != "active":
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail="Subscription payment is required or past due."
                )
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"This feature requires a {min_tier.upper()} subscription tier."
            )
        return current_user
    return dependency
