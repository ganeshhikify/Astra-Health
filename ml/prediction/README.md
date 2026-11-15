# ASTRA HEALTH — ML Prediction Service & Backend Integration Guide

This module provides the independent machine learning inference engine for the ASTRA HEALTH astronaut health monitoring system. It wraps the scikit-learn Isolation Forest model, manages input validation, computes derived hemodynamic parameters, and returns structured anomaly assessments.

---

## 1. Module Architecture

```
ml/
├── prediction/
│   ├── __init__.py           # Package exports
│   ├── predictor.py          # AnomalyPredictor class & inference logic
│   ├── input_validation.py   # Biological boundary & vital sign validation
│   └── README.md             # Architecture & integration documentation
├── saved_models/
│   ├── isolation_forest_model.joblib   # Trained scikit-learn model
│   ├── preprocessor_scaler.joblib      # StandardScaler fitted on baseline
│   └── feature_config.json             # Feature definitions & baseline stats
```

The service is completely decoupled from FastAPI. It uses standard Python data structures and raises typed exceptions (`PhysiologicalValidationError`), making it easily testable and embeddable into any Python service or worker.

---

## 2. Input Features & Specifications

### Required Core Vital Signs
Incoming requests must provide the following four core vitals. Missing core vitals will result in a validation error (measurements are never invented or imputed):

| Feature Name | Data Type | Units | Plausible Boundary | Description |
| :--- | :--- | :--- | :--- | :--- |
| `heart_rate_bpm` | `float` / `int` | BPM | `[20.0, 300.0]` | Heart rate in beats per minute |
| `spo2_pct` | `float` / `int` | % | `[50.0, 100.0]` | Peripheral blood oxygen saturation |
| `systolic_bp_mmhg` | `float` / `int` | mmHg | `[40.0, 300.0]` | Systolic arterial blood pressure |
| `diastolic_bp_mmhg` | `float` / `int` | mmHg | `[20.0, 200.0]` | Diastolic arterial blood pressure |

*Requirement:* `systolic_bp_mmhg` must be strictly greater than `diastolic_bp_mmhg`.

### Derived Hemodynamic Parameters
The model operates on a 6-feature vector. If the two derived parameters are omitted, the service calculates them automatically using standard clinical formulas:

| Parameter | Formula | Plausible Boundary | Description |
| :--- | :--- | :--- | :--- |
| `pulse_pressure_mmhg` | `systolic - diastolic` | `[5.0, 150.0]` mmHg | Stroke volume & arterial compliance index |
| `map_mmhg` | `diastolic + (pulse_pressure / 3)` | `[30.0, 220.0]` mmHg | Mean arterial pressure / perfusion index |

---

## 3. Structured Prediction Output

A successful call to `AnomalyPredictor.predict(vitals)` returns a JSON-serializable dictionary matching this schema:

```json
{
  "is_anomaly": false,
  "prediction_label": "nominal",
  "decision_score": 0.1744,
  "normalized_anomaly_score": 0.064,
  "severity": "nominal",
  "summary_message": "Physiological vitals align with resting normative envelope.",
  "features_analyzed": {
    "heart_rate_bpm": 70.0,
    "spo2_pct": 98.0,
    "systolic_bp_mmhg": 115.0,
    "diastolic_bp_mmhg": 75.0,
    "pulse_pressure_mmhg": 40.0,
    "map_mmhg": 88.33
  },
  "derived_features": {
    "pulse_pressure_mmhg": 40.0,
    "map_mmhg": 88.33
  },
  "baseline_comparison": {
    "heart_rate_bpm": {
      "observed_value": 70.0,
      "baseline_mean": 72.797,
      "baseline_std": 13.544,
      "z_score": -0.21
    },
    "spo2_pct": {
      "observed_value": 98.0,
      "baseline_mean": 97.156,
      "baseline_std": 1.003,
      "z_score": 0.84
    },
    "systolic_bp_mmhg": {
      "observed_value": 115.0,
      "baseline_mean": 116.75,
      "baseline_std": 14.813,
      "z_score": -0.12
    },
    "diastolic_bp_mmhg": {
      "observed_value": 75.0,
      "baseline_mean": 74.25,
      "baseline_std": 9.387,
      "z_score": 0.08
    },
    "pulse_pressure_mmhg": {
      "observed_value": 40.0,
      "baseline_mean": 42.5,
      "baseline_std": 10.434,
      "z_score": -0.24
    },
    "map_mmhg": {
      "observed_value": 88.33,
      "baseline_mean": 88.417,
      "baseline_std": 10.378,
      "z_score": -0.01
    }
  },
  "warnings": [],
  "metadata": {
    "model_type": "IsolationForest",
    "model_version": "1.1.0-research-prototype",
    "contamination": 0.05,
    "timestamp_utc": "2026-11-15T01:45:00.000000+00:00"
  },
  "disclaimer": "ASTRA HEALTH AI Advisory: This output is produced by an unsupervised anomaly detection model trained on PhysioNet resting baseline physiological data. It is intended solely for pattern anomaly screening and does NOT constitute a medical diagnosis, clinical prognosis, or emergency prediction."
}
```

