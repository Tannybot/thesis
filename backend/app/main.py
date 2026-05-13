"""
FastAPI Application Entry Point
Livestock Monitoring and Traceability System
"""
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
from sqlalchemy import inspect, text

from app.config import settings
from app.database import engine, Base
from app.middleware.security import SecurityMiddleware
from app.models import *  # noqa: F401, F403 — import all models for table creation

# Import all routers
from app.routers import auth, users, animals, health_records, treatments, vaccinations, movements, qr_codes, dashboard, ai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def ensure_security_columns() -> None:
    """Add lockout columns for deployments created before this security update."""
    inspector = inspect(engine)
    try:
        columns = {column["name"] for column in inspector.get_columns("users")}
    except Exception:
        logger.exception("Unable to inspect users table for security columns")
        return

    statements = []
    dialect = engine.dialect.name
    if "failed_login_attempts" not in columns:
        if dialect == "postgresql":
            statements.append("ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0")
        else:
            statements.append("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0")
    if "locked_until" not in columns:
        if dialect == "postgresql":
            statements.append("ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE")
        else:
            statements.append("ALTER TABLE users ADD COLUMN locked_until DATETIME")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
    logger.info("Security account-lockout columns verified")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Create all database tables on startup
    Base.metadata.create_all(bind=engine)
    ensure_security_columns()

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
            if settings.RESET_DEFAULT_ADMIN_PASSWORD:
                admin.hashed_password = hash_password(settings.DEFAULT_ADMIN_PASSWORD)

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

# Security and CORS middleware
app.add_middleware(SecurityMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Log unexpected backend errors without exposing internals to clients."""
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
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
