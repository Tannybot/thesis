"""Animals router — CRUD operations for livestock."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.animal import Animal
from app.models.user import User
from app.schemas.animal import (
    AnimalCreate, AnimalBatchCreate, AnimalUpdate,
    AnimalResponse, AnimalDetailResponse, AnimalListResponse,
)
from app.services.animal_service import create_animal, update_animal, get_animals
from app.middleware.auth import get_current_user, require_user_or_admin

router = APIRouter(prefix="/api/animals", tags=["Animals"])


@router.post("/", response_model=AnimalResponse, status_code=201)
def register_animal(
    data: AnimalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_or_admin),
):
    """Register a new animal with automatic UID and QR code generation."""
    animal = create_animal(db, data, current_user.id)
    return AnimalResponse(
        id=animal.id, animal_uid=animal.animal_uid, name=animal.name,
        species=animal.species, breed=animal.breed,
        date_of_birth=animal.date_of_birth, gender=animal.gender,
        weight=animal.weight, growth_stage=animal.growth_stage,
        status=animal.status, owner_id=animal.owner_id,
        owner_name=animal.owner.full_name,
        registered_by=animal.registered_by,
        qr_code_path=animal.qr_code_path,
        created_at=animal.created_at, updated_at=animal.updated_at,
    )


@router.post("/batch", response_model=list[AnimalResponse], status_code=201)
def batch_register(
    data: AnimalBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_or_admin),
):
    """Register multiple animals at once."""
    results = []
    for animal_data in data.animals:
        animal = create_animal(db, animal_data, current_user.id)
        results.append(AnimalResponse(
            id=animal.id, animal_uid=animal.animal_uid, name=animal.name,
            species=animal.species, breed=animal.breed,
            date_of_birth=animal.date_of_birth, gender=animal.gender,
            weight=animal.weight, growth_stage=animal.growth_stage,
            status=animal.status, owner_id=animal.owner_id,
            owner_name=animal.owner.full_name,
            registered_by=animal.registered_by,
            qr_code_path=animal.qr_code_path,
            created_at=animal.created_at, updated_at=animal.updated_at,
        ))
    return results


@router.get("/", response_model=AnimalListResponse)
def list_animals(
    page: int = 1,
    per_page: int = 20,
    species: str | None = None,
    status: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List animals with pagination, filtering, and search."""
    animals, total = get_animals(db, current_user, page, per_page, species, status, search)
    return AnimalListResponse(
        animals=[
            AnimalResponse(
                id=a.id, animal_uid=a.animal_uid, name=a.name,
                species=a.species, breed=a.breed,
                date_of_birth=a.date_of_birth, gender=a.gender,
                weight=a.weight, growth_stage=a.growth_stage,
                status=a.status, owner_id=a.owner_id,
                owner_name=a.owner.full_name,
                registered_by=a.registered_by,
                qr_code_path=a.qr_code_path,
                created_at=a.created_at, updated_at=a.updated_at,
            ) for a in animals
        ],
        total=total, page=page, per_page=per_page,
    )


@router.get("/{animal_id}", response_model=AnimalDetailResponse)
def get_animal(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed animal profile."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    if current_user.role.name != "admin" and animal.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return AnimalDetailResponse(
        id=animal.id, animal_uid=animal.animal_uid, name=animal.name,
        species=animal.species, breed=animal.breed,
        date_of_birth=animal.date_of_birth, gender=animal.gender,
        weight=animal.weight, growth_stage=animal.growth_stage,
        status=animal.status, owner_id=animal.owner_id,
        owner_name=animal.owner.full_name,
        registered_by=animal.registered_by,
        qr_code_path=animal.qr_code_path,
        created_at=animal.created_at, updated_at=animal.updated_at,
        health_records_count=len(animal.health_records),
        treatments_count=len(animal.treatments),
        vaccinations_count=len(animal.vaccinations),
        movements_count=len(animal.movements),
    )


@router.get("/uid/{animal_uid}", response_model=AnimalDetailResponse)
def get_animal_by_uid(
    animal_uid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get animal by UID (used after QR scan)."""
    animal = db.query(Animal).filter(Animal.animal_uid == animal_uid).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    return AnimalDetailResponse(
        id=animal.id, animal_uid=animal.animal_uid, name=animal.name,
        species=animal.species, breed=animal.breed,
        date_of_birth=animal.date_of_birth, gender=animal.gender,
        weight=animal.weight, growth_stage=animal.growth_stage,
        status=animal.status, owner_id=animal.owner_id,
        owner_name=animal.owner.full_name,
        registered_by=animal.registered_by,
        qr_code_path=animal.qr_code_path,
        created_at=animal.created_at, updated_at=animal.updated_at,
        health_records_count=len(animal.health_records),
        treatments_count=len(animal.treatments),
        vaccinations_count=len(animal.vaccinations),
        movements_count=len(animal.movements),
    )


@router.put("/{animal_id}", response_model=AnimalResponse)
def update_animal_endpoint(
    animal_id: int,
    data: AnimalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an animal record."""
    animal = update_animal(db, animal_id, data, current_user)
    return AnimalResponse(
        id=animal.id, animal_uid=animal.animal_uid, name=animal.name,
        species=animal.species, breed=animal.breed,
        date_of_birth=animal.date_of_birth, gender=animal.gender,
        weight=animal.weight, growth_stage=animal.growth_stage,
        status=animal.status, owner_id=animal.owner_id,
        owner_name=animal.owner.full_name,
        registered_by=animal.registered_by,
        qr_code_path=animal.qr_code_path,
        created_at=animal.created_at, updated_at=animal.updated_at,
    )


@router.delete("/{animal_id}")
def delete_animal(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft-delete an animal (set status to 'removed')."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    if current_user.role.name != "admin" and animal.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    animal.status = "removed"
    db.commit()
    return {"message": "Animal removed successfully"}
