"""Movements / Supply Chain router."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.movement import Movement
from app.models.animal import Animal
from app.models.health_record import HealthRecord
from app.models.treatment import Treatment
from app.models.vaccination import Vaccination
from app.models.user import User
from app.schemas.movement import MovementCreate, MovementUpdate, MovementResponse, TimelineEvent
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/movements", tags=["Supply Chain / Movements"])


@router.post("/", response_model=MovementResponse, status_code=201)
def create_movement(
    data: MovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a new movement/transport event for an animal."""
    animal = db.query(Animal).filter(Animal.id == data.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    movement = Movement(
        animal_id=data.animal_id,
        movement_type=data.movement_type,
        from_location=data.from_location,
        to_location=data.to_location,
        departure_date=data.departure_date,
        arrival_date=data.arrival_date,
        handler=data.handler,
        transport_method=data.transport_method,
        purpose=data.purpose,
        buyer_info=data.buyer_info,
        recorded_by=current_user.id,
        notes=data.notes,
    )
    db.add(movement)

    # Auto-update animal status for sale/slaughter movements
    if data.movement_type == "sale":
        animal.status = "sold"
    elif data.movement_type == "slaughter":
        animal.status = "deceased"

    db.commit()
    db.refresh(movement)

    return MovementResponse(
        id=movement.id, animal_id=movement.animal_id,
        animal_uid=animal.animal_uid,
        movement_type=movement.movement_type,
        from_location=movement.from_location,
        to_location=movement.to_location,
        departure_date=movement.departure_date,
        arrival_date=movement.arrival_date,
        handler=movement.handler,
        transport_method=movement.transport_method,
        purpose=movement.purpose, buyer_info=movement.buyer_info,
        recorded_by=movement.recorded_by,
        recorder_name=current_user.full_name,
        notes=movement.notes, created_at=movement.created_at,
    )


@router.get("/animal/{animal_id}", response_model=list[MovementResponse])
def get_animal_movements(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all movements for an animal."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    movements = (
        db.query(Movement)
        .filter(Movement.animal_id == animal_id)
        .order_by(Movement.departure_date.desc())
        .all()
    )
    return [
        MovementResponse(
            id=m.id, animal_id=m.animal_id,
            animal_uid=animal.animal_uid,
            movement_type=m.movement_type,
            from_location=m.from_location, to_location=m.to_location,
            departure_date=m.departure_date, arrival_date=m.arrival_date,
            handler=m.handler, transport_method=m.transport_method,
            purpose=m.purpose, buyer_info=m.buyer_info,
            recorded_by=m.recorded_by,
            recorder_name=m.recorder.full_name if m.recorder else "",
            notes=m.notes, created_at=m.created_at,
        ) for m in movements
    ]


@router.get("/timeline/{animal_id}", response_model=list[TimelineEvent])
def get_animal_timeline(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full traceability timeline for an animal — combines all record types."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    events = []

    # Registration event
    events.append(TimelineEvent(
        event_type="registration",
        title="Animal Registered",
        description=f"{animal.species} ({animal.breed or 'N/A'}) registered as {animal.animal_uid}",
        date=animal.created_at,
        details={"species": animal.species, "breed": animal.breed, "gender": animal.gender},
    ))

    # Health records
    for hr in animal.health_records:
        events.append(TimelineEvent(
            event_type="health",
            title=f"Health: {hr.record_type.title()}",
            description=hr.description,
            date=hr.created_at,
            details={"severity": hr.severity, "diagnosis": hr.diagnosis},
        ))

    # Treatments
    for t in animal.treatments:
        events.append(TimelineEvent(
            event_type="treatment",
            title=f"Treatment: {t.treatment_type.title()}",
            description=f"{t.medication or 'N/A'} — {t.dosage or 'N/A'}",
            date=t.created_at,
            details={"medication": t.medication, "dosage": t.dosage},
        ))

    # Vaccinations
    for v in animal.vaccinations:
        events.append(TimelineEvent(
            event_type="vaccination",
            title=f"Vaccination: {v.vaccine_name}",
            description=f"Batch: {v.batch_number or 'N/A'}",
            date=v.created_at,
            details={"vaccine": v.vaccine_name, "batch": v.batch_number},
        ))

    # Movements
    for m in animal.movements:
        events.append(TimelineEvent(
            event_type="movement",
            title=f"Movement: {m.movement_type.title()}",
            description=f"{m.from_location} → {m.to_location}",
            date=m.created_at,
            details={"handler": m.handler, "transport": m.transport_method},
        ))

    # Sort by date descending
    events.sort(key=lambda e: e.date, reverse=True)
    return events


@router.put("/{movement_id}", response_model=MovementResponse)
def update_movement(
    movement_id: int,
    data: MovementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a movement record (e.g., set arrival date)."""
    movement = db.query(Movement).filter(Movement.id == movement_id).first()
    if not movement:
        raise HTTPException(status_code=404, detail="Movement not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(movement, field, value)

    db.commit()
    db.refresh(movement)

    return MovementResponse(
        id=movement.id, animal_id=movement.animal_id,
        animal_uid=movement.animal.animal_uid,
        movement_type=movement.movement_type,
        from_location=movement.from_location,
        to_location=movement.to_location,
        departure_date=movement.departure_date,
        arrival_date=movement.arrival_date,
        handler=movement.handler,
        transport_method=movement.transport_method,
        purpose=movement.purpose, buyer_info=movement.buyer_info,
        recorded_by=movement.recorded_by,
        recorder_name=movement.recorder.full_name if movement.recorder else "",
        notes=movement.notes, created_at=movement.created_at,
    )
