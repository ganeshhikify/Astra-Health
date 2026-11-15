"""
ASTRA HEALTH - Automated Tests for ML Prediction Service
Verifies:
- Model loading and readiness
- Feature validation boundaries
- Derived parameter calculations (Pulse Pressure, MAP)
- Successful nominal predictions on independent holdout subjects (s17)
- Exploratory test on exertion vitals (s2)
- Synthetic multivariable stress benchmark detection
- Missing feature rejection (strict refusal to invent measurements)
- Invalid input rejection (type errors, boundary breaches, hemodynamic inversion)
- Unexpected feature handling
- Consistent structured output schema and medical disclaimers
"""

from pathlib import Path
import pytest
import numpy as np

from ml.prediction import (
    AnomalyPredictor,
    PhysiologicalValidationError,
    validate_input,
    EXPECTED_MODEL_FEATURES,
    REQUIRED_CORE_VITALS,
)


@pytest.fixture(scope="module")
def predictor():
    """Provides a singleton predictor instance loaded from default saved models."""
    return AnomalyPredictor()


class TestModelLoading:
    """Verifies that ML model artifacts exist and load correctly."""

    def test_predictor_initialization(self, predictor):
        assert predictor.is_ready() is True
        assert predictor.model is not None
        assert predictor.scaler is not None
        assert len(predictor.feature_names) == 6
        assert predictor.feature_names == EXPECTED_MODEL_FEATURES

    def test_missing_model_file_raises_error(self, tmp_path):
        fake_model = tmp_path / "non_existent_model.joblib"
        with pytest.raises(FileNotFoundError):
            AnomalyPredictor(model_path=fake_model)


class TestInputValidation:
    """Tests the input validation logic and biological safety bounds."""

    def test_valid_core_vitals_only(self):
        data = {
            "heart_rate_bpm": 72.0,
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 120.0,
            "diastolic_bp_mmhg": 80.0,
        }
        validated, derived, warnings = validate_input(data)
        assert len(validated) == 6
        assert derived["pulse_pressure_mmhg"] == 40.0
        assert derived["map_mmhg"] == round(80.0 + (40.0 / 3.0), 2)
        assert len(warnings) == 0

    def test_explicit_derived_vitals_preserved(self):
        data = {
            "heart_rate_bpm": 70.0,
            "spo2_pct": 99.0,
            "systolic_bp_mmhg": 110.0,
            "diastolic_bp_mmhg": 70.0,
            "pulse_pressure_mmhg": 40.0,
            "map_mmhg": 83.33,
        }
        validated, derived, _ = validate_input(data)
        assert validated["pulse_pressure_mmhg"] == 40.0
        assert validated["map_mmhg"] == 83.33
        assert len(derived) == 0  # Was not calculated, was provided

    @pytest.mark.parametrize("missing_vital", REQUIRED_CORE_VITALS)
    def test_missing_core_vitals_rejected(self, missing_vital):
        base_data = {
            "heart_rate_bpm": 72.0,
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 120.0,
            "diastolic_bp_mmhg": 80.0,
        }
        del base_data[missing_vital]
        with pytest.raises(PhysiologicalValidationError, match="Missing required physiological feature"):
            validate_input(base_data)

    @pytest.mark.parametrize("null_vital", REQUIRED_CORE_VITALS)
    def test_null_core_vitals_rejected(self, null_vital):
        base_data = {
            "heart_rate_bpm": 72.0,
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 120.0,
            "diastolic_bp_mmhg": 80.0,
        }
        base_data[null_vital] = None
        with pytest.raises(PhysiologicalValidationError, match="Missing required physiological feature"):
            validate_input(base_data)

    def test_non_numeric_vital_rejected(self):
        data = {
            "heart_rate_bpm": "abnormal_tachycardia",
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 120.0,
            "diastolic_bp_mmhg": 80.0,
        }
        with pytest.raises(PhysiologicalValidationError, match="Invalid non-numeric value"):
            validate_input(data)

    @pytest.mark.parametrize(
        "vital,bad_value",
        [
            ("heart_rate_bpm", 10.0),    # Below min (20)
            ("heart_rate_bpm", 350.0),   # Above max (300)
            ("spo2_pct", 45.0),          # Below min (50)
            ("spo2_pct", 105.0),         # Above max (100)
            ("systolic_bp_mmhg", 35.0),  # Below min (40)
            ("diastolic_bp_mmhg", 210.0),# Above max (200)
        ],
    )
    def test_out_of_bounds_vital_rejected(self, vital, bad_value):
        data = {
            "heart_rate_bpm": 72.0,
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 120.0,
            "diastolic_bp_mmhg": 80.0,
        }
        data[vital] = bad_value
        with pytest.raises(PhysiologicalValidationError, match="is biologically implausible"):
            validate_input(data)

    def test_systolic_less_than_diastolic_rejected(self):
        data = {
            "heart_rate_bpm": 75.0,
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 80.0,
            "diastolic_bp_mmhg": 120.0,
        }
        with pytest.raises(PhysiologicalValidationError, match="must be strictly greater than"):
            validate_input(data)

    def test_systolic_equal_diastolic_rejected(self):
        data = {
            "heart_rate_bpm": 75.0,
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 80.0,
            "diastolic_bp_mmhg": 80.0,
        }
        with pytest.raises(PhysiologicalValidationError, match="must be strictly greater than"):
            validate_input(data)

    def test_unexpected_keys_warned(self):
        data = {
            "heart_rate_bpm": 72.0,
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 120.0,
            "diastolic_bp_mmhg": 80.0,
            "extra_sensor_radiation": 0.05,
        }
        _, _, warnings = validate_input(data, strict_unexpected=False)
        assert len(warnings) == 1
        assert "extra_sensor_radiation" in warnings[0]

    def test_unexpected_keys_strict_mode(self):
        data = {
            "heart_rate_bpm": 72.0,
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 120.0,
            "diastolic_bp_mmhg": 80.0,
            "extra_sensor_radiation": 0.05,
        }
        with pytest.raises(PhysiologicalValidationError, match="Unexpected fields received"):
            validate_input(data, strict_unexpected=True)


