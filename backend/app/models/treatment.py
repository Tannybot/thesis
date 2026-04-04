"""Treatment model — logs medical treatments administered to animals."""
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Treatment(Base):
    __tablename__ = "treatments"

    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(Integer, ForeignKey("animals.id"), nullable=False)
    health_record_id = Column(Integer, ForeignKey("health_records.id"), nullable=True)
    treatment_type = Column(String(50), nullable=False)  # medication, surgery, therapy, other
    medication = Column(String(255), nullable=True)
    dosage = Column(String(100), nullable=True)
    treatment_date = Column(Date, nullable=False)
    next_treatment_date = Column(Date, nullable=True)
    administered_by = Column(String(255), nullable=True)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    animal = relationship("Animal", back_populates="treatments")
    health_record = relationship("HealthRecord", back_populates="treatments")
    recorder = relationship("User")

    def __repr__(self):
        return f"<Treatment(id={self.id}, type='{self.treatment_type}')>"
