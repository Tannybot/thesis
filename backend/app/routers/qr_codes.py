"""QR Codes router — serve and regenerate QR code images."""
import re
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.animal import Animal
from app.models.qr_code import QRCode
from app.models.user import User
from app.services.qr_service import generate_qr_code, resolve_qr_code_path
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/qr-codes", tags=["QR Codes"])
trace_router = APIRouter(prefix="/api/trace", tags=["Public Traceability"])

QR_TOKEN_PATTERN = re.compile(r"^LV-[A-Z0-9]{1,10}-\d{4}-[A-Z0-9]{3,12}$")


def _not_found():
    raise HTTPException(status_code=404, detail="Animal record not found")


def _serialize_date(value):
    return value.isoformat() if value else None


def _ensure_animal_access(animal: Animal, current_user: User):
    if current_user.role.name != "admin" and animal.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")


def _public_trace_response(animal: Animal) -> dict:
    return {
        "animal": {
            "animal_uid": animal.animal_uid,
            "name": animal.name,
            "species": animal.species,
            "breed": animal.breed,
            "gender": animal.gender,
            "weight": animal.weight,
            "growth_stage": animal.growth_stage,
            "status": animal.status,
            "owner_name": animal.owner.full_name if animal.owner else "",
            "date_of_birth": _serialize_date(animal.date_of_birth),
            "created_at": _serialize_date(animal.created_at),
        },
        "health_records": [
            {
                "record_type": record.record_type,
                "description": record.description,
                "severity": record.severity,
                "diagnosis": record.diagnosis,
                "record_date": _serialize_date(record.record_date),
            }
            for record in sorted(animal.health_records, key=lambda item: item.record_date or date.min, reverse=True)
        ],
        "movements": [
            {
                "movement_type": movement.movement_type,
                "from_location": movement.from_location,
                "to_location": movement.to_location,
                "departure_date": _serialize_date(movement.departure_date),
                "arrival_date": _serialize_date(movement.arrival_date),
                "handler": movement.handler,
                "transport_method": movement.transport_method,
                "purpose": movement.purpose,
            }
            for movement in sorted(animal.movements, key=lambda item: item.departure_date or date.min, reverse=True)
        ],
    }


@router.get("/{animal_id}")
def get_qr_code(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the QR code image for an animal."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    _ensure_animal_access(animal, current_user)

    qr = db.query(QRCode).filter(QRCode.animal_id == animal_id).first()
    if not qr:
        qr_data, qr_path = generate_qr_code(animal.animal_uid)
        animal.qr_code_path = qr_path
        qr = QRCode(
            animal_id=animal.id,
            qr_data=qr_data,
            qr_image_path=qr_path,
        )
        db.add(qr)
        db.commit()
        db.refresh(qr)

    qr_path = resolve_qr_code_path(animal.animal_uid, qr.qr_image_path)
    if not qr_path:
        qr_data, qr_path = generate_qr_code(animal.animal_uid)
        qr.qr_data = qr_data

    if qr.qr_image_path != qr_path or animal.qr_code_path != qr_path:
        qr.qr_image_path = qr_path
        animal.qr_code_path = qr_path
        db.commit()

    return FileResponse(
        qr_path,
        media_type="image/png",
        filename=f"qr_{animal.animal_uid}.png",
    )


@router.post("/regenerate/{animal_id}")
def regenerate_qr_code(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Regenerate the QR code for an animal."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    _ensure_animal_access(animal, current_user)

    # Delete old QR record
    old_qr = db.query(QRCode).filter(QRCode.animal_id == animal_id).first()
    if old_qr:
        db.delete(old_qr)

    # Generate new QR
    qr_data, qr_path = generate_qr_code(animal.animal_uid)
    animal.qr_code_path = qr_path

    new_qr = QRCode(
        animal_id=animal.id,
        qr_data=qr_data,
        qr_image_path=qr_path,
    )
    db.add(new_qr)
    db.commit()

    return {"message": "QR code regenerated", "qr_data": qr_data}


@trace_router.get("/{qr_token}")
def public_trace_animal(qr_token: str, db: Session = Depends(get_db)):
    """Resolve a QR token to animal traceability details."""
    token = qr_token.strip().upper()
    if not QR_TOKEN_PATTERN.match(token):
        _not_found()

    animal = (
        db.query(Animal)
        .options(
            joinedload(Animal.owner),
            joinedload(Animal.qr_code),
            joinedload(Animal.health_records),
            joinedload(Animal.movements),
        )
        .filter(Animal.animal_uid == token)
        .first()
    )
    if not animal:
        _not_found()

    if animal.qr_code and not animal.qr_code.is_active:
        _not_found()

    return _public_trace_response(animal)
