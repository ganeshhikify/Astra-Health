"""
ASTRA HEALTH - Isolation Forest Model Evaluation
Evaluates the trained anomaly detection model on unseen holdout subjects and stress scenarios.
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = BASE_DIR / "datasets"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
REPORTS_DIR = BASE_DIR / "reports"


def evaluate():
    model_path = SAVED_MODELS_DIR / "isolation_forest_model.joblib"
    scaler_path = SAVED_MODELS_DIR / "preprocessor_scaler.joblib"
    config_path = SAVED_MODELS_DIR / "feature_config.json"
    test_path = DATASETS_DIR / "holdout_test_set.csv"

    if not model_path.exists() or not scaler_path.exists():
        raise FileNotFoundError("Trained model or scaler not found. Run train_isolation_forest.py first.")

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    feature_cols = config["features"]
    print("=" * 70)
    print("ASTRA HEALTH - Isolation Forest Model Evaluation")
    print(f"Features: {feature_cols}")
    print("=" * 70)

    # 1. Evaluate on Unseen Holdout Test Subjects (s17 to s22)
    test_df = pd.read_csv(test_path)
    X_test_raw = test_df[feature_cols].values
    X_test_scaled = scaler.transform(X_test_raw)

    test_preds = model.predict(X_test_scaled)  # 1 = inlier (nominal), -1 = outlier (anomaly)
    test_scores = model.decision_function(X_test_scaled)  # lower = more abnormal

    test_df["predicted_label"] = np.where(test_preds == 1, "Inlier (Nominal)", "Outlier (Anomaly)")
    test_df["anomaly_score"] = np.round(test_scores, 4)

    print("\nHoldout Test Subjects Evaluation Summary by Activity:")
    activity_summary = {}
    for act, grp in test_df.groupby("activity"):
        n_total = len(grp)
        n_inlier = int(np.sum(grp["predicted_label"] == "Inlier (Nominal)"))
        n_outlier = int(np.sum(grp["predicted_label"] == "Outlier (Anomaly)"))
        mean_score = float(grp["anomaly_score"].mean())
        activity_summary[act] = {
            "total_observations": n_total,
            "inliers_count": n_inlier,
            "inliers_pct": round(n_inlier / n_total * 100, 1),
            "outliers_count": n_outlier,
            "outliers_pct": round(n_outlier / n_total * 100, 1),
            "mean_decision_score": round(mean_score, 4),
        }
        print(f"  Activity: {act:<5} | Total: {n_total:2d} | Inliers: {n_inlier:2d} ({n_inlier/n_total*100:5.1f}%) | "
              f"Outliers: {n_outlier:2d} ({n_outlier/n_total*100:5.1f}%) | Mean Score: {mean_score:+.4f}")

    # 2. Evaluate on Multivariable Physiological Stress Scenarios
    # Verifies that acute departures from normal resting physiological envelope are reliably flagged as anomalies (-1)
    stress_scenarios = [
        {
            "name": "Normative Rest Baseline",
            "heart_rate_bpm": 70.0,
            "spo2_pct": 98.0,
            "systolic_bp_mmhg": 115.0,
            "diastolic_bp_mmhg": 75.0,
            "pulse_pressure_mmhg": 40.0,
            "map_mmhg": 88.3,
            "expected": "Inlier",
        },
        {
            "name": "Acute Hypoxia with Tachycardia",
            "heart_rate_bpm": 120.0,
            "spo2_pct": 82.0,  # Acute desaturation with compensatory heart rate surge
            "systolic_bp_mmhg": 130.0,
            "diastolic_bp_mmhg": 85.0,
            "pulse_pressure_mmhg": 45.0,
            "map_mmhg": 100.0,
            "expected": "Anomaly",
        },
        {
            "name": "Extreme Resting Tachycardia",
            "heart_rate_bpm": 185.0,  # Extreme resting elevation
            "spo2_pct": 97.0,
            "systolic_bp_mmhg": 150.0,
            "diastolic_bp_mmhg": 95.0,
            "pulse_pressure_mmhg": 55.0,
            "map_mmhg": 113.3,
            "expected": "Anomaly",
        },
        {
            "name": "Hypertensive Crisis",
            "heart_rate_bpm": 85.0,
            "spo2_pct": 97.0,
            "systolic_bp_mmhg": 210.0,  # Acute systolic surge
            "diastolic_bp_mmhg": 125.0,
            "pulse_pressure_mmhg": 85.0,
            "map_mmhg": 153.3,
            "expected": "Anomaly",
        },
        {
            "name": "Severe Bradycardia + Hypotension",
            "heart_rate_bpm": 38.0,   # Profoundly low heart rate
            "spo2_pct": 94.0,
            "systolic_bp_mmhg": 75.0,   # Low perfusion pressure
            "diastolic_bp_mmhg": 45.0,
            "pulse_pressure_mmhg": 30.0,
            "map_mmhg": 55.0,
            "expected": "Anomaly",
        },
    ]

    print("\nPhysiological Boundary Verification (Known Stress Scenarios):")
    scenario_results = []
    for sc in stress_scenarios:
        vec = np.array([[sc[f] for f in feature_cols]])
        vec_scaled = scaler.transform(vec)
        pred = int(model.predict(vec_scaled)[0])
        score = float(model.decision_function(vec_scaled)[0])
        label = "Inlier (Nominal)" if pred == 1 else "Outlier (Anomaly)"
        passed = bool((pred == 1 and sc["expected"] == "Inlier") or (pred == -1 and sc["expected"] == "Anomaly"))
        scenario_results.append({
            "scenario": sc["name"],
            "expected": sc["expected"],
            "predicted": label,
            "decision_score": round(score, 4),
            "verified": passed,
        })
        status_sym = "[PASS]" if passed else "[FAIL]"
        print(f"  {status_sym} {sc['name']:<32} -> Predicted: {label:<17} | Score: {score:+.4f}")

    eval_report = {
        "model_file": str(model_path.name),
        "holdout_test_summary": activity_summary,
        "boundary_scenario_tests": scenario_results,
        "evaluation_notes": (
            "Model is an unsupervised Isolation Forest trained on resting baseline physiology. "
            "No ground-truth disease labels exist in the PhysioNet dataset; clinical diagnostic "
            "metrics (accuracy, sensitivity, specificity) cannot be claimed without external gold-standard clinical cohorts."
        ),
    }

    out_file = REPORTS_DIR / "evaluation_summary.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(eval_report, f, indent=2)

    print("\n" + "=" * 70)
    print(f"Evaluation report saved to: {out_file}")
    print("=" * 70)


if __name__ == "__main__":
    evaluate()
