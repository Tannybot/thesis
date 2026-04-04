"""ORM Models package — import all models here so Alembic can detect them."""
from app.models.role import Role
from app.models.user import User
from app.models.animal import Animal
from app.models.health_record import HealthRecord
from app.models.treatment import Treatment
from app.models.vaccination import Vaccination
from app.models.movement import Movement
from app.models.qr_code import QRCode

__all__ = [
    "Role", "User", "Animal", "HealthRecord",
    "Treatment", "Vaccination", "Movement", "QRCode",
]
