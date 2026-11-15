"""
Automated tests for Astronaut Profile API endpoints.
"""

import uuid
from fastapi.testclient import TestClient


def test_create_and_get_astronaut(client: TestClient):
    """Test creating an astronaut and retrieving by UUID and list."""
    payload = {
        "name": "Cmdr. Sarah Vance",
        "crew_id": "AST-7824",
        "role": "Mission Commander",
        "notes": "Pre-flight baseline established",
    }
    response = client.post("/api/v1/astronauts/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["crew_id"] == payload["crew_id"]
    assert data["role"] == payload["role"]
    assert "id" in data
    astro_id = data["id"]

    # Retrieve by ID
    get_res = client.get(f"/api/v1/astronauts/{astro_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == astro_id

    # Retrieve list
    list_res = client.get("/api/v1/astronauts/")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_update_astronaut(client: TestClient):
    """Test updating astronaut role and status."""
    payload = {
        "name": "Dr. Alex Rivera",
        "crew_id": "AST-9102",
        "role": "Flight Surgeon",
    }
    created = client.post("/api/v1/astronauts/", json=payload).json()
    astro_id = created["id"]

    update_payload = {
        "role": "Lead Flight Surgeon & Biomedical Officer",
        "is_active": False,
    }
    res = client.put(f"/api/v1/astronauts/{astro_id}", json=update_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "Lead Flight Surgeon & Biomedical Officer"
    assert data["is_active"] is False


def test_delete_astronaut(client: TestClient):
    """Test deleting an astronaut profile returns 204."""
    payload = {
        "name": "Lt. Marcus Chen",
        "crew_id": "AST-4512",
    }
    created = client.post("/api/v1/astronauts/", json=payload).json()
    astro_id = created["id"]

    del_res = client.delete(f"/api/v1/astronauts/{astro_id}")
    assert del_res.status_code == 204

    # Verify 404 on subsequent get
    assert client.get(f"/api/v1/astronauts/{astro_id}").status_code == 404


def test_astronaut_validation_errors(client: TestClient):
    """Test validation errors: duplicate crew_id, missing fields, invalid UUID."""
    # Duplicate crew ID
    payload = {"name": "Test Dupe", "crew_id": "AST-DUPE-1"}
    res1 = client.post("/api/v1/astronauts/", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/astronauts/", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]

    # Missing required name
    bad_payload = {"crew_id": "AST-NONAME"}
    bad_res = client.post("/api/v1/astronauts/", json=bad_payload)
    assert bad_res.status_code == 422

    # Non-existent UUID
    fake_id = str(uuid.uuid4())
    assert client.get(f"/api/v1/astronauts/{fake_id}").status_code == 404

    # Invalid UUID format
    assert client.get("/api/v1/astronauts/not-a-uuid").status_code == 422
