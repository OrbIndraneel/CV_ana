"""
auth.py
API endpoints for User Registration, Login, Token Refresh, and Logout.
"""

from fastapi import APIRouter, Depends, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import oauth2_scheme, get_current_active_user
from app.schemas.user import (
    UserCreate,
    UserResponse,
    Token,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)
from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new user account with hashed password and unique email check."
)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """
    Handle user registration requests.
    """
    user = await AuthService.register_user(db=db, user_in=user_in)
    return user


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Login user",
    description="Authenticate user credentials using OAuth2 form parameters and return JWT token pair."
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Token:
    """
    Handle user login request and issue JWT access & refresh tokens.
    Note: form_data.username represents the email input field here.
    """
    token = await AuthService.authenticate_user(
        db=db,
        email=form_data.username,
        password=form_data.password
    )
    return token


@router.post(
    "/refresh",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Generate a new access and refresh token pair using an unexpired refresh token."
)
async def refresh(
    refresh_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
) -> Token:
    """
    Exchange refresh token for rotated token pair.
    """
    tokens = await AuthService.refresh_access_token(db=db, refresh_token=refresh_token)
    return tokens


@router.delete(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout user",
    description="Close session and blacklist access token on backend."
)
async def logout(
    token: str = Depends(oauth2_scheme)
) -> None:
    """
    Logout route handler.
    Client-side discards credentials; backend handles hook for server-side termination.
    """
    await AuthService.logout_user(token=token)
    return


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user details",
    description="Retrieve account profile, subscription tier, and active details for the current logged-in user."
)
async def get_me(
    current_user: User = Depends(get_current_active_user)
) -> UserResponse:
    """
    Get current logged in user details.
    """
    return current_user


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Request password reset",
    description="Generate a password reset token for the given email address."
)
async def forgot_password(
    request_in: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
) -> ForgotPasswordResponse:
    """
    Generate recovery token for forgotten password.
    """
    token = await AuthService.forgot_password(db=db, email=request_in.email)
    return ForgotPasswordResponse(
        message="Recovery token generated successfully. For local testing, copy the token below.",
        token=token
    )


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset password",
    description="Reset user password using a valid reset token."
)
async def reset_password(
    request_in: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
) -> ResetPasswordResponse:
    """
    Reset password using a token.
    """
    await AuthService.reset_password(
        db=db,
        token=request_in.token,
        new_password=request_in.new_password
    )
    return ResetPasswordResponse(message="Password reset successfully. You can now log in.")

