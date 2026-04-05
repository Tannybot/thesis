import os
import shutil
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.animal import Animal
from app.services.qr_service import generate_qr_code, QR_CODE_DIR

def regenerate_qrs():
    print("Clearing old QR codes...")
    if os.path.exists(QR_CODE_DIR):
        shutil.rmtree(QR_CODE_DIR)
    os.makedirs(QR_CODE_DIR, exist_ok=True)

    print("Fetching animals...")
    db: Session = SessionLocal()
    try:
        animals = db.query(Animal).all()
        for animal in animals:
            qr_data, _ = generate_qr_code(animal.animal_uid)
            print(f"Regenerated QR for {animal.animal_uid} -> {qr_data}")
        print(f"Successfully generated {len(animals)} QR codes.")
    finally:
        db.close()

if __name__ == "__main__":
    regenerate_qrs()
