"""User model — stores user credentials and profile info."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    role = relationship("Role", back_populates="users")
    owned_animals = relationship("Animal", back_populates="owner",
                                 foreign_keys="Animal.owner_id")
    registered_animals = relationship("Animal", back_populates="registered_by_user",
                                      foreign_keys="Animal.registered_by")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"
