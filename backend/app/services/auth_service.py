"""
auth_service.py
Business logic layer for User registration and Authentication services.
Coordinates with user models and security modules to process registrations and credentials verification.
"""

import logging
from datetime import timedelta
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.core.exceptions import (
    AuthenticationException,
    DuplicateEntityException,
    EntityNotFoundException,
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    create_password_reset_token,
    decode_token,
)
from app.models.user import User
from app.schemas.user import UserCreate, Token

logger = logging.getLogger(__name__)


class AuthService:
    """
    Handles operations related to user creation, authentication, and JWT lifecycle management.
    """

    @staticmethod
    async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
        """
        Register a new user account.
        Checks for duplicate email before hashing the password and committing to the DB.
        """
        # Check if email is already taken
        query = select(User).filter(User.email == user_in.email)
        result = await db.execute(query)
        existing_user = result.scalars().first()

        if existing_user:
            logger.warning(f"Registration failed: Email {user_in.email} already exists.")
            raise DuplicateEntityException(
                detail="A user with this email address already exists.",
                code="EMAIL_EXISTS"
            )

        # Hash password and create User instance
        hashed_pw = get_password_hash(user_in.password)
        new_user = User(
            email=user_in.email,
            hashed_password=hashed_pw,
            full_name=user_in.full_name,
            is_active=True
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        logger.info(f"Successfully registered user with ID: {new_user.id}")
        return new_user

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> Token:
        """
        Verify credentials and return access + refresh tokens.
        """
        query = select(User).filter(User.email == email)
        result = await db.execute(query)
        user = result.scalars().first()

        if not user or not verify_password(password, user.hashed_password):
            logger.warning(f"Authentication failed: Invalid credentials for user {email}")
            raise AuthenticationException(
                detail="Incorrect email or password.",
                code="INVALID_CREDENTIALS"
            )

        if not user.is_active:
            logger.warning(f"Authentication failed: Account inactive for user {email}")
            raise AuthenticationException(
                detail="User account is inactive.",
                code="USER_INACTIVE"
            )

        # Generate tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        logger.info(f"User {user.id} logged in successfully.")
        return Token(
            access_token=access_token,
            refresh_token=refresh_token
        )

    @staticmethod
    async def refresh_access_token(db: AsyncSession, refresh_token: str) -> Token:
        """
        Exchange a valid refresh token for a new access token and a fresh refresh token.
        """
        try:
            payload = decode_token(refresh_token)
            user_id: str = payload.get("sub")
            token_type: str = payload.get("type")

            if user_id is None or token_type != "refresh":
                raise AuthenticationException(
                    detail="Invalid refresh token structure.",
                    code="INVALID_REFRESH_TOKEN"
                )
        except JWTError:
            raise AuthenticationException(
                detail="Refresh token is expired or invalid.",
                code="EXPIRED_OR_INVALID_REFRESH_TOKEN"
            )

        # Confirm user exists and is active
        query = select(User).filter(User.id == user_id)
        result = await db.execute(query)
        user = result.scalars().first()

        if not user:
            raise EntityNotFoundException(
                detail="User associated with token not found.",
                code="USER_NOT_FOUND"
            )

        if not user.is_active:
            raise AuthenticationException(
                detail="User account is inactive.",
                code="USER_INACTIVE"
            )

        # Generate new token pair (refresh token rotation)
        new_access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)

        logger.info(f"Rotated tokens for user {user.id}.")
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token
        )

    @staticmethod
    async def logout_user(token: str) -> None:
        """
        Invalidate a session on the backend.
        Architectural Note: In a production stateless JWT setup, tokens can be blacklisted
        in a fast cache like Redis with a TTL matching the token's expiration.
        For this foundation build, we acknowledge the logout request; client-side discarding
        handles token disposal, but hooks can be placed here to write token hashes to Redis blocklists.
        """
        # Here we would run: await cache.set(f"blacklist:{token_jti}", "1", ex=expiry_seconds)
        logger.info("User session closed on backend.")
        return

    @staticmethod
    async def forgot_password(db: AsyncSession, email: str) -> str:
        """
        Initiate forgot password process.
        Generates and returns a reset token for a valid registered email.
        """
        query = select(User).filter(User.email == email)
        result = await db.execute(query)
        user = result.scalars().first()

        if not user:
            logger.warning(f"Forgot password failed: Email {email} not found.")
            raise EntityNotFoundException(
                detail="A user with this email address does not exist.",
                code="USER_NOT_FOUND"
            )

        if not user.is_active:
            logger.warning(f"Forgot password failed: Account inactive for email {email}")
            raise AuthenticationException(
                detail="User account is inactive.",
                code="USER_INACTIVE"
            )

        reset_token = create_password_reset_token(subject=user.email)
        logger.info(f"Password reset token generated for user {user.id} ({email}). Token: {reset_token}")
        return reset_token

    @staticmethod
    async def reset_password(db: AsyncSession, token: str, new_password: str) -> None:
        """
        Verify the reset token and reset the user's password.
        """
        try:
            payload = decode_token(token)
            email: str = payload.get("sub")
            token_type: str = payload.get("type")

            if email is None or token_type != "password-reset":
                raise AuthenticationException(
                    detail="Invalid reset token structure.",
                    code="INVALID_RESET_TOKEN"
                )
        except JWTError:
            raise AuthenticationException(
                detail="Reset token is expired or invalid.",
                code="EXPIRED_OR_INVALID_RESET_TOKEN"
            )

        # Check if user exists and is active
        query = select(User).filter(User.email == email)
        result = await db.execute(query)
        user = result.scalars().first()

        if not user:
            raise EntityNotFoundException(
                detail="User associated with token not found.",
                code="USER_NOT_FOUND"
            )

        if not user.is_active:
            raise AuthenticationException(
                detail="User account is inactive.",
                code="USER_INACTIVE"
            )

        # Hash and update password
        hashed_pw = get_password_hash(new_password)
        user.hashed_password = hashed_pw
        db.add(user)
        await db.commit()

        logger.info(f"Successfully reset password for user {user.id} ({email}).")

