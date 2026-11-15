"""
ASTRA HEALTH - Physiological Feature Extraction Pipeline
Extracts clean numerical features from the PhysioNet Pulse Transit Time PPG Dataset v1.1.0.
"""

from pathlib import Path
import numpy as np
import pandas as pd

DATASETS_DIR = Path(__file__).resolve().parent.parent / "datasets"


def extract_clinical_vitals() -> pd.DataFrame:
    """
    Extracts structured physiological vital sign checkpoints from subjects_info.csv.
    Each recording has start and end measurements for Heart Rate, SpO2, and Blood Pressure.
    """
    info_path = DATASETS_DIR / "subjects_info.csv"
    if not info_path.exists():
        raise FileNotFoundError(f"Missing {info_path}. Run download_dataset.py first.")

    raw_df = pd.read_csv(info_path)
    records = []

    for _, row in raw_df.iterrows():
        record_name = str(row["record"]).strip()
        subject_id = record_name.split("_")[0]
        activity = str(row["activity"]).strip().lower()

        # Checkpoint 1: Start of activity
        # Average of OMRON and iHealth pulse oximeter for heart rate
        hr_start = float(row["hr_1_start"] + row["hr_2_start"]) / 2.0
        bp_sys_start = float(row["bp_sys_start"])
        bp_dia_start = float(row["bp_dia_start"])
        spo2_start = float(row["spo2_start"])
        pp_start = bp_sys_start - bp_dia_start
        map_start = bp_dia_start + (pp_start / 3.0)

        records.append({
            "subject_id": subject_id,
            "record": record_name,
            "activity": activity,
            "checkpoint": "start",
            "heart_rate_bpm": round(hr_start, 2),
            "spo2_pct": round(spo2_start, 2),
            "systolic_bp_mmhg": round(bp_sys_start, 2),
            "diastolic_bp_mmhg": round(bp_dia_start, 2),
            "pulse_pressure_mmhg": round(pp_start, 2),
            "map_mmhg": round(map_start, 2),
            "age_years": int(row["age"]),
            "height_cm": float(row["height"]),
            "weight_kg": float(row["weight"]),
            "gender": str(row["gender"]).strip(),
        })

        # Checkpoint 2: End of activity
        hr_end = float(row["hr_1_end"] + row["hr_2_end"]) / 2.0
        bp_sys_end = float(row["bp_sys_end"])
        bp_dia_end = float(row["bp_dia_end"])
        spo2_end = float(row["spo2_end"])
        pp_end = bp_sys_end - bp_dia_end
        map_end = bp_dia_end + (pp_end / 3.0)

        records.append({
            "subject_id": subject_id,
            "record": record_name,
            "activity": activity,
            "checkpoint": "end",
            "heart_rate_bpm": round(hr_end, 2),
            "spo2_pct": round(spo2_end, 2),
            "systolic_bp_mmhg": round(bp_sys_end, 2),
            "diastolic_bp_mmhg": round(bp_dia_end, 2),
            "pulse_pressure_mmhg": round(pp_end, 2),
            "map_mmhg": round(map_end, 2),
            "age_years": int(row["age"]),
            "height_cm": float(row["height"]),
            "weight_kg": float(row["weight"]),
            "gender": str(row["gender"]).strip(),
        })

    df = pd.DataFrame(records)

    # Data validation & cleaning
    # Physiological validity bounds (sanity checks, not clinical diagnostic criteria)
    valid_mask = (
        (df["heart_rate_bpm"] >= 30.0) & (df["heart_rate_bpm"] <= 240.0) &
        (df["spo2_pct"] >= 70.0) & (df["spo2_pct"] <= 100.0) &
        (df["systolic_bp_mmhg"] >= 60.0) & (df["systolic_bp_mmhg"] <= 240.0) &
        (df["diastolic_bp_mmhg"] >= 40.0) & (df["diastolic_bp_mmhg"] <= 140.0) &
        (df["pulse_pressure_mmhg"] > 0)
    )

    clean_df = df[valid_mask].copy().reset_index(drop=True)
    out_csv = DATASETS_DIR / "processed_physiological_features.csv"
    clean_df.to_csv(out_csv, index=False)
    print(f"[SUCCESS] Extracted {len(clean_df)} clinical observations across {clean_df['subject_id'].nunique()} subjects.")
    print(f"          Saved to: {out_csv}")
    return clean_df


