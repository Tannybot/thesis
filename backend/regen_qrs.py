import os
import shutil
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.database import SessionLocal
from app.models.animal import Animal
from app.models.qr_code import QRCode
from app.services.qr_service import generate_qr_code, QR_CODE_DIR

def regenerate_qrs():
    print("Clearing old QR codes...")
    if os.path.exists(QR_CODE_DIR):
        shutil.rmtree(QR_CODE_DIR)
    os.makedirs(QR_CODE_DIR, exist_ok=True)

    print("Fetching animals...")
    db: Session = SessionLocal()
    try:
        animals = (
            db.query(Animal)
            .options(
                joinedload(Animal.owner),
                joinedload(Animal.health_records),
                joinedload(Animal.movements),
            )
            .all()
        )
        for animal in animals:
            qr_data, qr_path = generate_qr_code(animal.animal_uid, animal)
            animal.qr_code_path = qr_path
            qr = db.query(QRCode).filter(QRCode.animal_id == animal.id).first()
            if qr:
                qr.qr_data = qr_data
                qr.qr_image_path = qr_path
            else:
                db.add(QRCode(animal_id=animal.id, qr_data=qr_data, qr_image_path=qr_path))
            print(f"Regenerated QR for {animal.animal_uid} -> {qr_data}")
        db.commit()
        print(f"Successfully generated {len(animals)} QR codes.")
    finally:
        db.close()

if __name__ == "__main__":
    regenerate_qrs()
