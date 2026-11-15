"""
Astronaut profile API routes.
"""

from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.astronaut import AstronautCreate, AstronautUpdate, AstronautResponse
from app.services.astronaut_service import AstronautService

router = APIRouter(prefix="/astronauts", tags=["Astronauts"])


@router.post(
    "/",
    response_model=AstronautResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Astronaut Profile",
    description="Registers a new astronaut operative profile in the system.",
)
def create_astronaut(data: AstronautCreate, db: Session = Depends(get_db)):
    existing = AstronautService.get_by_crew_id(db, data.crew_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Astronaut with crew ID '{data.crew_id}' already exists.",
        )
    return AstronautService.create(db, data)


@router.get(
    "/",
    response_model=List[AstronautResponse],
    summary="List Astronaut Profiles",
    description="Retrieves a list of registered astronaut profiles.",
)
def list_astronauts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return AstronautService.get_all(db, skip=skip, limit=limit)


@router.get(
    "/{astronaut_id}",
    response_model=AstronautResponse,
    summary="Get Astronaut Profile",
    description="Retrieves a single astronaut profile by UUID.",
)
def get_astronaut(astronaut_id: uuid.UUID, db: Session = Depends(get_db)):
    astronaut = AstronautService.get_by_id(db, astronaut_id)
    if not astronaut:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{astronaut_id}' not found.",
        )
    return astronaut


@router.put(
    "/{astronaut_id}",
    response_model=AstronautResponse,
    summary="Update Astronaut Profile",
    description="Updates operational details or active status of an astronaut profile.",
)
def update_astronaut(
    astronaut_id: uuid.UUID,
    data: AstronautUpdate,
    db: Session = Depends(get_db),
):
    astronaut = AstronautService.get_by_id(db, astronaut_id)
    if not astronaut:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{astronaut_id}' not found.",
        )
    if data.crew_id and data.crew_id != astronaut.crew_id:
        existing = AstronautService.get_by_crew_id(db, data.crew_id)
        if existing and existing.id != astronaut.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Crew ID '{data.crew_id}' is already assigned to another operative.",
            )
    return AstronautService.update(db, astronaut, data)


@router.delete(
    "/{astronaut_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Astronaut Profile",
    description="Removes an astronaut profile from the registry.",
)
def delete_astronaut(astronaut_id: uuid.UUID, db: Session = Depends(get_db)):
    astronaut = AstronautService.get_by_id(db, astronaut_id)
    if not astronaut:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{astronaut_id}' not found.",
        )
    AstronautService.delete(db, astronaut)
    return None
