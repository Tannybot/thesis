"""
Animal service — business logic for animal registration, UID generation, etc.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.animal import Animal
from app.models.qr_code import QRCode
from app.schemas.animal import AnimalCreate, AnimalUpdate
from app.services.qr_service import generate_qr_code


def generate_animal_uid(species: str) -> str:
    """Generate a unique animal ID like LV-CATTLE-2026-A1B2C3."""
    year = datetime.now(timezone.utc).year
    short_id = uuid.uuid4().hex[:6].upper()
    species_code = species.upper()[:5]
    return f"LV-{species_code}-{year}-{short_id}"


def create_animal(db: Session, data: AnimalCreate, current_user_id: int) -> Animal:
    """Register a new animal with auto-generated UID and QR code."""
    animal_uid = generate_animal_uid(data.species)

    # Ensure UID uniqueness (extremely unlikely collision)
    while db.query(Animal).filter(Animal.animal_uid == animal_uid).first():
        animal_uid = generate_animal_uid(data.species)

    owner_id = data.owner_id or current_user_id

    animal = Animal(
        animal_uid=animal_uid,
        name=data.name,
        species=data.species,
        breed=data.breed,
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        weight=data.weight,
        growth_stage=data.growth_stage,
        status="active",
        owner_id=owner_id,
        registered_by=current_user_id,
        notes=data.notes,
    )
    db.add(animal)
    db.flush()  # Get the animal.id before committing

    # Generate QR code
    qr_data, qr_path = generate_qr_code(animal_uid)
    animal.qr_code_path = qr_path

    qr_record = QRCode(
        animal_id=animal.id,
        qr_data=qr_data,
        qr_image_path=qr_path,
    )
    db.add(qr_record)
    db.commit()
    db.refresh(animal)

    return animal


def update_animal(db: Session, animal_id: int, data: AnimalUpdate, current_user: object) -> Animal:
    """Update an existing animal record."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")

    # Only owner or admin can update
    if current_user.role.name != "admin" and animal.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(animal, field, value)

    db.commit()
    db.refresh(animal)
    return animal


def get_animals(
    db: Session,
    current_user: object,
    page: int = 1,
    per_page: int = 20,
    species: str | None = None,
    status_filter: str | None = None,
    search: str | None = None,
) -> tuple[list[Animal], int]:
    """Get paginated, filterable list of animals."""
    query = db.query(Animal)

    # Non-admin users only see their own animals
    if current_user.role.name != "admin":
        query = query.filter(Animal.owner_id == current_user.id)

    if species:
        query = query.filter(Animal.species == species)
    if status_filter:
        query = query.filter(Animal.status == status_filter)
    if search:
        query = query.filter(
            (Animal.animal_uid.ilike(f"%{search}%")) |
            (Animal.name.ilike(f"%{search}%")) |
            (Animal.breed.ilike(f"%{search}%"))
        )

    total = query.count()
    animals = query.order_by(Animal.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return animals, total
