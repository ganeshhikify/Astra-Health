"""
Health Measurement physiological telemetry API routes.
"""

from datetime import datetime
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.health_measurement import HealthMeasurementCreate, HealthMeasurementResponse
from app.services.health_measurement_service import HealthMeasurementService
from app.services.astronaut_service import AstronautService

router = APIRouter(prefix="/measurements", tags=["Health Measurements"])


@router.post(
    "/",
    response_model=HealthMeasurementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save Health Measurement",
    description="Logs a physiological telemetry reading (Heart Rate, SpO2, Temperature, BP) for an astronaut.",
)
def create_measurement(data: HealthMeasurementCreate, db: Session = Depends(get_db)):
    astronaut = AstronautService.get_by_id(db, data.astronaut_id)
    if not astronaut:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{data.astronaut_id}' does not exist.",
        )
    return HealthMeasurementService.create(db, data)


@router.post(
    "/batch",
    response_model=List[HealthMeasurementResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Batch Save Health Measurements",
    description="Logs multiple physiological telemetry readings in a single atomic transaction.",
)
def create_measurements_batch(items: List[HealthMeasurementCreate], db: Session = Depends(get_db)):
    if not items:
        return []
    # Verify astronaut existence for first item (or distinct astronaut IDs)
    distinct_astro_ids = {item.astronaut_id for item in items}
    for astro_id in distinct_astro_ids:
        astronaut = AstronautService.get_by_id(db, astro_id)
        if not astronaut:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Astronaut with ID '{astro_id}' does not exist.",
            )
    return HealthMeasurementService.create_batch(db, items)


@router.get(
    "/",
    response_model=List[HealthMeasurementResponse],
    summary="List Health Measurements",
    description="Retrieves a filtered list of vital physiological measurements.",
)
def list_measurements(
    astronaut_id: Optional[uuid.UUID] = Query(None, description="Filter by astronaut UUID"),
    start_date: Optional[datetime] = Query(None, description="Filter measurements recorded on or after this timestamp"),
    end_date: Optional[datetime] = Query(None, description="Filter measurements recorded on or before this timestamp"),
    is_simulated: Optional[bool] = Query(None, description="Filter by simulated (demo) vs real sensor data"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return HealthMeasurementService.get_all(
        db,
        astronaut_id=astronaut_id,
        start_date=start_date,
        end_date=end_date,
        is_simulated=is_simulated,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{measurement_id}",
    response_model=HealthMeasurementResponse,
    summary="Get Health Measurement",
    description="Retrieves a single telemetry record by UUID.",
)
def get_measurement(measurement_id: uuid.UUID, db: Session = Depends(get_db)):
    measurement = HealthMeasurementService.get_by_id(db, measurement_id)
    if not measurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health measurement with ID '{measurement_id}' not found.",
        )
    return measurement


@router.get(
    "/astronaut/{astronaut_id}",
    response_model=List[HealthMeasurementResponse],
    summary="Get Astronaut Telemetry History",
    description="Retrieves chronological physiological telemetry history for a specific astronaut operative.",
)
def get_astronaut_measurements(
    astronaut_id: uuid.UUID,
    start_date: Optional[datetime] = Query(None, description="Filter measurements after timestamp"),
    end_date: Optional[datetime] = Query(None, description="Filter measurements before timestamp"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    astronaut = AstronautService.get_by_id(db, astronaut_id)
    if not astronaut:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{astronaut_id}' not found.",
        )
    return HealthMeasurementService.get_by_astronaut(
        db,
        astronaut_id=astronaut_id,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )
