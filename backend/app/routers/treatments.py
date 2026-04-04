"""Treatments router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.treatment import Treatment
from app.models.animal import Animal
from app.models.user import User
from app.schemas.treatment import TreatmentCreate, TreatmentUpdate, TreatmentResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/treatments", tags=["Treatments"])


@router.post("/", response_model=TreatmentResponse, status_code=201)
def create_treatment(
    data: TreatmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a new treatment for an animal."""
    animal = db.query(Animal).filter(Animal.id == data.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    treatment = Treatment(
        animal_id=data.animal_id,
        health_record_id=data.health_record_id,
        treatment_type=data.treatment_type,
        medication=data.medication,
        dosage=data.dosage,
        treatment_date=data.treatment_date,
        next_treatment_date=data.next_treatment_date,
        administered_by=data.administered_by,
        recorded_by=current_user.id,
        notes=data.notes,
    )
    db.add(treatment)
    db.commit()
    db.refresh(treatment)

    return TreatmentResponse(
        id=treatment.id, animal_id=treatment.animal_id,
        animal_uid=animal.animal_uid,
        health_record_id=treatment.health_record_id,
        treatment_type=treatment.treatment_type,
        medication=treatment.medication, dosage=treatment.dosage,
        treatment_date=treatment.treatment_date,
        next_treatment_date=treatment.next_treatment_date,
        administered_by=treatment.administered_by,
        recorded_by=treatment.recorded_by,
        recorder_name=current_user.full_name,
        notes=treatment.notes, created_at=treatment.created_at,
    )


@router.get("/animal/{animal_id}", response_model=list[TreatmentResponse])
def get_animal_treatments(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all treatments for an animal."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    treatments = (
        db.query(Treatment)
        .filter(Treatment.animal_id == animal_id)
        .order_by(Treatment.treatment_date.desc())
        .all()
    )
    return [
        TreatmentResponse(
            id=t.id, animal_id=t.animal_id,
            animal_uid=animal.animal_uid,
            health_record_id=t.health_record_id,
            treatment_type=t.treatment_type,
            medication=t.medication, dosage=t.dosage,
            treatment_date=t.treatment_date,
            next_treatment_date=t.next_treatment_date,
            administered_by=t.administered_by,
            recorded_by=t.recorded_by,
            recorder_name=t.recorder.full_name if t.recorder else "",
            notes=t.notes, created_at=t.created_at,
        ) for t in treatments
    ]


@router.put("/{treatment_id}", response_model=TreatmentResponse)
def update_treatment(
    treatment_id: int,
    data: TreatmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a treatment record."""
    treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(treatment, field, value)

    db.commit()
    db.refresh(treatment)

    return TreatmentResponse(
        id=treatment.id, animal_id=treatment.animal_id,
        animal_uid=treatment.animal.animal_uid,
        health_record_id=treatment.health_record_id,
        treatment_type=treatment.treatment_type,
        medication=treatment.medication, dosage=treatment.dosage,
        treatment_date=treatment.treatment_date,
        next_treatment_date=treatment.next_treatment_date,
        administered_by=treatment.administered_by,
        recorded_by=treatment.recorded_by,
        recorder_name=treatment.recorder.full_name if treatment.recorder else "",
        notes=treatment.notes, created_at=treatment.created_at,
    )
