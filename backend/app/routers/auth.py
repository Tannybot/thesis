"""Auth router - login, register, and current user endpoints."""
import os
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, RegisterResponse, TokenResponse
from app.schemas.user import CurrentUserUpdate, NotificationPreferences, SupportRequest, UserResponse
from app.services.auth_service import authenticate_user, register_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

PROFILE_IMAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "profile_images"))
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024


def user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role_id=user.role_id,
        role_name=user.role.name,
        is_active=user.is_active,
        profile_image_path=user.profile_image_path,
        notify_email_alerts=user.notify_email_alerts,
        notify_system_alerts=user.notify_system_alerts,
        notify_activity_updates=user.notify_activity_updates,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    user = register_user(db, data)
    return {
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.name,
        },
    }


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and receive JWT tokens."""
    return authenticate_user(db, data)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return user_response(current_user)


@router.put("/me", response_model=UserResponse)
def update_me(
    data: CurrentUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the currently authenticated user's basic account details."""
    if data.email and data.email != current_user.email:
        existing = db.query(User).filter(User.email == data.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already in use")
        current_user.email = data.email

    if data.full_name is not None:
        current_user.full_name = data.full_name.strip()

    db.commit()
    db.refresh(current_user)
    return user_response(current_user)


@router.post("/me/photo", response_model=UserResponse)
async def upload_profile_photo(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload and save the current user's profile photo."""
    extension = ALLOWED_IMAGE_TYPES.get(photo.content_type or "")
    if not extension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG, and WEBP images are allowed",
        )

    contents = await photo.read()
    if len(contents) > MAX_PROFILE_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile photo must be 2MB or smaller",
        )

    os.makedirs(PROFILE_IMAGE_DIR, exist_ok=True)
    filename = f"user_{current_user.id}_{uuid4().hex}{extension}"
    file_path = os.path.join(PROFILE_IMAGE_DIR, filename)
    with open(file_path, "wb") as file:
        file.write(contents)

    current_user.profile_image_path = f"/static/profile/{filename}"
    db.commit()
    db.refresh(current_user)
    return user_response(current_user)


@router.put("/me/preferences", response_model=UserResponse)
def update_preferences(
    data: NotificationPreferences,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's notification preferences."""
    current_user.notify_email_alerts = data.email_alerts
    current_user.notify_system_alerts = data.system_alerts
    current_user.notify_activity_updates = data.activity_updates
    db.commit()
    db.refresh(current_user)
    return user_response(current_user)


@router.post("/me/support")
def submit_support_request(
    data: SupportRequest,
    current_user: User = Depends(get_current_user),
):
    """Accept a support request from the current user."""
    return {
        "message": "Support request submitted successfully",
        "submitted_by": current_user.email,
        "issue": data.issue,
    }
