"""
ASTRA HEALTH - Isolation Forest Anomaly Detection Model Training
Trains an unsupervised Isolation Forest on normative resting baseline physiology.
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

BASE_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = BASE_DIR / "datasets"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
REPORTS_DIR = BASE_DIR / "reports"

# Reproducibility seed
RANDOM_SEED = 42

# Selected physiological features (genuinely available in PhysioNet dataset)
FEATURE_COLUMNS = [
    "heart_rate_bpm",
    "spo2_pct",
    "systolic_bp_mmhg",
    "diastolic_bp_mmhg",
    "pulse_pressure_mmhg",
    "map_mmhg",
]

FEATURE_DESCRIPTIONS = {
    "heart_rate_bpm": {
        "unit": "BPM",
        "description": "Heart rate in beats per minute, measured with clinical oximeter and pressure cuff",
        "physiological_range": "30 - 220 BPM",
    },
    "spo2_pct": {
        "unit": "%",
        "description": "Blood oxygen saturation percentage measured via pulse oximetry",
        "physiological_range": "70 - 100 %",
    },
    "systolic_bp_mmhg": {
        "unit": "mmHg",
        "description": "Systolic arterial blood pressure",
        "physiological_range": "60 - 240 mmHg",
    },
    "diastolic_bp_mmhg": {
        "unit": "mmHg",
        "description": "Diastolic arterial blood pressure",
        "physiological_range": "40 - 140 mmHg",
    },
    "pulse_pressure_mmhg": {
        "unit": "mmHg",
        "description": "Systolic BP minus Diastolic BP, reflecting vascular compliance and stroke volume",
        "physiological_range": "20 - 100 mmHg",
    },
    "map_mmhg": {
        "unit": "mmHg",
        "description": "Mean Arterial Pressure (Diastolic + 1/3 Pulse Pressure), organ perfusion indicator",
        "physiological_range": "60 - 130 mmHg",
    },
}


def load_and_split_data():
    """
    Loads extracted physiological features and performs a participant-stratified split.
    Prevents data leakage: Test subjects never appear in the training partition.
    """
    csv_path = DATASETS_DIR / "processed_physiological_features.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Missing {csv_path}. Run extract_features.py first.")

    df = pd.read_csv(csv_path)

    # All unique subjects
    all_subjects = sorted(df["subject_id"].unique(), key=lambda s: int(s.replace("s", "")))
    n_subjects = len(all_subjects)

    # Participant split: 16 training subjects (~73%), 6 test subjects (~27%)
    split_idx = 16
    train_subjects = all_subjects[:split_idx]
    test_subjects = all_subjects[split_idx:]

    print(f"Total Subjects: {n_subjects}")
    print(f"Training Subjects ({len(train_subjects)}): {train_subjects}")
    print(f"Holdout Test Subjects ({len(test_subjects)}): {test_subjects}")

    # Training Data: Strictly normative resting baseline ('sit' activity)
    # The anomaly detection model learns the boundary of resting physiological stability
    train_mask = (df["subject_id"].isin(train_subjects)) & (df["activity"] == "sit")
    train_df = df[train_mask].copy().reset_index(drop=True)

    # Test Data: Holdout subjects across all activities (sit, walk, run)
    test_mask = df["subject_id"].isin(test_subjects)
    test_df = df[test_mask].copy().reset_index(drop=True)

    print(f"Training Samples (Resting Baseline): {len(train_df)}")
    print(f"Test Samples (Multimodal: sit, walk, run): {len(test_df)}")

    return train_df, test_df, train_subjects, test_subjects


def train_model():
    """
    Fits StandardScaler and Isolation Forest anomaly detector on resting baseline physiology.
    """
    SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("ASTRA HEALTH - Isolation Forest Model Training")
    print("=" * 70)

    train_df, test_df, train_subjects, test_subjects = load_and_split_data()

    X_train_raw = train_df[FEATURE_COLUMNS].values

    # Preprocessing: StandardScaler fitted strictly on training baseline
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_raw)

    # Compute baseline reference distribution parameters
    baseline_stats = {}
    for i, col in enumerate(FEATURE_COLUMNS):
        baseline_stats[col] = {
            "mean": float(round(scaler.mean_[i], 3)),
            "std": float(round(scaler.scale_[i], 3)),
            "min_observed": float(round(train_df[col].min(), 3)),
            "max_observed": float(round(train_df[col].max(), 3)),
            "median_observed": float(round(train_df[col].median(), 3)),
        }

    # Model Hyperparameters
    model_params = {
        "n_estimators": 100,
        "max_samples": "auto",
        "contamination": 0.05,  # Estimated 5% noise/outlier threshold in normal baseline
        "random_state": RANDOM_SEED,
        "bootstrap": False,
        "n_jobs": -1,
    }

    print("\nTraining Isolation Forest...")
    print(f"Hyperparameters: {model_params}")

    model = IsolationForest(**model_params)
    model.fit(X_train_scaled)

    # Evaluate internal training baseline fit
    train_preds = model.predict(X_train_scaled)  # 1 = inlier, -1 = outlier
    train_scores = model.decision_function(X_train_scaled)  # higher = more normal
    n_inliers = int(np.sum(train_preds == 1))
    n_outliers = int(np.sum(train_preds == -1))
    print(f"Baseline Inliers: {n_inliers} ({n_inliers/len(train_preds)*100:.1f}%)")
    print(f"Baseline Flagged Outliers: {n_outliers} ({n_outliers/len(train_preds)*100:.1f}%)")

    # Save artifacts
    model_path = SAVED_MODELS_DIR / "isolation_forest_model.joblib"
    scaler_path = SAVED_MODELS_DIR / "preprocessor_scaler.joblib"
    config_path = SAVED_MODELS_DIR / "feature_config.json"

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    config_data = {
        "model_type": "IsolationForest",
        "framework": "scikit-learn",
        "version": "1.1.0-research-prototype",
        "dataset": "PhysioNet Pulse Transit Time PPG Dataset v1.1.0 (ODbL v1.0)",
        "features": FEATURE_COLUMNS,
        "feature_descriptions": FEATURE_DESCRIPTIONS,
        "baseline_statistics": baseline_stats,
        "hyperparameters": {
            "n_estimators": model_params["n_estimators"],
            "contamination": model_params["contamination"],
            "random_state": model_params["random_state"],
            "bootstrap": model_params["bootstrap"],
        },
        "training_metadata": {
            "training_samples_count": len(train_df),
            "training_activity_state": "sit (normative resting baseline)",
            "training_subjects": train_subjects,
            "holdout_subjects": test_subjects,
            "temperature_included": False,
            "temperature_note": "Sensor package surface temperatures omitted; core body temperature was not collected in dataset.",
        },
    }

    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config_data, f, indent=2)

    print("\n" + "=" * 70)
    print("Model Training & Serialization Successful!")
    print(f" - Model Artifact:        {model_path}")
    print(f" - Preprocessor Artifact:  {scaler_path}")
    print(f" - Feature Configuration:  {config_path}")
    print("=" * 70)

    # Save test partition for evaluation script
    test_df.to_csv(DATASETS_DIR / "holdout_test_set.csv", index=False)

    return model, scaler, config_data


if __name__ == "__main__":
    train_model()
