"""
Health Assessment clinical evaluation API routes.
"""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.health_assessment import (
    HealthAssessmentCreate,
    HealthAssessmentUpdate,
    HealthAssessmentResponse,
)
from app.services.health_assessment_service import HealthAssessmentService
from app.services.astronaut_service import AstronautService

router = APIRouter(prefix="/assessments", tags=["Health Assessments"])


@router.post(
    "/",
    response_model=HealthAssessmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Health Assessment",
    description="Submits a clinical or pre-flight baseline health evaluation for an astronaut.",
)
def create_assessment(data: HealthAssessmentCreate, db: Session = Depends(get_db)):
    astronaut = AstronautService.get_by_id(db, data.astronaut_id)
    if not astronaut:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{data.astronaut_id}' does not exist.",
        )
    return HealthAssessmentService.create(db, data)


@router.get(
    "/",
    response_model=List[HealthAssessmentResponse],
    summary="List Health Assessments",
    description="Retrieves a list of submitted health assessments, optionally filtered by astronaut UUID.",
)
def list_assessments(
    astronaut_id: Optional[uuid.UUID] = Query(None, description="Filter by astronaut UUID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return HealthAssessmentService.get_all(db, astronaut_id=astronaut_id, skip=skip, limit=limit)


@router.get(
    "/{assessment_id}",
    response_model=HealthAssessmentResponse,
    summary="Get Health Assessment",
    description="Retrieves details of a specific clinical health assessment by UUID.",
)
def get_assessment(assessment_id: uuid.UUID, db: Session = Depends(get_db)):
    assessment = HealthAssessmentService.get_by_id(db, assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health assessment with ID '{assessment_id}' not found.",
        )
    return assessment


@router.put(
    "/{assessment_id}",
    response_model=HealthAssessmentResponse,
    summary="Update Health Assessment",
    description="Updates evaluation findings, clinical notes, or countermeasure adherence.",
)
def update_assessment(
    assessment_id: uuid.UUID,
    data: HealthAssessmentUpdate,
    db: Session = Depends(get_db),
):
    assessment = HealthAssessmentService.get_by_id(db, assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health assessment with ID '{assessment_id}' not found.",
        )
    return HealthAssessmentService.update(db, assessment, data)
