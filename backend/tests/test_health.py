"""
Tests for system root and health diagnostic endpoints.
"""

from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    """Verify root endpoint returns system information and Swagger links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "ASTRA HEALTH" in data["system"]
    assert data["documentation"]["swagger_ui"] == "/docs"
    assert data["documentation"]["redoc"] == "/redoc"
    assert data["health_check"] == "/health"


def test_health_endpoint(client: TestClient):
    """Verify /health endpoint returns diagnostics without crashing."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "service" in data
    assert "version" in data
    assert "database" in data
    assert "status" in data["database"]
    assert "message" in data["database"]


def test_api_v1_health_endpoint(client: TestClient):
    """Verify versioned /api/v1/health endpoint works identically."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "database" in data
