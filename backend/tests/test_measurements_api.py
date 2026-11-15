"""
Automated tests for Health Measurement telemetry API endpoints.
"""

from datetime import datetime, timezone, timedelta
import uuid
from fastapi.testclient import TestClient


def test_create_and_query_measurements(client: TestClient):
    """Test logging telemetry and querying with date and simulation filters."""
    astro = client.post("/api/v1/astronauts/", json={
        "name": "Lt. Marcus Chen",
        "crew_id": "AST-MEAS-01"
    }).json()

    now = datetime.now(timezone.utc)
    # Log 2 measurements: one simulated, one real
    m1 = client.post("/api/v1/measurements/", json={
        "astronaut_id": astro["id"],
        "measured_at": (now - timedelta(hours=2)).isoformat(),
        "heart_rate_bpm": 72.0,
        "blood_oxygen_pct": 98.0,
        "body_temperature_celsius": 36.8,
        "systolic_bp_mmhg": 120,
        "diastolic_bp_mmhg": 80,
        "source": "BIO_HARNESS_V2",
        "is_simulated": True
    }).json()

    m2 = client.post("/api/v1/measurements/", json={
        "astronaut_id": astro["id"],
        "measured_at": now.isoformat(),
        "heart_rate_bpm": 76.0,
        "blood_oxygen_pct": 97.5,
        "body_temperature_celsius": 36.9,
        "systolic_bp_mmhg": 122,
        "diastolic_bp_mmhg": 82,
        "source": "CABIN_TELEMETRY",
        "is_simulated": False
    }).json()

    # Get single measurement by ID
    get_res = client.get(f"/api/v1/measurements/{m1['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["heart_rate_bpm"] == 72.0
    assert get_res.json()["is_simulated"] is True

    # Filter by is_simulated=true
    sim_res = client.get("/api/v1/measurements/", params={"is_simulated": True})
    assert sim_res.status_code == 200
    for item in sim_res.json():
        assert item["is_simulated"] is True

    # Filter by astronaut history
    hist_res = client.get(f"/api/v1/measurements/astronaut/{astro['id']}")
    assert hist_res.status_code == 200
    assert len(hist_res.json()) == 2

    # Date range filter with properly URL-encoded params
    cutoff = (now - timedelta(hours=1)).isoformat()
    range_res = client.get(
        f"/api/v1/measurements/astronaut/{astro['id']}",
        params={"start_date": cutoff}
    )
    assert range_res.status_code == 200
    assert len(range_res.json()) == 1
    assert range_res.json()[0]["id"] == m2["id"]


def test_measurement_validation_errors(client: TestClient):
    """Test validation errors for health telemetry."""
    astro = client.post("/api/v1/astronauts/", json={
        "name": "Val Operative",
        "crew_id": "AST-MEAS-VAL"
    }).json()

    # Physiologically impossible SpO2 (>100)
    bad_spo2 = {
        "astronaut_id": astro["id"],
        "measured_at": datetime.now(timezone.utc).isoformat(),
        "blood_oxygen_pct": 120.0
    }
    assert client.post("/api/v1/measurements/", json=bad_spo2).status_code == 422

    # Physiologically impossible Heart Rate (<30)
    bad_hr = {
        "astronaut_id": astro["id"],
        "measured_at": datetime.now(timezone.utc).isoformat(),
        "heart_rate_bpm": 10.0
    }
    assert client.post("/api/v1/measurements/", json=bad_hr).status_code == 422

    # Missing astronaut
    fake_astro = str(uuid.uuid4())
    res_ghost = client.post("/api/v1/measurements/", json={
        "astronaut_id": fake_astro,
        "measured_at": datetime.now(timezone.utc).isoformat(),
        "heart_rate_bpm": 70.0
    })
    assert res_ghost.status_code == 404

    # Non-existent measurement ID
    fake_m_id = str(uuid.uuid4())
    assert client.get(f"/api/v1/measurements/{fake_m_id}").status_code == 404
