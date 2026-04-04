"""Treatment schemas."""
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class TreatmentCreate(BaseModel):
    animal_id: int
    health_record_id: Optional[int] = None
    treatment_type: str = Field(..., description="medication, surgery, therapy, other")
    medication: Optional[str] = None
    dosage: Optional[str] = None
    treatment_date: date
    next_treatment_date: Optional[date] = None
    administered_by: Optional[str] = None
    notes: Optional[str] = None


class TreatmentUpdate(BaseModel):
    medication: Optional[str] = None
    dosage: Optional[str] = None
    next_treatment_date: Optional[date] = None
    notes: Optional[str] = None


class TreatmentResponse(BaseModel):
    id: int
    animal_id: int
    animal_uid: str = ""
    health_record_id: Optional[int]
    treatment_type: str
    medication: Optional[str]
    dosage: Optional[str]
    treatment_date: date
    next_treatment_date: Optional[date]
    administered_by: Optional[str]
    recorded_by: int
    recorder_name: str = ""
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
