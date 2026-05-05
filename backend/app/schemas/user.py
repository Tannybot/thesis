"""User schemas — CRUD operations and responses."""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: str = "user"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None


class CurrentUserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None


class NotificationPreferences(BaseModel):
    email_alerts: bool
    system_alerts: bool
    activity_updates: bool


class SupportRequest(BaseModel):
    issue: str = Field(..., min_length=10, max_length=2000)


class UserResponse(UserBase):
    id: int
    role_id: int
    role_name: str = ""
    is_active: bool
    profile_image_path: Optional[str] = None
    notify_email_alerts: bool = True
    notify_system_alerts: bool = True
    notify_activity_updates: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
