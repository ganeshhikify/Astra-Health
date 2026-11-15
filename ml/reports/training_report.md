# ASTRA HEALTH — ML Quality Audit & Model Verification Report

**Project:** ASTRA HEALTH Astronaut Health Monitoring Application
**Component:** AI Anomaly Detection Engine (Stage 1 & Stage 2 Quality Audit)
**Model Architecture:** Scikit-learn Isolation Forest (Unsupervised)
**Dataset:** PhysioNet Pulse Transit Time PPG Dataset v1.1.0 (ODbL v1.0)
**Audit Date:** 2026-11-15

---

## 1. Dataset Consistency & Observation Sourcing

### Downloaded Raw Files
The minimal useful subset downloaded programmatically from PhysioNet comprises:
1. `subjects_info.csv` (4,179 bytes) — Contains structured clinical checkpoints for all 22 subjects across 66 activity sessions.
2. `README.txt` (12,258 bytes) — Hardware documentation, sensor specifications, and licensing terms.
3. `s1_sit.csv` (41,710,344 bytes) — Continuous 500 Hz ECG, PPG, and accelerometer time series during resting baseline.
4. `s1_run.csv` (40,488,208 bytes) — Continuous 500 Hz time series during exercise.
- **Total Download Size:** **82,215,089 bytes (~82.2 MB)**.

### Origin of the 132 Processed Observations
All 132 observations in `ml/datasets/processed_physiological_features.csv` originate directly from `subjects_info.csv`:
- **22 unique human participants** (`s1` through `s22`).
- **3 recorded activities per subject** (`sit`, `walk`, `run`) = **66 recording sessions**.
- **2 clinical checkpoints per session:**
  - `start`: Initial vitals recorded via OMRON HEM-7322 and iHealth Air Wireless Pulse Oximeter.
  - `end`: Post-activity vitals recorded via the same dual clinical instruments.
- **Total:** $66 \text{ sessions} \times 2 \text{ checkpoints} = \mathbf{132 \text{ valid physiological observations}}$.
- **Verification:** Every observation in `processed_physiological_features.csv` corresponds 1-to-1 with rows in the official PhysioNet `subjects_info.csv`.

---

## 2. Participant Partitioning & Leakage Investigation

### Partitioning Strategy
To prevent data leakage, dataset splitting was performed at the **participant level**, not at the observation level:
- **Training Participant Cohort:** Subjects `s1` through `s16` (16 subjects).
  - Activity used for training: Strictly normative resting baseline (`sit` activity).
  - Total Training Samples: $16 \text{ subjects} \times 1 \text{ activity} \times 2 \text{ checkpoints} = \mathbf{32 \text{ observations}}$.
- **Independent Holdout Cohort:** Subjects `s17` through `s22` (6 subjects).
  - Activities evaluated: All three modalities (`sit`, `walk`, `run`).
  - Total Holdout Samples: $6 \text{ subjects} \times 3 \text{ activities} \times 2 \text{ checkpoints} = \mathbf{36 \text{ observations}}$.
- **Subject Overlap:** $\text{Subjects}(\text{Train}) \cap \text{Subjects}(\text{Holdout}) = \emptyset$ (Zero participant leakage in independent evaluation).

### Investigation of Subject `s2` in TEST-2A
- **Finding:** Subject `s2` belongs to the training participant group (`s1` to `s16`). While `s2`'s resting `sit` record was included in training, using `s2`'s exercise `run` record in testing represents an in-cohort stress observation, not an independent holdout test.
- **Holdout Set Characteristics:** In the independent holdout cohort (`s17` to `s22`), all 36 observations represent healthy volunteers with vitals within nominal physiological bounds ($HR \in [71, 94]$ BPM, $SBP \in [98, 129]$ mmHg). Consequently, no holdout observation triggers an anomaly.
- **Correction Made:**
  - **Independent Holdout Test (`TEST-2A`):** Uses Subject `s17` post-exercise (`run` end: HR 83.0 BPM, SBP 116.0 mmHg, DBP 62.0 mmHg). Correctly evaluated as a nominal inlier (Score: `+0.0250`).
  - **Exploratory Training-Cohort Stress Test (`TEST-2B`):** Retained Subject `s2` (`run` end: HR 118.5 BPM, SBP 160.0 mmHg) but explicitly relabeled as an *exploratory in-cohort exertion stress test* demonstrating model sensitivity to strenuous vitals, clearly separated from independent holdout validation.

---

## 3. Mathematical Interpretation of Prediction Scores & Severity

### Normalized Anomaly Score Formula
In `predictor.py`, the score is calculated as:
$$\text{normalized\_anomaly\_score} = \text{clip}\left(0.5 - (\text{decision\_score} \times 2.5), 0.0, 1.0\right)$$

- **Statistical Definition:** In scikit-learn's `IsolationForest`, `decision_function` returns $s(x, n) = 2^{-\frac{E(h(x))}{c(n)}} - \text{offset\_}$.
  - Positive scores indicate inliers (normal baseline).
  - Negative scores indicate outliers (anomalies).
- **Affine Rescaling (NOT a Probability):** The formula applies a piecewise-linear affine rescaling centered at the decision threshold ($0.0 \to 0.50$). It maps typical baseline scores ($+0.20 \to 0.0$) and outlier scores ($-0.20 \to 1.0$).
- **CRITICAL ADVISORY:** The normalized score is **NOT a Bayesian posterior probability** $P(\text{disease}|x)$, nor is it calibrated to clinical morbidity risk. It is solely an operational metric representing tree isolation path length.

### Categorical Severity Assignment
Categorical severity is assigned based strictly on empirical decision score boundaries:
- `decision_score >= 0.0`: `"nominal"` (vitals align with resting normative envelope)
- `-0.05 <= decision_score < 0.0`: `"moderate_deviation"` (mild to moderate multivariable departure)
- `decision_score < -0.05`: `"significant_deviation"` (pronounced statistical departure from training distribution)

**Medical Safeguard:** Categorical severity indicates **depth of distributional outlier isolation**, NOT a medical diagnostic severity or triage acuity.

---

## 4. Final Quality Audit Verification & Automated Test Results

The ML automated test suite ([ml/tests/test_prediction_service.py](file:///C:/projects/astra/ml/tests/test_prediction_service.py)) was executed:
- **Total Test Cases:** 28 automated tests.
- **Pass Rate:** **28 / 28 Passed (100%)**.
- **Execution Time:** ~3.72 seconds.
- **Integrity Checks Confirmed:**
  - Saved model weights and scaler reload without error.
  - Biological safety boundaries reject implausible vitals (e.g. negative HR, $SBP \le DBP$).
  - Missing and null features are strictly rejected (zero measurement fabrication).
  - Structured output schema consistently produces operational metadata and disclaimers.

---

## 5. Deployment Readiness

The ML prediction engine is **verified, robustly tested, and ready for future FastAPI integration**. It remains fully decoupled, self-contained within `ml/`, and complies with all medical safety and project protection rules.
