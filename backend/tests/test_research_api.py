"""
Automated tests for Research Dataset API endpoints.
Validates:
- Catalog listing of verified scientific research datasets
- High-level research summary
- Specialized analytics for BIDMC, OSD-575, FitBit, and Autonomic Aging
- Strict separation between research participants and operational astronaut profiles
"""

from fastapi.testclient import TestClient


def test_list_research_datasets(client: TestClient):
    """Verify research datasets catalog returns all four verified public datasets."""
    response = client.get("/api/v1/research/datasets")
    assert response.status_code == 200
    datasets = response.json()
    assert isinstance(datasets, list)
    assert len(datasets) >= 4

    keys = {d["dataset_key"] for d in datasets}
    assert "bidmc" in keys
    assert "osd_575" in keys
    assert "fitbit" in keys
    assert "autonomic_aging" in keys


def test_research_summary(client: TestClient):
    """Verify high-level research summary and ML model isolation notice."""
    response = client.get("/api/v1/research/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_datasets"] >= 4
    assert data["total_research_subjects"] > 1000
    assert len(data["domains"]) == 4
    assert "model_isolation_notice" in data


def test_bidmc_analytics(client: TestClient):
    """Verify PhysioNet BIDMC oxygenation & respiratory analytics."""
    response = client.get("/api/v1/research/bidmc/analytics")
    assert response.status_code == 200
    data = response.json()
    assert data["dataset_key"] == "bidmc"
    assert "vital_distributions" in data
    vitals = data["vital_distributions"]
    assert "heart_rate" in vitals
    assert "blood_oxygen" in vitals
    assert "respiratory_rate" in vitals
    assert "clinical_events" in data
    assert "hypoxemia_event_pct" in data["clinical_events"]
    assert "tachypnea_event_pct" in data["clinical_events"]


def test_osd575_analytics(client: TestClient):
    """Verify NASA Inspiration4 (OSD-575) spaceflight biomarker analytics."""
    response = client.get("/api/v1/research/osd-575/analytics")
    assert response.status_code == 200
    data = response.json()
    assert data["dataset_key"] == "osd_575"
    assert "biomarker_trends" in data
    assert len(data["biomarker_trends"]) > 0
    marker = data["biomarker_trends"][0]
    assert "pre_flight_baseline" in marker
    assert "immediate_post_flight_r1" in marker
    assert "acute_delta_pct" in marker


def test_fitbit_analytics(client: TestClient):
    """Verify FitBit wearable activity, sleep, and astronaut countermeasure analytics."""
    response = client.get("/api/v1/research/fitbit/analytics")
    assert response.status_code == 200
    data = response.json()
    assert data["dataset_key"] == "fitbit"
    assert "steps_summary" in data
    assert "activity_breakdown" in data
    assert "astronaut_countermeasure_benchmark" in data
    assert data["astronaut_countermeasure_benchmark"]["target_daily_steps"] == 10000


def test_autonomic_aging_analytics(client: TestClient):
    """Verify PhysioNet Autonomic Aging cardiovascular normative analytics."""
    response = client.get("/api/v1/research/autonomic-aging/analytics")
    assert response.status_code == 200
    data = response.json()
    assert data["dataset_key"] == "autonomic_aging"
    assert "normative_age_brackets" in data
    assert len(data["normative_age_brackets"]) == 8
    assert "cardiovascular_distributions" in data


def test_strict_isolation_from_astronauts(client: TestClient):
    """Verify research cohort subjects are NEVER mixed into astronaut_profiles."""
    response = client.get("/api/v1/astronauts/")
    assert response.status_code == 200
    astronauts = response.json()
    
    # Crew IDs should not contain research subject IDs (e.g. bidmc, C001, fitbit, 0001)
    for astro in astronauts:
        assert not astro["crew_id"].startswith("bidmc")
        assert not astro["name"].startswith("bidmc")
        assert not astro["name"].startswith("Research Participant")
