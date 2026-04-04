"""
Dashboard service — aggregates statistics and analytics data.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.animal import Animal
from app.models.health_record import HealthRecord
from app.models.treatment import Treatment
from app.models.vaccination import Vaccination
from app.models.movement import Movement
from app.models.user import User


def get_dashboard_stats(db: Session, current_user: object) -> dict:
    """Get overview statistics for the dashboard."""
    is_admin = current_user.role.name == "admin"

    # Base queries — admin sees all, user sees own
    animal_query = db.query(Animal)
    if not is_admin:
        animal_query = animal_query.filter(Animal.owner_id == current_user.id)

    total_animals = animal_query.count()
    active_animals = animal_query.filter(Animal.status == "active").count()
    deceased_animals = animal_query.filter(Animal.status == "deceased").count()
    sold_animals = animal_query.filter(Animal.status == "sold").count()

    # Species breakdown
    species_data = (
        animal_query
        .with_entities(Animal.species, func.count(Animal.id))
        .group_by(Animal.species)
        .all()
    )

    # Growth stage breakdown
    stage_data = (
        animal_query
        .filter(Animal.status == "active")
        .with_entities(Animal.growth_stage, func.count(Animal.id))
        .group_by(Animal.growth_stage)
        .all()
    )

    # Recent registrations (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_registrations = (
        animal_query
        .filter(Animal.created_at >= thirty_days_ago)
        .count()
    )

    # Health alerts (high/critical severity in last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    animal_ids = [a.id for a in animal_query.all()]
    health_alerts = (
        db.query(HealthRecord)
        .filter(
            HealthRecord.animal_id.in_(animal_ids) if animal_ids else False,
            HealthRecord.severity.in_(["high", "critical"]),
            HealthRecord.created_at >= seven_days_ago,
        )
        .count()
    ) if animal_ids else 0

    # Upcoming vaccinations
    upcoming_vaccinations = (
        db.query(Vaccination)
        .filter(
            Vaccination.animal_id.in_(animal_ids) if animal_ids else False,
            Vaccination.next_due_date != None,
            Vaccination.next_due_date <= (datetime.now(timezone.utc) + timedelta(days=14)).date(),
        )
        .count()
    ) if animal_ids else 0

    stats = {
        "total_animals": total_animals,
        "active_animals": active_animals,
        "deceased_animals": deceased_animals,
        "sold_animals": sold_animals,
        "recent_registrations": recent_registrations,
        "health_alerts": health_alerts,
        "upcoming_vaccinations": upcoming_vaccinations,
        "species_breakdown": [{"species": s, "count": c} for s, c in species_data],
        "growth_stage_breakdown": [{"stage": s or "unset", "count": c} for s, c in stage_data],
    }

    if is_admin:
        stats["total_users"] = db.query(User).count()

    return stats


def get_health_overview(db: Session, current_user: object) -> dict:
    """Get health analytics overview."""
    is_admin = current_user.role.name == "admin"

    animal_query = db.query(Animal)
    if not is_admin:
        animal_query = animal_query.filter(Animal.owner_id == current_user.id)

    animal_ids = [a.id for a in animal_query.all()]

    if not animal_ids:
        return {"monthly_records": [], "severity_breakdown": [], "type_breakdown": []}

    # Monthly health records (last 6 months)
    six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)
    monthly = (
        db.query(
            func.strftime("%Y-%m", HealthRecord.record_date).label("month"),
            func.count(HealthRecord.id)
        )
        .filter(
            HealthRecord.animal_id.in_(animal_ids),
            HealthRecord.created_at >= six_months_ago,
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    # Severity breakdown
    severity = (
        db.query(HealthRecord.severity, func.count(HealthRecord.id))
        .filter(HealthRecord.animal_id.in_(animal_ids))
        .group_by(HealthRecord.severity)
        .all()
    )

    # Type breakdown
    types = (
        db.query(HealthRecord.record_type, func.count(HealthRecord.id))
        .filter(HealthRecord.animal_id.in_(animal_ids))
        .group_by(HealthRecord.record_type)
        .all()
    )

    return {
        "monthly_records": [{"month": m, "count": c} for m, c in monthly],
        "severity_breakdown": [{"severity": s or "none", "count": c} for s, c in severity],
        "type_breakdown": [{"type": t, "count": c} for t, c in types],
    }


def get_recent_activity(db: Session, current_user: object, limit: int = 20) -> list:
    """Get recent system activity across all modules."""
    is_admin = current_user.role.name == "admin"

    animal_query = db.query(Animal)
    if not is_admin:
        animal_query = animal_query.filter(Animal.owner_id == current_user.id)
    animal_ids = [a.id for a in animal_query.all()]

    activities = []

    if not animal_ids:
        return activities

    # Recent animals
    recent_animals = (
        db.query(Animal)
        .filter(Animal.id.in_(animal_ids))
        .order_by(Animal.created_at.desc())
        .limit(5)
        .all()
    )
    for a in recent_animals:
        activities.append({
            "type": "registration",
            "title": f"New animal registered: {a.animal_uid}",
            "description": f"{a.species} - {a.breed or 'N/A'}",
            "date": a.created_at.isoformat(),
            "animal_uid": a.animal_uid,
        })

    # Recent health records
    recent_health = (
        db.query(HealthRecord)
        .filter(HealthRecord.animal_id.in_(animal_ids))
        .order_by(HealthRecord.created_at.desc())
        .limit(5)
        .all()
    )
    for h in recent_health:
        activities.append({
            "type": "health",
            "title": f"Health record: {h.record_type}",
            "description": h.description[:100],
            "date": h.created_at.isoformat(),
            "severity": h.severity,
        })

    # Recent movements
    recent_movements = (
        db.query(Movement)
        .filter(Movement.animal_id.in_(animal_ids))
        .order_by(Movement.created_at.desc())
        .limit(5)
        .all()
    )
    for m in recent_movements:
        activities.append({
            "type": "movement",
            "title": f"Movement: {m.movement_type}",
            "description": f"{m.from_location} → {m.to_location}",
            "date": m.created_at.isoformat(),
        })

    # Sort by date descending and limit
    activities.sort(key=lambda x: x["date"], reverse=True)
    return activities[:limit]
