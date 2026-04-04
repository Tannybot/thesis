"""QR Code model — stores generated QR code metadata per animal."""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(Integer, ForeignKey("animals.id"), unique=True, nullable=False)
    qr_data = Column(String(500), nullable=False)  # The URL/data encoded in the QR
    qr_image_path = Column(String(500), nullable=False)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

    # Relationships
    animal = relationship("Animal", back_populates="qr_code")

    def __repr__(self):
        return f"<QRCode(id={self.id}, animal_id={self.animal_id})>"
