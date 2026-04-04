"""Vaccination schemas."""
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class VaccinationCreate(BaseModel):
    animal_id: int
    vaccine_name: str
    batch_number: Optional[str] = None
    vaccination_date: date
    next_due_date: Optional[date] = None
    administered_by: Optional[str] = None
    notes: Optional[str] = None


class VaccinationUpdate(BaseModel):
    next_due_date: Optional[date] = None
    notes: Optional[str] = None


class VaccinationResponse(BaseModel):
    id: int
    animal_id: int
    animal_uid: str = ""
    vaccine_name: str
    batch_number: Optional[str]
    vaccination_date: date
    next_due_date: Optional[date]
    administered_by: Optional[str]
    recorded_by: int
    recorder_name: str = ""
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
