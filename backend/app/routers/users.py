"""Users router — admin-only user management."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserResponse, UserUpdate, UserListResponse
from app.middleware.auth import require_admin
from app.utils.security import hash_password

router = APIRouter(prefix="/api/users", tags=["User Management"])


@router.get("/", response_model=UserListResponse)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List all users (admin only)."""
    users = db.query(User).all()
    return UserListResponse(
        users=[
            UserResponse(
                id=u.id, email=u.email, full_name=u.full_name,
                role_id=u.role_id, role_name=u.role.name,
                is_active=u.is_active, created_at=u.created_at,
                updated_at=u.updated_at,
            ) for u in users
        ],
        total=len(users),
    )


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get a specific user by ID (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=user.id, email=user.email, full_name=user.full_name,
        role_id=user.role_id, role_name=user.role.name,
        is_active=user.is_active, created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a user (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = data.model_dump(exclude_unset=True)

    if "role" in update_data:
        role = db.query(Role).filter(Role.name == update_data.pop("role")).first()
        if role:
            user.role_id = role.id

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return UserResponse(
        id=user.id, email=user.email, full_name=user.full_name,
        role_id=user.role_id, role_name=user.role.name,
        is_active=user.is_active, created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.delete("/{user_id}")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Deactivate a user account (admin only). Soft delete."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    user.is_active = False
    db.commit()
    return {"message": "User deactivated successfully"}
