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
from app.routers import auth, users, animals, health_records, treatments, vaccinations, movements, qr_codes, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Create all database tables on startup
    Base.metadata.create_all(bind=engine)

    # Ensure QR codes directory exists
    qr_dir = os.path.join(os.path.dirname(__file__), "..", "qr_codes")
    os.makedirs(qr_dir, exist_ok=True)

    # Seed default roles if they don't exist
    from app.database import SessionLocal
    from app.models.role import Role
    db = SessionLocal()
    try:
        if not db.query(Role).first():
            db.add_all([
                Role(name="admin", description="Full system access"),
                Role(name="user", description="Standard user / farmer / staff"),
            ])
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
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
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
app.include_router(dashboard.router)


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
