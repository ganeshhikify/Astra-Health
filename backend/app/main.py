"""
ASTRA HEALTH - Main FastAPI Application Entrypoint
Aerospace Astronaut Biomedical Telemetry System
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes.health import router as health_router
from app.api.routes.astronauts import router as astronauts_router
from app.api.routes.missions import router as missions_router
from app.api.routes.assessments import router as assessments_router
from app.api.routes.measurements import router as measurements_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle management.
    """
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

# Configure Cross-Origin Resource Sharing (CORS) for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount health check routes at root /health and versioned /api/v1/health
app.include_router(health_router, prefix="", tags=["Health Diagnostics"])
app.include_router(health_router, prefix=settings.API_V1_STR, tags=["Health Diagnostics"])

# Mount Stage 2 API modules under /api/v1
app.include_router(astronauts_router, prefix=settings.API_V1_STR)
app.include_router(missions_router, prefix=settings.API_V1_STR)
app.include_router(assessments_router, prefix=settings.API_V1_STR)
app.include_router(measurements_router, prefix=settings.API_V1_STR)


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
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_spec": f"{settings.API_V1_STR}/openapi.json",
        },
        "health_check": "/health",
        "api_v1_prefix": settings.API_V1_STR,
    }
