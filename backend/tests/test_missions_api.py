"""
Automated tests for Mission API endpoints.
"""

import uuid
from fastapi.testclient import TestClient


def test_create_and_get_mission(client: TestClient):
    """Test creating and retrieving a mission linked to an astronaut."""
    astro = client.post("/api/v1/astronauts/", json={
        "name": "Mission Commander Vance",
        "crew_id": "AST-MIS-01"
    }).json()

    mission_payload = {
        "name": "Astra Artemis VII",
        "destination": "MOON",
        "duration": "180 Days",
        "launch_date": "2027-04-12",
        "environment": "Low Gravity • Lunar Regolith",
        "astronaut_id": astro["id"]
    }
    response = client.post("/api/v1/missions/", json=mission_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == mission_payload["name"]
    assert data["destination"] == "MOON"
    assert data["astronaut_id"] == astro["id"]
    mission_id = data["id"]

    # Get by ID
    get_res = client.get(f"/api/v1/missions/{mission_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == mission_id

    # List missions
    list_res = client.get("/api/v1/missions/")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_update_and_delete_mission(client: TestClient):
    """Test updating and deleting a mission."""
    mission = client.post("/api/v1/missions/", json={
        "name": "Ares Precursor",
        "destination": "MARS",
        "duration": "500 Days"
    }).json()
    m_id = mission["id"]

    # Update
    up_res = client.put(f"/api/v1/missions/{m_id}", json={
        "duration": "540 Days",
        "destination": "mars"
    })
    assert up_res.status_code == 200
    assert up_res.json()["duration"] == "540 Days"
    assert up_res.json()["destination"] == "MARS"

    # Delete
    del_res = client.delete(f"/api/v1/missions/{m_id}")
    assert del_res.status_code == 204
    assert client.get(f"/api/v1/missions/{m_id}").status_code == 404


def test_mission_validation_errors(client: TestClient):
    """Test validation errors for missions."""
    # Missing destination
    res = client.post("/api/v1/missions/", json={"name": "No Dest Mission"})
    assert res.status_code == 422

    # Non-existent astronaut link
    fake_astro_id = str(uuid.uuid4())
    res_bad_astro = client.post("/api/v1/missions/", json={
        "name": "Ghost Mission",
        "destination": "ISS",
        "astronaut_id": fake_astro_id
    })
    assert res_bad_astro.status_code == 404

    # Non-existent mission ID
    fake_mission_id = str(uuid.uuid4())
    assert client.get(f"/api/v1/missions/{fake_mission_id}").status_code == 404
