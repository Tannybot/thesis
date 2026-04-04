"""Health Record schemas."""
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class HealthRecordCreate(BaseModel):
    animal_id: int
    record_type: str = Field(..., description="checkup, disease, mortality, observation")
    description: str
    severity: Optional[str] = Field(None, description="low, medium, high, critical")
    diagnosis: Optional[str] = None
    record_date: date


class HealthRecordUpdate(BaseModel):
    description: Optional[str] = None
    severity: Optional[str] = None
    diagnosis: Optional[str] = None


class HealthRecordResponse(BaseModel):
    id: int
    animal_id: int
    animal_uid: str = ""
    record_type: str
    description: str
    severity: Optional[str]
    diagnosis: Optional[str]
    record_date: date
    recorded_by: int
    recorder_name: str = ""
    created_at: datetime

    class Config:
        from_attributes = True
