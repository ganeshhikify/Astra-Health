"""
Automated tests for Health Assessment API endpoints.
"""

from datetime import datetime, timezone
import uuid
from fastapi.testclient import TestClient


def test_create_and_get_assessment(client: TestClient):
    """Test creating and retrieving clinical health assessments."""
    astro = client.post("/api/v1/astronauts/", json={
        "name": "Dr. Sarah Vance",
        "crew_id": "AST-ASSESS-01"
    }).json()

    assessment_payload = {
        "astronaut_id": astro["id"],
        "assessment_date": datetime.now(timezone.utc).isoformat(),
        "status": "OPTIMAL",
        "summary": "Baseline resting biometrics nominal.",
        "baseline_heart_rate": 68.0,
        "baseline_spo2": 99.0,
        "baseline_temperature": 36.6,
        "baseline_blood_pressure": "118/76",
        "sleep_hours": 7.5,
        "countermeasures_adherence": "Adherent"
    }
    res = client.post("/api/v1/assessments/", json=assessment_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "OPTIMAL"
    assert data["baseline_heart_rate"] == 68.0
    assess_id = data["id"]

    # Get by ID
    get_res = client.get(f"/api/v1/assessments/{assess_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == assess_id

    # Filter list by astronaut
    list_res = client.get(f"/api/v1/assessments/?astronaut_id={astro['id']}")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1


def test_update_assessment(client: TestClient):
    """Test updating clinical assessment status and notes."""
    astro = client.post("/api/v1/astronauts/", json={
        "name": "Test Subject",
        "crew_id": "AST-ASSESS-02"
    }).json()

    assessment = client.post("/api/v1/assessments/", json={
        "astronaut_id": astro["id"],
        "assessment_date": datetime.now(timezone.utc).isoformat(),
        "status": "OPTIMAL"
    }).json()

    update_res = client.put(f"/api/v1/assessments/{assessment['id']}", json={
        "status": "ATTENTION_REQUIRED",
        "summary": "Mild sleep debt observed during rotational watch."
    })
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "ATTENTION_REQUIRED"


def test_assessment_validation_errors(client: TestClient):
    """Test validation errors for assessments."""
    # Physiologically impossible heart rate
    astro = client.post("/api/v1/astronauts/", json={
        "name": "Val Astro",
        "crew_id": "AST-ASSESS-VAL"
    }).json()

    bad_hr = {
        "astronaut_id": astro["id"],
        "assessment_date": datetime.now(timezone.utc).isoformat(),
        "baseline_heart_rate": 500.0  # ge=30, le=250
    }
    assert client.post("/api/v1/assessments/", json=bad_hr).status_code == 422

    # Non-existent astronaut
    fake_astro = str(uuid.uuid4())
    bad_astro = {
        "astronaut_id": fake_astro,
        "assessment_date": datetime.now(timezone.utc).isoformat(),
        "status": "OPTIMAL"
    }
    assert client.post("/api/v1/assessments/", json=bad_astro).status_code == 404

    # Non-existent assessment ID
    fake_id = str(uuid.uuid4())
    assert client.get(f"/api/v1/assessments/{fake_id}").status_code == 404
