"""Movement / Supply Chain schemas."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class MovementCreate(BaseModel):
    animal_id: int
    movement_type: str = Field(..., description="transfer, transport, sale, slaughter")
    from_location: str
    to_location: str
    departure_date: datetime
    arrival_date: Optional[datetime] = None
    handler: Optional[str] = None
    transport_method: Optional[str] = None
    purpose: Optional[str] = None
    buyer_info: Optional[str] = None
    notes: Optional[str] = None


class MovementUpdate(BaseModel):
    arrival_date: Optional[datetime] = None
    handler: Optional[str] = None
    notes: Optional[str] = None


class MovementResponse(BaseModel):
    id: int
    animal_id: int
    animal_uid: str = ""
    movement_type: str
    from_location: str
    to_location: str
    departure_date: datetime
    arrival_date: Optional[datetime]
    handler: Optional[str]
    transport_method: Optional[str]
    purpose: Optional[str]
    buyer_info: Optional[str]
    recorded_by: int
    recorder_name: str = ""
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TimelineEvent(BaseModel):
    """Unified timeline event for traceability view."""
    event_type: str  # registration, health, treatment, vaccination, movement
    title: str
    description: str
    date: datetime
    details: dict = {}
