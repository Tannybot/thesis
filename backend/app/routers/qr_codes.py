"""QR Codes router — serve and regenerate QR code images."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.animal import Animal
from app.models.qr_code import QRCode
from app.models.user import User
from app.services.qr_service import generate_qr_code
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/qr-codes", tags=["QR Codes"])


@router.get("/{animal_id}")
def get_qr_code(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the QR code image for an animal."""
    qr = db.query(QRCode).filter(QRCode.animal_id == animal_id).first()
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")

    return FileResponse(
        qr.qr_image_path,
        media_type="image/png",
        filename=f"qr_{qr.animal.animal_uid}.png",
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
