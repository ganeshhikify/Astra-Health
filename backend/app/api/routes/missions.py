"""
Mission assignment API routes.
"""

from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.mission import MissionCreate, MissionUpdate, MissionResponse
from app.services.mission_service import MissionService
from app.services.astronaut_service import AstronautService

router = APIRouter(prefix="/missions", tags=["Missions"])


@router.post(
    "/",
    response_model=MissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Mission",
    description="Registers an aerospace mission profile and associates an assigned operative.",
)
def create_mission(data: MissionCreate, db: Session = Depends(get_db)):
    if data.astronaut_id:
        astronaut = AstronautService.get_by_id(db, data.astronaut_id)
        if not astronaut:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assigned astronaut with ID '{data.astronaut_id}' does not exist.",
            )
    return MissionService.create(db, data)


@router.get(
    "/",
    response_model=List[MissionResponse],
    summary="List Missions",
    description="Retrieves a list of configured aerospace missions.",
)
def list_missions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return MissionService.get_all(db, skip=skip, limit=limit)


@router.get(
    "/{mission_id}",
    response_model=MissionResponse,
    summary="Get Mission",
    description="Retrieves a specific mission configuration by UUID.",
)
def get_mission(mission_id: uuid.UUID, db: Session = Depends(get_db)):
    mission = MissionService.get_by_id(db, mission_id)
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mission with ID '{mission_id}' not found.",
        )
    return mission


@router.put(
    "/{mission_id}",
    response_model=MissionResponse,
    summary="Update Mission",
    description="Updates mission destination, duration, environment, or operative assignment.",
)
def update_mission(
    mission_id: uuid.UUID,
    data: MissionUpdate,
    db: Session = Depends(get_db),
):
    mission = MissionService.get_by_id(db, mission_id)
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mission with ID '{mission_id}' not found.",
        )
    if data.astronaut_id:
        astronaut = AstronautService.get_by_id(db, data.astronaut_id)
        if not astronaut:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assigned astronaut with ID '{data.astronaut_id}' does not exist.",
            )
    return MissionService.update(db, mission, data)


@router.delete(
    "/{mission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Mission",
    description="Removes a mission record from the system.",
)
def delete_mission(mission_id: uuid.UUID, db: Session = Depends(get_db)):
    mission = MissionService.get_by_id(db, mission_id)
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mission with ID '{mission_id}' not found.",
        )
    MissionService.delete(db, mission)
    return None
