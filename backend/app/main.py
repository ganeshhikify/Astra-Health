"""
ASTRA HEALTH - Main FastAPI Application Entrypoint
Aerospace Astronaut Biomedical Telemetry System
"""

import os
import base64
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes.health import router as health_router
from app.api.routes.astronauts import router as astronauts_router
from app.api.routes.missions import router as missions_router
from app.api.routes.assessments import router as assessments_router
from app.api.routes.measurements import router as measurements_router
from app.api.routes.insights import router as insights_router
from app.api.routes.research import router as research_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle management.
    """
    try:
        from app.database.connection import engine
        from app.database.base import Base
        import app.models  # Ensure all models are registered
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[ASTRA STARTUP WARNING] Could not auto-create database tables: {e}")
    yield


# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "ASTRA HEALTH is an aerospace biomedical telemetry system designed for continuous "
        "physiological monitoring of astronauts during long-duration orbital and planetary missions."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Demo Mode Settings
DEMO_AUTH_ENABLED = os.getenv("DEMO_AUTH_ENABLED", "false").lower() in ("true", "1", "yes")
DEMO_AUTH_USER = os.getenv("DEMO_AUTH_USER", "astronaut")
DEMO_AUTH_PASSWORD = os.getenv("DEMO_AUTH_PASSWORD", "")
DEMO_READ_ONLY_MODE = os.getenv("DEMO_READ_ONLY_MODE", "true").lower() in ("true", "1", "yes")


# Security & Access Restriction Middleware
@app.middleware("http")
async def demo_security_middleware(request: Request, call_next):
    # Allow CORS preflight requests
    if request.method == "OPTIONS":
        return await call_next(request)

    # Public health check endpoint
    if request.url.path in ("/health", "/api/v1/health"):
        return await call_next(request)

    # 1. Guard against destructive database operations in demo mode
    if DEMO_READ_ONLY_MODE and request.method == "DELETE":
        return JSONResponse(
            status_code=403,
            content={"detail": "Destructive operations (DELETE) are disabled in public demo mode."},
        )

    # 2. Check HTTP Basic Authentication if enabled
    if DEMO_AUTH_ENABLED:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Basic "):
            return Response(
                status_code=401,
                headers={"WWW-Authenticate": 'Basic realm="ASTRA HEALTH Mission Deck"'},
                content='{"detail": "Authentication required. Please provide valid demo credentials."}',
                media_type="application/json",
            )
        try:
            encoded_credentials = auth_header.split(" ", 1)[1]
            decoded_credentials = base64.b64decode(encoded_credentials).decode("utf-8")
            username, _, password = decoded_credentials.partition(":")
            if username != DEMO_AUTH_USER or password != DEMO_AUTH_PASSWORD:
                return Response(
                    status_code=401,
                    headers={"WWW-Authenticate": 'Basic realm="ASTRA HEALTH Mission Deck"'},
                    content='{"detail": "Invalid mission access credentials."}',
                    media_type="application/json",
                )
        except Exception:
            return Response(
                status_code=401,
                headers={"WWW-Authenticate": 'Basic realm="ASTRA HEALTH Mission Deck"'},
                content='{"detail": "Invalid authorization header."}',
                media_type="application/json",
            )

    return await call_next(request)


# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount health check routes
app.include_router(health_router, prefix="", tags=["Health Diagnostics"])
app.include_router(health_router, prefix=settings.API_V1_STR, tags=["Health Diagnostics"])

# Mount Stage 2 & Stage 3 API modules under /api/v1
app.include_router(astronauts_router, prefix=settings.API_V1_STR)
app.include_router(missions_router, prefix=settings.API_V1_STR)
app.include_router(assessments_router, prefix=settings.API_V1_STR)
app.include_router(measurements_router, prefix=settings.API_V1_STR)
app.include_router(insights_router, prefix=settings.API_V1_STR)
app.include_router(research_router, prefix=settings.API_V1_STR)


@app.get(
    "/",
    summary="System Root",
    description="Root information endpoint providing system metadata and documentation links.",
    tags=["Root"],
)
def root():
    """Returns basic system metadata and links to interactive documentation."""
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "database": settings.POSTGRES_DB,
        "demo_mode": DEMO_READ_ONLY_MODE,
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_spec": f"{settings.API_V1_STR}/openapi.json",
        },
        "health_check": "/health",
        "api_v1_prefix": settings.API_V1_STR,
    }
