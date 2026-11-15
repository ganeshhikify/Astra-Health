"""
ASTRA HEALTH - Physiological Anomaly Predictor Service
Independent Machine Learning prediction engine for astronaut vital signs.

Features:
- Loads the trained scikit-learn Isolation Forest model and StandardScaler.
- Validates all incoming vitals using input_validation.py.
- Computes decision scores and normalized anomaly metrics.
- Provides baseline comparative z-scores for individual metrics.
- Enforces strict medical disclaimers and avoids clinical diagnostic claims.
- Decoupled from FastAPI for standalone use and testability.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib
import numpy as np

from .input_validation import (
    PhysiologicalValidationError,
    validate_input,
    EXPECTED_MODEL_FEATURES,
)


class AnomalyPredictor:
    """
    Production-grade predictor for astronaut physiological anomaly detection.
    Encapsulates model loading, feature scaling, inference, and baseline comparison.
    """

    def __init__(
        self,
        model_path: Optional[Path] = None,
        scaler_path: Optional[Path] = None,
        config_path: Optional[Path] = None,
    ):
        base_dir = Path(__file__).resolve().parent.parent
        saved_models_dir = base_dir / "saved_models"

        self.model_path = model_path or (saved_models_dir / "isolation_forest_model.joblib")
        self.scaler_path = scaler_path or (saved_models_dir / "preprocessor_scaler.joblib")
        self.config_path = config_path or (saved_models_dir / "feature_config.json")

        self.model = None
        self.scaler = None
        self.config = {}
        self.feature_names: List[str] = []
        self.baseline_stats: Dict[str, Dict[str, float]] = {}

        self._load_artifacts()

    def _load_artifacts(self) -> None:
        """Loads and verifies all serialized ML artifacts."""
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model artifact not found at {self.model_path}. Train the model first."
            )
        if not self.scaler_path.exists():
            raise FileNotFoundError(
                f"Preprocessor scaler not found at {self.scaler_path}. Train the model first."
            )
        if not self.config_path.exists():
            raise FileNotFoundError(
                f"Feature configuration not found at {self.config_path}."
            )

        try:
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            with open(self.config_path, "r", encoding="utf-8") as f:
                self.config = json.load(f)
        except Exception as e:
            raise RuntimeError(f"Failed to load ML artifacts: {str(e)}") from e

        self.feature_names = self.config.get("features", EXPECTED_MODEL_FEATURES)
        self.baseline_stats = self.config.get("baseline_statistics", {})

    def is_ready(self) -> bool:
        """Checks if model and preprocessor are successfully loaded."""
        return self.model is not None and self.scaler is not None

    def predict(self, vital_signs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Performs anomaly detection on the provided physiological vital signs.

        Args:
            vital_signs: Dictionary containing at least:
                         heart_rate_bpm, spo2_pct, systolic_bp_mmhg, diastolic_bp_mmhg.
                         Optional: pulse_pressure_mmhg, map_mmhg.

        Returns:
            Structured dictionary containing prediction status, scores, baseline comparison,
            and operational metadata.

        Raises:
            PhysiologicalValidationError: If input validation fails.
            RuntimeError: If model is not loaded.
        """
        if not self.is_ready():
            raise RuntimeError("AnomalyPredictor is not properly initialized.")

        # 1. Validate inputs and calculate derived parameters
        validated_features, derived_features, warnings = validate_input(vital_signs)

        # 2. Construct feature vector in exact configured order
        feature_vector = np.array(
            [[validated_features[feat] for feat in self.feature_names]],
            dtype=np.float64,
        )

        # 3. Apply standard scaling learned from normative baseline
        scaled_vector = self.scaler.transform(feature_vector)

        # 4. Perform Isolation Forest inference
        # predict: 1 = nominal inlier, -1 = outlier anomaly
        raw_pred = int(self.model.predict(scaled_vector)[0])
        is_anomaly = bool(raw_pred == -1)

        # decision_function: higher = normal baseline, lower/negative = abnormal
        decision_score = float(self.model.decision_function(scaled_vector)[0])

        # 5. Normalized anomaly score between 0.0 and 1.0 for dashboards
        # Typical decision scores range from approx -0.25 (extreme anomaly) to +0.25 (typical baseline).
        # We map decision_score to a 0.0 - 1.0 anomaly index using sigmoid/clipping.
        # score < 0 indicates anomaly; lower score = higher anomaly index.
        normalized_anomaly_score = round(float(np.clip(0.5 - (decision_score * 2.5), 0.0, 1.0)), 4)

        # 6. Severity / classification level
        if not is_anomaly:
            severity = "nominal"
            summary_message = "Physiological vitals align with resting normative envelope."
        elif decision_score > -0.05:
            severity = "moderate_deviation"
            summary_message = "Mild to moderate multivariable deviation from baseline observed."
        else:
            severity = "significant_deviation"
            summary_message = "Significant physiological pattern departure from baseline observed."

        # 7. Baseline deviation comparison (z-score for each metric)
        baseline_comparison = {}
        for feat, val in validated_features.items():
            if feat in self.baseline_stats:
                b_mean = self.baseline_stats[feat]["mean"]
                b_std = self.baseline_stats[feat]["std"]
                z_score = round((val - b_mean) / b_std, 2) if b_std > 0 else 0.0
                baseline_comparison[feat] = {
                    "observed_value": val,
                    "baseline_mean": b_mean,
                    "baseline_std": b_std,
                    "z_score": z_score,
                }

        # 8. Assemble structured response
        return {
            "is_anomaly": is_anomaly,
            "prediction_label": "anomaly" if is_anomaly else "nominal",
            "decision_score": round(decision_score, 4),
            "normalized_anomaly_score": normalized_anomaly_score,
            "severity": severity,
            "summary_message": summary_message,
            "features_analyzed": validated_features,
            "derived_features": derived_features,
            "baseline_comparison": baseline_comparison,
            "warnings": warnings,
            "metadata": {
                "model_type": self.config.get("model_type", "IsolationForest"),
                "model_version": self.config.get("version", "1.1.0-research-prototype"),
                "contamination": self.config.get("hyperparameters", {}).get("contamination", 0.05),
                "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            },
            "disclaimer": (
                "ASTRA HEALTH AI Advisory: This output is produced by an unsupervised anomaly "
                "detection model trained on PhysioNet resting baseline physiological data. It is intended "
                "solely for pattern anomaly screening and does NOT constitute a medical diagnosis, clinical prognosis, "
                "or emergency prediction."
            ),
        }
