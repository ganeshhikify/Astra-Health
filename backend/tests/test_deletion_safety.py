"""
Automated tests for entity relationships and deletion safety rules.
"""

from datetime import datetime, timezone
from fastapi.testclient import TestClient


def test_delete_mission_preserves_astronaut_and_health_data(client: TestClient):
    """
    Verify that deleting a mission record NEVER erases the associated astronaut,
    their health assessments, or their telemetry measurements.
    """
    # 1. Create Astronaut
    astro = client.post("/api/v1/astronauts/", json={
        "name": "Dr. Elena Rostova",
        "crew_id": "AST-SAFE-01"
    }).json()
    astro_id = astro["id"]

    # 2. Create Mission linked to astronaut
    mission = client.post("/api/v1/missions/", json={
        "name": "Orbital Mission Alpha",
        "destination": "ISS",
        "astronaut_id": astro_id
    }).json()
    mission_id = mission["id"]

    # 3. Create Health Assessment for astronaut
    assess = client.post("/api/v1/assessments/", json={
        "astronaut_id": astro_id,
        "assessment_date": datetime.now(timezone.utc).isoformat(),
        "status": "OPTIMAL",
        "baseline_heart_rate": 70.0
    }).json()
    assess_id = assess["id"]

    # 4. Create Measurement for astronaut
    meas = client.post("/api/v1/measurements/", json={
        "astronaut_id": astro_id,
        "measured_at": datetime.now(timezone.utc).isoformat(),
        "heart_rate_bpm": 72.0,
        "blood_oxygen_pct": 98.0
    }).json()
    meas_id = meas["id"]

    # 5. Delete Mission
    del_mission_res = client.delete(f"/api/v1/missions/{mission_id}")
    assert del_mission_res.status_code == 204

    # 6. Verify Mission is gone
    assert client.get(f"/api/v1/missions/{mission_id}").status_code == 404

    # 7. CRITICAL: Verify Astronaut, Assessment, and Measurement are completely PRESERVED
    assert client.get(f"/api/v1/astronauts/{astro_id}").status_code == 200
    assert client.get(f"/api/v1/assessments/{assess_id}").status_code == 200
    assert client.get(f"/api/v1/measurements/{meas_id}").status_code == 200
