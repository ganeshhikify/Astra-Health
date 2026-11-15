"""API routes package."""
from app.api.routes.health import router as health_router
from app.api.routes.astronauts import router as astronauts_router
from app.api.routes.missions import router as missions_router
from app.api.routes.assessments import router as assessments_router
from app.api.routes.measurements import router as measurements_router

__all__ = [
    "health_router",
    "astronauts_router",
    "missions_router",
    "assessments_router",
    "measurements_router",
]