def extract_windowed_waveform_features(csv_filename: str, activity_label: str) -> pd.DataFrame:
    """
    Extracts 30-second windowed physiological features from raw 500 Hz ECG and PPG waveforms.
    Computes RR intervals from annotated ECG peaks and pulsatile signal characteristics.
    """
    file_path = DATASETS_DIR / csv_filename
    if not file_path.exists():
        print(f"[SKIP] Waveform file {csv_filename} not found.")
        return pd.DataFrame()

    print(f"[PROCESSING] {csv_filename} (500 Hz time-series)...")
    df = pd.read_csv(file_path)

    # 500 Hz sampling -> 500 samples/sec -> 30 sec window = 15,000 samples
    fs = 500
    window_samples = 30 * fs
    step_samples = 15 * fs  # 50% overlap

    windows = []
    n_samples = len(df)

    for start_idx in range(0, n_samples - window_samples + 1, step_samples):
        end_idx = start_idx + window_samples
        w_df = df.iloc[start_idx:end_idx]

        # Extract ECG R-peaks in window
        peak_indices = np.where(w_df["peaks"].values == 1)[0]
        if len(peak_indices) < 5:
            continue  # Insufficient beats for reliable HRV

        # RR intervals in ms (2ms per sample at 500Hz)
        rr_ms = np.diff(peak_indices) * 2.0
        valid_rr = rr_ms[(rr_ms >= 300) & (rr_ms <= 1500)]
        if len(valid_rr) < 4:
            continue

        hr_bpm = 60000.0 / valid_rr
        sdnn_ms = float(np.std(valid_rr))
        rmssd_ms = float(np.sqrt(np.mean(np.square(np.diff(valid_rr))))) if len(valid_rr) > 1 else 0.0

        # PPG characteristics (pleth_1 = red, pleth_2 = infrared)
        p1 = w_df["pleth_1"].values
        p2 = w_df["pleth_2"].values

        # IMU Motion magnitude: sqrt(ax^2 + ay^2 + az^2)
        ax = w_df["a_x"].values
        ay = w_df["a_y"].values
        az = w_df["a_z"].values
        acc_mag = np.sqrt(ax**2 + ay**2 + az**2)

        windows.append({
            "source_file": csv_filename,
            "activity": activity_label,
            "window_start_sec": round(start_idx / fs, 2),
            "window_end_sec": round(end_idx / fs, 2),
            "heart_rate_mean_bpm": round(float(np.mean(hr_bpm)), 2),
            "heart_rate_std_bpm": round(float(np.std(hr_bpm)), 2),
            "rr_mean_ms": round(float(np.mean(valid_rr)), 2),
            "sdnn_ms": round(sdnn_ms, 2),
            "rmssd_ms": round(rmssd_ms, 2),
            "ppg_red_mean": round(float(np.mean(p1)), 2),
            "ppg_red_std": round(float(np.std(p1)), 2),
            "ppg_ir_mean": round(float(np.mean(p2)), 2),
            "ppg_ir_std": round(float(np.std(p2)), 2),
            "motion_magnitude_mean_g": round(float(np.mean(acc_mag)), 3),
            "motion_magnitude_std_g": round(float(np.std(acc_mag)), 3),
        })

    window_df = pd.DataFrame(windows)
    out_csv = DATASETS_DIR / f"windowed_{Path(csv_filename).stem}.csv"
    window_df.to_csv(out_csv, index=False)
    print(f"[SUCCESS] Extracted {len(window_df)} 30-second windows from {csv_filename} -> {out_csv}")
    return window_df


def main():
    print("=" * 70)
    print("ASTRA HEALTH - Physiological Feature Extraction")
    print("=" * 70)

    # 1. Extract clinical vitals (22 subjects, 66 sessions, 132 observations)
    df_clinical = extract_clinical_vitals()
    print("\nSummary Statistics of Extracted Clinical Features:")
    feature_cols = ["heart_rate_bpm", "spo2_pct", "systolic_bp_mmhg", "diastolic_bp_mmhg", "pulse_pressure_mmhg", "map_mmhg"]
    print(df_clinical[feature_cols].describe().round(2))

    # 2. Extract windowed waveform features from sitting and running waveforms
    df_w_sit = extract_windowed_waveform_features("s1_sit.csv", "sit")
    df_w_run = extract_windowed_waveform_features("s1_run.csv", "run")

    print("\n" + "=" * 70)
    print("Feature Extraction Complete.")
    print("=" * 70)


if __name__ == "__main__":
    main()
