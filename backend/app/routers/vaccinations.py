"""Vaccinations router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vaccination import Vaccination
from app.models.animal import Animal
from app.models.user import User
from app.schemas.vaccination import VaccinationCreate, VaccinationUpdate, VaccinationResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/vaccinations", tags=["Vaccinations"])


@router.post("/", response_model=VaccinationResponse, status_code=201)
def create_vaccination(
    data: VaccinationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a new vaccination for an animal."""
    animal = db.query(Animal).filter(Animal.id == data.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    vaccination = Vaccination(
        animal_id=data.animal_id,
        vaccine_name=data.vaccine_name,
        batch_number=data.batch_number,
        vaccination_date=data.vaccination_date,
        next_due_date=data.next_due_date,
        administered_by=data.administered_by,
        recorded_by=current_user.id,
        notes=data.notes,
    )
    db.add(vaccination)
    db.commit()
    db.refresh(vaccination)

    return VaccinationResponse(
        id=vaccination.id, animal_id=vaccination.animal_id,
        animal_uid=animal.animal_uid,
        vaccine_name=vaccination.vaccine_name,
        batch_number=vaccination.batch_number,
        vaccination_date=vaccination.vaccination_date,
        next_due_date=vaccination.next_due_date,
        administered_by=vaccination.administered_by,
        recorded_by=vaccination.recorded_by,
        recorder_name=current_user.full_name,
        notes=vaccination.notes, created_at=vaccination.created_at,
    )


@router.get("/animal/{animal_id}", response_model=list[VaccinationResponse])
def get_animal_vaccinations(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all vaccinations for an animal."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    vaccinations = (
        db.query(Vaccination)
        .filter(Vaccination.animal_id == animal_id)
        .order_by(Vaccination.vaccination_date.desc())
        .all()
    )
    return [
        VaccinationResponse(
            id=v.id, animal_id=v.animal_id,
            animal_uid=animal.animal_uid,
            vaccine_name=v.vaccine_name,
            batch_number=v.batch_number,
            vaccination_date=v.vaccination_date,
            next_due_date=v.next_due_date,
            administered_by=v.administered_by,
            recorded_by=v.recorded_by,
            recorder_name=v.recorder.full_name if v.recorder else "",
            notes=v.notes, created_at=v.created_at,
        ) for v in vaccinations
    ]


@router.put("/{vaccination_id}", response_model=VaccinationResponse)
def update_vaccination(
    vaccination_id: int,
    data: VaccinationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a vaccination record."""
    vaccination = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not vaccination:
        raise HTTPException(status_code=404, detail="Vaccination not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vaccination, field, value)

    db.commit()
    db.refresh(vaccination)

    return VaccinationResponse(
        id=vaccination.id, animal_id=vaccination.animal_id,
        animal_uid=vaccination.animal.animal_uid,
        vaccine_name=vaccination.vaccine_name,
        batch_number=vaccination.batch_number,
        vaccination_date=vaccination.vaccination_date,
        next_due_date=vaccination.next_due_date,
        administered_by=vaccination.administered_by,
        recorded_by=vaccination.recorded_by,
        recorder_name=vaccination.recorder.full_name if vaccination.recorder else "",
        notes=vaccination.notes, created_at=vaccination.created_at,
    )
