"""
FastAPI Application Entry Point
Livestock Monitoring and Traceability System
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import engine, Base
from app.models import *  # noqa: F401, F403 — import all models for table creation

# Import all routers
from app.routers import auth, users, animals, health_records, treatments, vaccinations, movements, qr_codes, dashboard, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Create all database tables on startup
    Base.metadata.create_all(bind=engine)

    # Ensure QR codes directory exists
    qr_dir = os.path.join(os.path.dirname(__file__), "..", "qr_codes")
    os.makedirs(qr_dir, exist_ok=True)

    # Seed required roles and default admin account for fresh deployments.
    from app.database import SessionLocal
    from app.models.role import Role
    from app.models.user import User
    from app.utils.security import hash_password
    db = SessionLocal()
    try:
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        user_role = db.query(Role).filter(Role.name == "user").first()

        if not admin_role:
            admin_role = Role(name="admin", description="Full system access")
            db.add(admin_role)
        if not user_role:
            user_role = Role(name="user", description="Standard user / farmer / staff")
            db.add(user_role)
        db.flush()

        admin = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.DEFAULT_ADMIN_EMAIL,
                full_name=settings.DEFAULT_ADMIN_NAME,
                hashed_password=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
                role_id=admin_role.id,
                is_active=True,
            )
            db.add(admin)
        else:
            admin.role_id = admin_role.id
            admin.is_active = True

        if db.new or db.dirty:
            db.commit()
    finally:
        db.close()

    yield  # Application runs here

    # Shutdown cleanup (if needed)


app = FastAPI(
    title=settings.APP_NAME,
    description="QR Code-Based Livestock Monitoring and Traceability System API",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for QR code images
qr_codes_dir = os.path.join(os.path.dirname(__file__), "..", "qr_codes")
os.makedirs(qr_codes_dir, exist_ok=True)
app.mount("/static/qr", StaticFiles(directory=qr_codes_dir), name="qr_codes")

# Register API routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(animals.router)
app.include_router(health_records.router)
app.include_router(treatments.router)
app.include_router(vaccinations.router)
app.include_router(movements.router)
app.include_router(qr_codes.router)
app.include_router(qr_codes.trace_router)
app.include_router(dashboard.router)
app.include_router(ai.router)


@app.get("/", tags=["Root"])
def root():
    """API health check endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Root"])
def health_check():
    """API health check."""
    return {"status": "healthy"}
