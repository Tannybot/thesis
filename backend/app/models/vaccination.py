"""Vaccination model — tracks vaccination history per animal."""
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(Integer, ForeignKey("animals.id"), nullable=False)
    vaccine_name = Column(String(255), nullable=False)
    batch_number = Column(String(100), nullable=True)
    vaccination_date = Column(Date, nullable=False)
    next_due_date = Column(Date, nullable=True)
    administered_by = Column(String(255), nullable=True)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    animal = relationship("Animal", back_populates="vaccinations")
    recorder = relationship("User")

    def __repr__(self):
        return f"<Vaccination(id={self.id}, vaccine='{self.vaccine_name}')>"
