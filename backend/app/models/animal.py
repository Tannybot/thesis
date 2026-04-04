"""Animal model — core entity for livestock tracking."""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Animal(Base):
    __tablename__ = "animals"

    id = Column(Integer, primary_key=True, index=True)
    animal_uid = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    species = Column(String(50), nullable=False)  # cattle, goat, sheep, pig, poultry
    breed = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(10), nullable=False)  # male, female
    weight = Column(Float, nullable=True)
    growth_stage = Column(String(50), nullable=True)  # weaner, grower, finisher, breeder
    status = Column(String(30), default="active")  # active, sold, deceased, transferred
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    registered_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    qr_code_path = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    owner = relationship("User", back_populates="owned_animals",
                         foreign_keys=[owner_id])
    registered_by_user = relationship("User", back_populates="registered_animals",
                                       foreign_keys=[registered_by])
    health_records = relationship("HealthRecord", back_populates="animal",
                                   cascade="all, delete-orphan")
    treatments = relationship("Treatment", back_populates="animal",
                               cascade="all, delete-orphan")
    vaccinations = relationship("Vaccination", back_populates="animal",
                                 cascade="all, delete-orphan")
    movements = relationship("Movement", back_populates="animal",
                              cascade="all, delete-orphan")
    qr_code = relationship("QRCode", back_populates="animal", uselist=False,
                            cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Animal(id={self.id}, uid='{self.animal_uid}', species='{self.species}')>"
