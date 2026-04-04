"""Animal schemas — registration, updates, and responses."""
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class AnimalBase(BaseModel):
    name: Optional[str] = None
    species: str = Field(..., description="cattle, goat, sheep, pig, poultry")
    breed: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: str = Field(..., pattern="^(male|female)$")
    weight: Optional[float] = Field(None, ge=0)
    growth_stage: Optional[str] = Field(None, description="weaner, grower, finisher, breeder")
    notes: Optional[str] = None


class AnimalCreate(AnimalBase):
    owner_id: Optional[int] = None  # If not provided, uses current user


class AnimalBatchCreate(BaseModel):
    animals: list[AnimalCreate]


class AnimalUpdate(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    weight: Optional[float] = None
    growth_stage: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class AnimalResponse(AnimalBase):
    id: int
    animal_uid: str
    status: str
    owner_id: int
    owner_name: str = ""
    registered_by: int
    qr_code_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnimalDetailResponse(AnimalResponse):
    """Extended response with related records counts."""
    health_records_count: int = 0
    treatments_count: int = 0
    vaccinations_count: int = 0
    movements_count: int = 0


class AnimalListResponse(BaseModel):
    animals: list[AnimalResponse]
    total: int
    page: int
    per_page: int
