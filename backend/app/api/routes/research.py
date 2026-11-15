"""
Research Dataset Analytics API Routes.
Exposes endpoints for exploring verified public health and spaceflight datasets:
1. PhysioNet BIDMC PPG and Respiration
2. NASA Inspiration4 Commercial Astronaut Study (OSD-575)
3. FitBit Wearable Activity and Sleep Data (Furberg et al.)
4. PhysioNet Autonomic Aging Continuous Hemodynamics
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.research_service import ResearchService

router = APIRouter(prefix="/research", tags=["Research Datasets & Analytics"])


@router.get(
    "/datasets",
    summary="List Research Datasets",
    description="Returns metadata catalog for all verified public research datasets integrated into ASTRA HEALTH.",
)
def list_research_datasets(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    return ResearchService.get_all_datasets(db)


@router.get(
    "/summary",
    summary="Research Summary Overview",
    description="Provides an executive summary of public research cohorts, subject counts, and domain metrics.",
)
def get_research_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    return ResearchService.get_summary(db)


@router.get(
    "/bidmc/analytics",
    summary="PhysioNet BIDMC Analytics",
    description="Returns oxygenation, respiratory rate, and heart rate distributions with hypoxemia/tachypnea frequency from 53 adult ICU patients.",
)
def get_bidmc_analytics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    analytics = ResearchService.get_dataset_analytics(db, "bidmc")
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BIDMC analytics data not found.",
        )
    return analytics


@router.get(
    "/osd-575/analytics",
    summary="NASA Inspiration4 (OSD-575) Spaceflight Analytics",
    description="Returns commercial astronaut clinical chemistry, cardiovascular, and metabolic stress biomarker trends across pre-flight, splashdown, and 82-day recovery.",
)
def get_osd575_analytics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    analytics = ResearchService.get_dataset_analytics(db, "osd_575")
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NASA OSD-575 analytics data not found.",
        )
    return analytics


@router.get(
    "/fitbit/analytics",
    summary="FitBit Wearable Activity & Sleep Analytics",
    description="Returns daily steps, active intensity breakdowns, sleep stages, and astronaut exercise countermeasure comparison.",
)
def get_fitbit_analytics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    analytics = ResearchService.get_dataset_analytics(db, "fitbit")
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FitBit wearable analytics data not found.",
        )
    return analytics


@router.get(
    "/autonomic-aging/analytics",
    summary="PhysioNet Autonomic Aging Cardiovascular Analytics",
    description="Returns continuous non-invasive blood pressure, pulse pressure, MAP, and resting heart-rate distributions stratified across 8 age brackets.",
)
def get_autonomic_aging_analytics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    analytics = ResearchService.get_dataset_analytics(db, "autonomic_aging")
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Autonomic Aging analytics data not found.",
        )
    return analytics


@router.get(
    "/{dataset_key}",
    summary="Get Dataset By Key",
    description="Fetches analytical data for an arbitrary verified research dataset.",
)
def get_dataset_by_key(dataset_key: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    analytics = ResearchService.get_dataset_analytics(db, dataset_key)
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research dataset '{dataset_key}' not found.",
        )
    return analytics
