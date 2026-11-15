"""
System and database health-check diagnostic routes.
"""

from typing import Dict, Any
from fastapi import APIRouter
from app.core.config import settings
from app.database.connection import check_database_connection

router = APIRouter(tags=["Health Diagnostics"])


@router.get(
    "/health",
    summary="System and Database Health Check",
    description="Actively verifies application availability and PostgreSQL database connectivity.",
    response_model=Dict[str, Any],
)
def get_health_status() -> Dict[str, Any]:
    """
    Performs real-time diagnostics on application and PostgreSQL connection.
    If database is unreachable, returns 200 with degraded state rather than crashing.
    """
    db_connected, db_message = check_database_connection()

    return {
        "status": "healthy" if db_connected else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "status": "connected" if db_connected else "unavailable",
            "message": db_message,
        },
    }
