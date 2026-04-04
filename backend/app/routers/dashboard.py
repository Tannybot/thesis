"""Dashboard router — statistics and analytics endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.dashboard_service import get_dashboard_stats, get_health_overview, get_recent_activity
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard statistics overview."""
    return get_dashboard_stats(db, current_user)


@router.get("/health-overview")
def health_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get health analytics data for charts."""
    return get_health_overview(db, current_user)


@router.get("/recent-activity")
def recent_activity(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent system activity feed."""
    return get_recent_activity(db, current_user, limit)
