"""
ASTRA HEALTH - Prediction Testing Script
Executes standardized prediction test cases against the AnomalyPredictor:
1. Valid normal-looking input (based on independent holdout resting observation: Subject s17 Sit End)
2. Independent holdout exercise observation (Subject s17 Run End)
3. Exploratory training-cohort exertion test (Subject s2 Run End - labeled as exploratory, not holdout)
4. Synthetic physiological stress benchmark (Simulated Acute Hypoxia with Tachycardia)
5. Missing feature values (omitted and null)
6. Invalid feature values (out of biological bounds and hemodynamic inversion)
7. Missing or unexpected feature names
"""

from pathlib import Path
import sys

# Ensure ml package is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from prediction import AnomalyPredictor, PhysiologicalValidationError


def run_prediction_tests():
    predictor = AnomalyPredictor()
    print("=" * 80)
    print("ASTRA HEALTH - PREDICTION TESTING SUITE (QUALITY AUDIT)")
    print("=" * 80)

    test_cases = [
        {
            "test_id": "TEST-1",
            "name": "Independent Holdout Resting Observation (Subject s17 Sit End)",
            "data_source": "Independent Holdout Subject s17 (Never in training cohort s1-s16)",
            "payload": {
                "heart_rate_bpm": 80.5,
                "spo2_pct": 97.0,
                "systolic_bp_mmhg": 109.0,
                "diastolic_bp_mmhg": 72.0,
                "pulse_pressure_mmhg": 37.0,
                "map_mmhg": 84.33,
            },
            "expect_error": False,
        },
        {
            "test_id": "TEST-2A",
            "name": "Independent Holdout Exercise Observation (Subject s17 Run End)",
            "data_source": "Independent Holdout Subject s17 (Never in training cohort s1-s16)",
            "payload": {
                "heart_rate_bpm": 83.0,
                "spo2_pct": 95.0,
                "systolic_bp_mmhg": 116.0,
                "diastolic_bp_mmhg": 62.0,
                "pulse_pressure_mmhg": 54.0,
                "map_mmhg": 80.0,
            },
            "expect_error": False,
        },
        {
            "test_id": "TEST-2B",
            "name": "Exploratory Training-Cohort High-Exertion Test (Subject s2 Run End)",
            "data_source": (
                "Exploratory Training Participant Observation (Subject s2 Run End). "
                "NOTE: s2 belongs to training participant group s1-s16. This is an exploratory "
                "in-cohort stress test demonstrating model sensitivity to strenuous exercise vitals, "
                "NOT an independent holdout evaluation."
            ),
            "payload": {
                "heart_rate_bpm": 118.5,
                "spo2_pct": 97.0,
                "systolic_bp_mmhg": 160.0,
                "diastolic_bp_mmhg": 86.0,
                "pulse_pressure_mmhg": 74.0,
                "map_mmhg": 110.67,
            },
            "expect_error": False,
        },
        {
            "test_id": "TEST-2C",
            "name": "Synthetic Multivariable Crisis Benchmark (Hypoxia + Tachycardia)",
            "data_source": "Synthetic Benchmark (Simulated Acute Hypoxic Surge - NOT real patient data)",
            "payload": {
                "heart_rate_bpm": 120.0,
                "spo2_pct": 82.0,
                "systolic_bp_mmhg": 130.0,
                "diastolic_bp_mmhg": 85.0,
                "pulse_pressure_mmhg": 45.0,
                "map_mmhg": 100.0,
            },
            "expect_error": False,
        },
        {
            "test_id": "TEST-3A",
            "name": "Missing Required Core Feature (Missing SpO2)",
            "data_source": "Synthetic Test Payload",
            "payload": {
                "heart_rate_bpm": 72.0,
                # spo2_pct intentionally omitted
                "systolic_bp_mmhg": 120.0,
                "diastolic_bp_mmhg": 80.0,
            },
            "expect_error": True,
        },
        {
            "test_id": "TEST-3B",
            "name": "Missing Feature Value as None (Null Heart Rate)",
            "data_source": "Synthetic Test Payload",
            "payload": {
                "heart_rate_bpm": None,
                "spo2_pct": 98.0,
                "systolic_bp_mmhg": 120.0,
                "diastolic_bp_mmhg": 80.0,
            },
            "expect_error": True,
        },
        {
            "test_id": "TEST-4A",
            "name": "Invalid Biologically Implausible Feature (Negative Heart Rate)",
            "data_source": "Synthetic Test Payload",
            "payload": {
                "heart_rate_bpm": -15.0,
                "spo2_pct": 98.0,
                "systolic_bp_mmhg": 120.0,
                "diastolic_bp_mmhg": 80.0,
            },
            "expect_error": True,
        },
        {
            "test_id": "TEST-4B",
            "name": "Invalid Hemodynamic Inversion (Systolic <= Diastolic)",
            "data_source": "Synthetic Test Payload",
            "payload": {
                "heart_rate_bpm": 75.0,
                "spo2_pct": 98.0,
                "systolic_bp_mmhg": 70.0,
                "diastolic_bp_mmhg": 90.0,
            },
            "expect_error": True,
        },
        {
            "test_id": "TEST-5A",
            "name": "Unexpected Feature Names Handled Gracefully",
            "data_source": "Synthetic Test Payload (Contains Unknown Sensors)",
            "payload": {
                "heart_rate_bpm": 74.0,
                "spo2_pct": 98.0,
                "systolic_bp_mmhg": 118.0,
                "diastolic_bp_mmhg": 76.0,
                "galvanic_skin_response": 4.5,
                "cabin_co2_level": 400.0,
            },
            "expect_error": False,
        },
    ]

    results = []

    for tc in test_cases:
        print(f"\n--- Running: {tc['test_id']} - {tc['name']} ---")
        print(f"Data Origin: {tc['data_source']}")
        print(f"Input: {tc['payload']}")

        try:
            res = predictor.predict(tc["payload"])
            if tc["expect_error"]:
                print(f"[FAIL] Expected validation error, but prediction succeeded: {res['prediction_label']}")
                results.append({"test_id": tc["test_id"], "status": "FAIL", "reason": "Expected error not raised"})
            else:
                print(f"[SUCCESS] Prediction: {res['prediction_label'].upper()}")
                print(f"          Decision Score: {res['decision_score']}")
                print(f"          Normalized Score: {res['normalized_anomaly_score']}")
                print(f"          Severity: {res['severity']}")
                if res["warnings"]:
                    print(f"          Warnings: {res['warnings']}")
                results.append({
                    "test_id": tc["test_id"],
                    "status": "PASS",
                    "prediction_label": res["prediction_label"],
                    "decision_score": res["decision_score"],
                    "normalized_anomaly_score": res["normalized_anomaly_score"],
                    "severity": res["severity"],
                    "warnings": res["warnings"],
                })
        except PhysiologicalValidationError as ve:
            if tc["expect_error"]:
                print(f"[SUCCESS] Caught expected validation error: {str(ve)}")
                results.append({"test_id": tc["test_id"], "status": "PASS", "caught_error": str(ve)})
            else:
                print(f"[FAIL] Unexpected validation error: {str(ve)}")
                results.append({"test_id": tc["test_id"], "status": "FAIL", "error": str(ve)})

    print("\n" + "=" * 80)
    print("ALL PREDICTION TESTS COMPLETED")
    print("=" * 80)
    return results


if __name__ == "__main__":
    run_prediction_tests()
