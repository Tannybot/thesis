"""Health Records router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.health_record import HealthRecord
from app.models.animal import Animal
from app.models.user import User
from app.schemas.health_record import HealthRecordCreate, HealthRecordUpdate, HealthRecordResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/health-records", tags=["Health Records"])


@router.post("/", response_model=HealthRecordResponse, status_code=201)
def create_health_record(
    data: HealthRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new health record for an animal."""
    animal = db.query(Animal).filter(Animal.id == data.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    record = HealthRecord(
        animal_id=data.animal_id,
        record_type=data.record_type,
        description=data.description,
        severity=data.severity,
        diagnosis=data.diagnosis,
        record_date=data.record_date,
        recorded_by=current_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return HealthRecordResponse(
        id=record.id, animal_id=record.animal_id,
        animal_uid=animal.animal_uid,
        record_type=record.record_type,
        description=record.description,
        severity=record.severity, diagnosis=record.diagnosis,
        record_date=record.record_date,
        recorded_by=record.recorded_by,
        recorder_name=current_user.full_name,
        created_at=record.created_at,
    )


@router.get("/animal/{animal_id}", response_model=list[HealthRecordResponse])
def get_animal_health_records(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all health records for an animal."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    records = (
        db.query(HealthRecord)
        .filter(HealthRecord.animal_id == animal_id)
        .order_by(HealthRecord.record_date.desc())
        .all()
    )
    return [
        HealthRecordResponse(
            id=r.id, animal_id=r.animal_id,
            animal_uid=animal.animal_uid,
            record_type=r.record_type, description=r.description,
            severity=r.severity, diagnosis=r.diagnosis,
            record_date=r.record_date, recorded_by=r.recorded_by,
            recorder_name=r.recorder.full_name if r.recorder else "",
            created_at=r.created_at,
        ) for r in records
    ]


@router.put("/{record_id}", response_model=HealthRecordResponse)
def update_health_record(
    record_id: int,
    data: HealthRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a health record."""
    record = db.query(HealthRecord).filter(HealthRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Health record not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)

    return HealthRecordResponse(
        id=record.id, animal_id=record.animal_id,
        animal_uid=record.animal.animal_uid,
        record_type=record.record_type, description=record.description,
        severity=record.severity, diagnosis=record.diagnosis,
        record_date=record.record_date, recorded_by=record.recorded_by,
        recorder_name=record.recorder.full_name if record.recorder else "",
        created_at=record.created_at,
    )