---

## 4. Future FastAPI Backend Integration Workflow

When integrating into the existing FastAPI backend (`backend/app`), follow this non-invasive pattern:

### Step 1: Install ML Dependencies
Ensure the backend Python environment has `scikit-learn` and `joblib` installed:
```bash
pip install scikit-learn>=1.4.0 joblib>=1.3.0
```

### Step 2: Singleton Predictor Pattern
Instantiate the `AnomalyPredictor` once on application startup or within a dependency:

```python
# backend/app/services/ai_predictor.py
from functools import lru_cache
from pathlib import Path
from ml.prediction import AnomalyPredictor

MODEL_DIR = Path(__file__).resolve().parents[3] / "ml" / "saved_models"

@lru_cache()
def get_anomaly_predictor() -> AnomalyPredictor:
    """Returns singleton instance of AnomalyPredictor."""
    return AnomalyPredictor(
        model_path=MODEL_DIR / "isolation_forest_model.joblib",
        scaler_path=MODEL_DIR / "preprocessor_scaler.joblib",
        config_path=MODEL_DIR / "feature_config.json",
    )
```

### Step 3: FastAPI Route Handler Pattern
Create an endpoint (e.g. `POST /api/v1/health-measurements/{id}/anomaly-assessment` or `POST /api/v1/ai/assess`):

```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from ml.prediction import AnomalyPredictor, PhysiologicalValidationError
from backend.app.services.ai_predictor import get_anomaly_predictor

router = APIRouter(prefix="/ai", tags=["AI Health Insights"])

class VitalsInputSchema(BaseModel):
    heart_rate_bpm: float = Field(..., ge=20.0, le=300.0)
    spo2_pct: float = Field(..., ge=50.0, le=100.0)
    systolic_bp_mmhg: float = Field(..., ge=40.0, le=300.0)
    diastolic_bp_mmhg: float = Field(..., ge=20.0, le=200.0)
    pulse_pressure_mmhg: float | None = None
    map_mmhg: float | None = None

@router.post("/assess")
def assess_vitals(
    payload: VitalsInputSchema,
    predictor: AnomalyPredictor = Depends(get_anomaly_predictor),
):
    try:
        result = predictor.predict(payload.model_dump())
        return result
    except PhysiologicalValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Inference failure")
```

---

## 5. Model Limitations & Safety Rules

1. **Unsupervised Baseline Training:**
   The model is trained strictly on normative resting measurements (`sit` activity). Anomaly labels indicate statistical deviation from resting equilibrium, not clinical pathologies.
2. **Absence of Core Body Temperature:**
   The dataset does not provide core body temperature (only IMU and optodiode package surface temperatures). Core body temperature is not included in the feature vector.
3. **No Synthetic Training Data:**
   The model was trained purely on genuine PhysioNet clinical vitals. Synthetic stress cases are used solely for black-box boundary testing.
4. **Clinical Advisory:**
   The service includes an immutable medical disclaimer on every prediction response. It must never be presented as an emergency alert system or diagnostic tool.
