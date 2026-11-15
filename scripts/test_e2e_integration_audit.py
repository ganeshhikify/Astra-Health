"""
ASTRA HEALTH - Comprehensive Integration & E2E Testing Script
Covers Phase 1 to Phase 4 audits:
- Workflows A through H
- Validates database persistence and isolation
- Validates AI inference and 6-feature pipeline
- Cleans up strictly the created test records
"""

import sys
import json
import time
import uuid
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api_request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            return status, json.loads(content) if content else None
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_content)
        except Exception:
            return e.code, {"raw": err_content}
    except Exception as exc:
        return 0, {"error": str(exc)}

def main():
    results = {}
    print("=" * 70)
    print("ASTRA HEALTH COMPREHENSIVE E2E & INTEGRATION AUDIT")
    print("=" * 70)

    # -------------------------------------------------------------
    # 0. Health Diagnostics
    # -------------------------------------------------------------
    status, res = api_request("GET", "/health")
    print(f"Health Check: HTTP {status} -> {res.get('status')}, DB: {res.get('database')}")
    results["health_check"] = "PASS" if status == 200 and res.get("status") == "healthy" else "FAIL"

    # -------------------------------------------------------------
    # Workflow A: Astronaut Profile and Mission Setup
    # -------------------------------------------------------------
    print("\n--- Workflow A: Astronaut Profile & Mission Setup ---")
    test_crew_id = f"TEST-{uuid.uuid4().hex[:6].upper()}"
    test_mission_code = f"MSN-{uuid.uuid4().hex[:6].upper()}"

    # 1. Create Mission
    mission_payload = {
        "name": "Audit Test Expedition Alpha",
        "code": test_mission_code,
        "destination": "Mars Orbit",
        "launch_date": "2028-06-01T00:00:00Z",
        "commander": "Commander Test Runner",
        "crew_count": 4,
        "status": "planned"
    }
    status, m_res = api_request("POST", "/missions/", mission_payload)
    print(f"1. Create Mission: HTTP {status}")
    mission_id = m_res.get("id") if status == 201 else None

    # 2. Create Astronaut
    astro_payload = {
        "name": "Dr. Test Pilot Operative",
        "crew_id": test_crew_id,
        "age": 36,
        "sex": "Female",
        "role": "Mission Specialist (Biomedical)",
        "assigned_mission_id": mission_id,
        "baseline_vitals": {
            "resting_heart_rate": 65,
            "resting_spo2": 99,
            "resting_blood_pressure": "115/75"
        }
    }
    status, a_res = api_request("POST", "/astronauts/", astro_payload)
    print(f"2. Create Astronaut Profile: HTTP {status}")
    astronaut_id = a_res.get("id") if status == 201 else None

    # 3. Retrieve Astronaut
    status, a_get = api_request("GET", f"/astronauts/{astronaut_id}")
    print(f"3. Retrieve Astronaut Profile: HTTP {status} (Name: {a_get.get('name') if a_get else 'N/A'})")

    # 4. Retrieve Mission
    status, m_get = api_request("GET", f"/missions/{mission_id}")
    print(f"4. Retrieve Mission: HTTP {status} (Code: {m_get.get('code') if m_get else 'N/A'})")

    wf_a_pass = astronaut_id is not None and mission_id is not None and a_get.get("crew_id") == test_crew_id
    results["workflow_a"] = "PASS" if wf_a_pass else "FAIL"

    # -------------------------------------------------------------
    # Workflow B: Manual Health Entry
    # -------------------------------------------------------------
    print("\n--- Workflow B: Manual Health Entry ---")
    meas_payload = {
        "astronaut_id": astronaut_id,
        "measured_at": "2026-11-15T12:00:00Z",
        "heart_rate_bpm": 74.0,
        "blood_oxygen_pct": 98.0,
        "body_temperature_celsius": 36.8,
        "systolic_bp_mmhg": 118.0,
        "diastolic_bp_mmhg": 76.0,
        "source": "manual_entry",
        "is_simulated": False
    }
    status, meas_res = api_request("POST", "/measurements/", meas_payload)
    print(f"1. Save Manual Measurement: HTTP {status}")
    meas_id = meas_res.get("id") if status == 201 else None

    # Retrieve telemetry
    status, t_history = api_request("GET", f"/measurements/astronaut/{astronaut_id}")
    print(f"2. Get Astronaut Telemetry: HTTP {status}, Total records: {len(t_history) if isinstance(t_history, list) else 0}")

    wf_b_pass = status == 200 and len(t_history) >= 1 and t_history[0].get("heart_rate_bpm") == 74.0
    results["workflow_b"] = "PASS" if wf_b_pass else "FAIL"

    # -------------------------------------------------------------
    # Workflow C: Batch Telemetry (CSV Report Upload Simulation)
    # -------------------------------------------------------------
    print("\n--- Workflow C: Batch Telemetry (CSV Upload Simulation) ---")
    batch_payload = [
        {
            "astronaut_id": astronaut_id,
            "measured_at": f"2026-11-15T12:0{i}:00Z",
            "heart_rate_bpm": 72.0 + i,
            "blood_oxygen_pct": 98.5,
            "body_temperature_celsius": 36.7,
            "systolic_bp_mmhg": 116.0 + i,
            "diastolic_bp_mmhg": 74.0,
            "source": "csv_import",
            "is_simulated": False
        }
        for i in range(1, 4)
    ]
    status, batch_res = api_request("POST", "/measurements/batch", batch_payload)
    print(f"1. Batch Save Measurements: HTTP {status}, Count: {len(batch_res) if isinstance(batch_res, list) else 0}")
    wf_c_pass = status == 201 and len(batch_res) == 3
    results["workflow_c"] = "PASS" if wf_c_pass else "FAIL"

    # -------------------------------------------------------------
    # Workflow D: PDF Report Upload Data Extraction Simulation
    # -------------------------------------------------------------
    print("\n--- Workflow D: PDF Report Upload Telemetry Extraction ---")
    pdf_extracted_payload = {
        "astronaut_id": astronaut_id,
        "measured_at": "2026-11-15T12:15:00Z",
        "heart_rate_bpm": 71.0,
        "blood_oxygen_pct": 99.0,
        "body_temperature_celsius": 36.6,
        "systolic_bp_mmhg": 115.0,
        "diastolic_bp_mmhg": 75.0,
        "source": "pdf_report_import",
        "is_simulated": False,
        "raw_payload": {"extracted_from": "NASA_JSC_FlightSurgeon_Report_Demo.pdf"}
    }
    status, pdf_meas_res = api_request("POST", "/measurements/", pdf_extracted_payload)
    print(f"1. Save PDF-Extracted Telemetry: HTTP {status}")
    wf_d_pass = status == 201 and pdf_meas_res.get("source") == "pdf_report_import"
    results["workflow_d"] = "PASS" if wf_d_pass else "FAIL"

    # -------------------------------------------------------------
    # Workflow E: AI Analysis (/insights/analyze)
    # -------------------------------------------------------------
    print("\n--- Workflow E: AI Anomaly Predictor Inference ---")
    # 1. Nominal vital signs
    ai_nominal_payload = {
        "heart_rate_bpm": 72.0,
        "spo2_pct": 98.0,
        "systolic_bp_mmhg": 118.0,
        "diastolic_bp_mmhg": 76.0
    }
    status, ai_nominal_res = api_request("POST", "/insights/analyze", ai_nominal_payload)
    print(f"1. Nominal vitals inference: HTTP {status}")
    print(f"   is_anomaly: {ai_nominal_res.get('is_anomaly')}, severity: {ai_nominal_res.get('severity')}")
    print(f"   derived: PP={ai_nominal_res.get('derived_features', {}).get('pulse_pressure_mmhg')}, MAP={ai_nominal_res.get('derived_features', {}).get('map_mmhg')}")

    # 2. Extreme anomalous vital signs
    ai_anomaly_payload = {
        "heart_rate_bpm": 185.0,
        "spo2_pct": 76.0,
        "systolic_bp_mmhg": 200.0,
        "diastolic_bp_mmhg": 125.0
    }
    status_anom, ai_anom_res = api_request("POST", "/insights/analyze", ai_anomaly_payload)
    print(f"2. Extreme vitals inference: HTTP {status_anom}")
    print(f"   is_anomaly: {ai_anom_res.get('is_anomaly')}, severity: {ai_anom_res.get('severity')}")
    print(f"   norm score: {ai_anom_res.get('normalized_anomaly_score')}, decision score: {ai_anom_res.get('decision_score')}")

    wf_e_pass = (
        status == 200 and not ai_nominal_res.get("is_anomaly") and
        status_anom == 200 and ai_anom_res.get("is_anomaly") and
        ai_nominal_res.get("derived_features", {}).get("pulse_pressure_mmhg") == 42.0
    )
    results["workflow_e"] = "PASS" if wf_e_pass else "FAIL"

    # -------------------------------------------------------------
    # Workflow F: Dashboard and Analytics
    # -------------------------------------------------------------
    print("\n--- Workflow F: Dashboard & Research Analytics Query ---")
    status_summ, res_summ = api_request("GET", "/research/summary")
    status_osd, res_osd = api_request("GET", "/research/osd-575/analytics")
    status_bidmc, res_bidmc = api_request("GET", "/research/bidmc/analytics")
    status_fitbit, res_fitbit = api_request("GET", "/research/fitbit/analytics")
    status_aging, res_aging = api_request("GET", "/research/autonomic-aging/analytics")

    print(f"Research Summary: HTTP {status_summ}, Total Subjects: {res_summ.get('total_research_subjects')}")
    print(f"OSD-575 Analytics: HTTP {status_osd}, Astronauts: {res_osd.get('subjects')}")
    print(f"BIDMC Analytics: HTTP {status_bidmc}, Subjects: {res_bidmc.get('total_subjects')}")
    print(f"Fitbit Analytics: HTTP {status_fitbit}, Population: {res_fitbit.get('population')}")
    print(f"Autonomic Aging Analytics: HTTP {status_aging}, Demographic Records: {res_aging.get('demographic_records_count')}")

    wf_f_pass = (
        status_summ == 200 and res_summ.get("total_research_subjects") == 1212 and
        status_osd == 200 and len(res_osd.get("subjects", [])) == 4 and
        status_bidmc == 200 and res_bidmc.get("total_subjects") == 53 and
        status_aging == 200 and res_aging.get("demographic_records_count") == 1121
    )
    results["workflow_f"] = "PASS" if wf_f_pass else "FAIL"

    # -------------------------------------------------------------
    # Workflow G: Report Generation & Association
    # -------------------------------------------------------------
    print("\n--- Workflow G: Health Assessment & Report Association ---")
    assessment_payload = {
        "astronaut_id": astronaut_id,
        "assessment_date": "2026-11-15T12:00:00Z",
        "baseline_heart_rate": 72.0,
        "baseline_blood_pressure": "118/76",
        "baseline_spo2": 98.5,
        "baseline_temperature": 36.8,
        "sleep_hours": 7.5,
        "countermeasures_adherence": "95% (Nominal Protocol)",
        "summary": json.dumps({
            "missionDay": "Sol 42",
            "notes": "Flight surgeon telemetry review. Astronaut exhibits nominal cardiorespiratory adaptation.",
            "isSimulated": False,
            "symptoms": {"headache": False, "fatigue": False}
        }),
        "status": "OPTIMAL"
    }
    status, ass_res = api_request("POST", "/assessments/", assessment_payload)
    print(f"1. Create Health Assessment: HTTP {status}")
    assessment_id = ass_res.get("id") if status == 201 else None

    # Retrieve assessments for astronaut
    status, ass_list = api_request("GET", f"/assessments/?astronaut_id={astronaut_id}")
    print(f"2. List Assessments for Astronaut: HTTP {status}, Total: {len(ass_list) if isinstance(ass_list, list) else 0}")

    wf_g_pass = status == 200 and len(ass_list) >= 1 and ass_list[0].get("id") == assessment_id
    results["workflow_g"] = "PASS" if wf_g_pass else "FAIL"

    # -------------------------------------------------------------
    # Workflow H: Invalid Inputs & Error Handling
    # -------------------------------------------------------------
    print("\n--- Workflow H: Invalid Inputs & Error Boundary Testing ---")
    # 1. Missing required fields in AI analyze
    st_err1, res_err1 = api_request("POST", "/insights/analyze", {"heart_rate_bpm": 70})
    print(f"1. Missing required vitals: HTTP {st_err1} (Expected 422)")

    # 2. Biologically implausible / out of bounds vitals
    st_err2, res_err2 = api_request("POST", "/insights/analyze", {
        "heart_rate_bpm": 450.0,  # exceeds 300
        "spo2_pct": 98.0,
        "systolic_bp_mmhg": 120.0,
        "diastolic_bp_mmhg": 80.0
    })
    print(f"2. Out of bounds HR (450 BPM): HTTP {st_err2} (Expected 422)")

    # 3. Systolic <= Diastolic error
    st_err3, res_err3 = api_request("POST", "/insights/analyze", {
        "heart_rate_bpm": 75.0,
        "spo2_pct": 98.0,
        "systolic_bp_mmhg": 70.0,
        "diastolic_bp_mmhg": 90.0
    })
    print(f"3. SBP <= DBP (70/90 mmHg): HTTP {st_err3} (Expected 422)")

    # 4. Non-existent astronaut UUID in measurement
    fake_uuid = str(uuid.uuid4())
    st_err4, res_err4 = api_request("POST", "/measurements/", {
        "astronaut_id": fake_uuid,
        "measured_at": "2026-11-15T12:00:00Z",
        "heart_rate_bpm": 75.0,
        "blood_oxygen_pct": 98.0,
        "body_temperature_celsius": 36.8,
        "systolic_bp_mmhg": 120.0,
        "diastolic_bp_mmhg": 80.0,
        "source": "manual_entry",
        "is_simulated": False
    })
    print(f"4. Invalid Astronaut UUID in Measurement: HTTP {st_err4} (Expected 404)")

    # 5. Non-existent assessment UUID lookup
    st_err5, res_err5 = api_request("GET", f"/assessments/{fake_uuid}")
    print(f"5. Non-existent Assessment lookup: HTTP {st_err5} (Expected 404)")

    # 6. Test DELETE operation guarding in demo read-only mode
    st_err6, res_err6 = api_request("DELETE", f"/astronauts/{fake_uuid}")
    print(f"6. DELETE guarding in Demo Mode: HTTP {st_err6} (Expected 403 or 404)")

    wf_h_pass = (
        st_err1 == 422 and st_err2 == 422 and st_err3 == 422 and
        st_err4 == 404 and st_err5 == 404 and (st_err6 in (403, 404))
    )
    results["workflow_h"] = "PASS" if wf_h_pass else "FAIL"

    # -------------------------------------------------------------
    # CLEANUP: Remove strictly test records created during audit
    # -------------------------------------------------------------
    print("\n--- Audit Cleanup of Synthetic Test Entities ---")
    try:
        from app.database.connection import SessionLocal
        from app.models.health_measurement import HealthMeasurement
        from app.models.health_assessment import HealthAssessment
        from app.models.astronaut import AstronautProfile
        from app.models.mission import Mission
        
        db = SessionLocal()
        # Delete measurements created for test astronaut
        del_m = db.query(HealthMeasurement).filter(HealthMeasurement.astronaut_id == uuid.UUID(astronaut_id)).delete()
        # Delete assessments created for test astronaut
        del_a = db.query(HealthAssessment).filter(HealthAssessment.astronaut_id == uuid.UUID(astronaut_id)).delete()
        # Delete test astronaut
        del_p = db.query(AstronautProfile).filter(AstronautProfile.id == uuid.UUID(astronaut_id)).delete()
        # Delete test mission
        del_msn = db.query(Mission).filter(Mission.id == uuid.UUID(mission_id)).delete()
        db.commit()
        db.close()
        print(f"Cleanup successfully purged: {del_m} measurements, {del_a} assessments, {del_p} astronaut, {del_msn} mission.")
        results["cleanup"] = "PASS"
    except Exception as exc:
        print(f"Cleanup error: {exc}")
        results["cleanup"] = f"FAIL: {exc}"

    print("\n" + "=" * 70)
    print("AUDIT RESULTS SUMMARY:")
    for k, v in results.items():
        print(f"  {k:20}: {v}")
    print("=" * 70)

if __name__ == "__main__":
    main()
