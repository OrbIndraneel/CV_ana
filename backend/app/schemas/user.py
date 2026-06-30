"""
user.py
Pydantic v2 schemas for User request/response validation and serialization.
"""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    email: EmailStr = Field(..., description="User's unique email address")
    full_name: Optional[str] = Field(None, max_length=255, description="User's full name")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128, description="User's plain text password")


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)


class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    subscription_tier: str
    subscription_status: str

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str  # Subject (usually stores user ID as a string)
    exp: Optional[int] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="The user's registered email address")


class ForgotPasswordResponse(BaseModel):
    message: str
    token: str


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="The password reset token received")
    new_password: str = Field(..., min_length=8, max_length=128, description="The new password")


class ResetPasswordResponse(BaseModel):
    message: str