class TestPredictionOutputAndScoring:
    """Verifies that model inference produces consistent, structured predictions."""

    def test_independent_holdout_resting_prediction(self, predictor):
        # Real PhysioNet baseline values for Subject s17 (Independent holdout, never in training)
        data = {
            "heart_rate_bpm": 74.5,
            "spo2_pct": 95.0,
            "systolic_bp_mmhg": 113.0,
            "diastolic_bp_mmhg": 69.0,
            "pulse_pressure_mmhg": 44.0,
            "map_mmhg": 83.67,
        }
        result = predictor.predict(data)

        assert result["is_anomaly"] is False
        assert result["prediction_label"] == "nominal"
        assert result["decision_score"] > 0.0
        assert 0.0 <= result["normalized_anomaly_score"] <= 1.0
        assert result["severity"] == "nominal"
        assert "features_analyzed" in result
        assert "baseline_comparison" in result
        assert "disclaimer" in result
        assert "NOT constitute a medical diagnosis" in result["disclaimer"]

    def test_independent_holdout_exercise_prediction(self, predictor):
        # Real PhysioNet exercise values for Subject s17 (Independent holdout, never in training)
        data = {
            "heart_rate_bpm": 83.0,
            "spo2_pct": 95.0,
            "systolic_bp_mmhg": 116.0,
            "diastolic_bp_mmhg": 62.0,
            "pulse_pressure_mmhg": 54.0,
            "map_mmhg": 80.0,
        }
        result = predictor.predict(data)

        # Subject s17's exercise vitals remain compatible with the learned healthy boundary
        assert result["is_anomaly"] is False
        assert result["prediction_label"] == "nominal"
        assert result["decision_score"] > 0.0

    def test_exploratory_training_cohort_exercise_stress(self, predictor):
        # Exploratory in-cohort stress observation (Subject s2, run end)
        # Note: s2 was in the training participant cohort (s1-s16); this test demonstrates
        # model sensitivity to acute physiological elevation, not an independent holdout.
        data = {
            "heart_rate_bpm": 118.5,
            "spo2_pct": 97.0,
            "systolic_bp_mmhg": 160.0,
            "diastolic_bp_mmhg": 86.0,
            "pulse_pressure_mmhg": 74.0,
            "map_mmhg": 110.67,
        }
        result = predictor.predict(data)

        assert result["is_anomaly"] is True
        assert result["prediction_label"] == "anomaly"
        assert result["decision_score"] < 0.0
        assert result["normalized_anomaly_score"] > 0.5
        assert result["severity"] in ["moderate_deviation", "significant_deviation"]

    def test_hypoxia_with_compensatory_tachycardia_benchmark(self, predictor):
        # Synthetic physiological boundary test
        data = {
            "heart_rate_bpm": 120.0,
            "spo2_pct": 82.0,
            "systolic_bp_mmhg": 130.0,
            "diastolic_bp_mmhg": 85.0,
        }
        result = predictor.predict(data)

        assert result["is_anomaly"] is True
        assert result["prediction_label"] == "anomaly"
        assert result["decision_score"] < 0.0

    def test_consistent_schema_keys(self, predictor):
        data = {
            "heart_rate_bpm": 70.0,
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 115.0,
            "diastolic_bp_mmhg": 75.0,
        }
        result = predictor.predict(data)

        required_keys = {
            "is_anomaly",
            "prediction_label",
            "decision_score",
            "normalized_anomaly_score",
            "severity",
            "summary_message",
            "features_analyzed",
            "derived_features",
            "baseline_comparison",
            "warnings",
            "metadata",
            "disclaimer",
        }
        assert required_keys.issubset(set(result.keys()))
