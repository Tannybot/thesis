"""Movement model — tracks supply chain movements (farm-to-market traceability)."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Movement(Base):
    __tablename__ = "movements"

    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(Integer, ForeignKey("animals.id"), nullable=False)
    movement_type = Column(String(50), nullable=False)  # transfer, transport, sale, slaughter
    from_location = Column(String(255), nullable=False)
    to_location = Column(String(255), nullable=False)
    departure_date = Column(DateTime, nullable=False)
    arrival_date = Column(DateTime, nullable=True)
    handler = Column(String(255), nullable=True)
    transport_method = Column(String(100), nullable=True)  # truck, rail, walk, other
    purpose = Column(String(255), nullable=True)
    buyer_info = Column(String(500), nullable=True)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    animal = relationship("Animal", back_populates="movements")
    recorder = relationship("User")

    def __repr__(self):
        return f"<Movement(id={self.id}, type='{self.movement_type}')>"
