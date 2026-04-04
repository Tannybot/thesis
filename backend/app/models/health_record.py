"""Health Record model — tracks health status, diseases, and mortality."""
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(Integer, ForeignKey("animals.id"), nullable=False)
    record_type = Column(String(50), nullable=False)  # checkup, disease, mortality, observation
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=True)  # low, medium, high, critical
    diagnosis = Column(String(255), nullable=True)
    record_date = Column(Date, nullable=False)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    animal = relationship("Animal", back_populates="health_records")
    recorder = relationship("User")
    treatments = relationship("Treatment", back_populates="health_record")

    def __repr__(self):
        return f"<HealthRecord(id={self.id}, type='{self.record_type}')>"
