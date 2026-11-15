"""
AI Health Insights & ML Anomaly Detection REST API Route.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status
from pathlib import Path
import sys

# Ensure ml package is accessible
ML_DIR = Path(__file__).resolve().parents[4] / "ml"
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

try:
    from prediction.predictor import AnomalyPredictor, PhysiologicalValidationError
    predictor = AnomalyPredictor()
except Exception as e:
    predictor = None
    print(f"Warning: ML AnomalyPredictor failed to initialize: {e}")

router = APIRouter(prefix="/insights", tags=["AI Health Insights"])


class VitalSignsPayload(BaseModel):
    heart_rate_bpm: float = Field(..., ge=30, le=220, description="Resting heart rate in BPM")
    spo2_pct: float = Field(..., ge=70, le=100, description="Blood oxygen saturation percentage")
    systolic_bp_mmhg: float = Field(..., ge=60, le=240, description="Systolic blood pressure in mmHg")
    diastolic_bp_mmhg: float = Field(..., ge=40, le=140, description="Diastolic blood pressure in mmHg")
    pulse_pressure_mmhg: Optional[float] = Field(None, description="Optional derived pulse pressure")
    map_mmhg: Optional[float] = Field(None, description="Optional derived mean arterial pressure")


@router.post(
    "/analyze",
    summary="Analyze Physiological Biometrics",
    description="Submits vital signs to the Isolation Forest anomaly detector for statistical deviation analysis.",
)
def analyze_vitals(payload: VitalSignsPayload):
    if predictor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML anomaly prediction service is not initialized on this server.",
        )

    try:
        # Convert payload to dict
        data = payload.model_dump()
        result = predictor.predict(data)
        return result
    except PhysiologicalValidationError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(exc)}",
        )
