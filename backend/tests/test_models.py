"""
Tests for SQLAlchemy model definitions, relations, and data persistence.
"""

from datetime import datetime, timezone, date
import uuid
from sqlalchemy.orm import Session
from app.models.astronaut import AstronautProfile
from app.models.mission import Mission
from app.models.health_assessment import HealthAssessment
from app.models.health_measurement import HealthMeasurement


def test_create_astronaut_profile(db_session: Session):
    """Verify creating and retrieving an astronaut profile."""
    astronaut = AstronautProfile(
        name="Cmdr. Sarah Vance",
        crew_id="AST-7824",
        role="Mission Commander",
        notes="Pre-flight baseline established",
    )
    db_session.add(astronaut)
    db_session.commit()
    db_session.refresh(astronaut)

    assert isinstance(astronaut.id, uuid.UUID)
    assert astronaut.name == "Cmdr. Sarah Vance"
    assert astronaut.crew_id == "AST-7824"
    assert astronaut.is_active is True
    assert astronaut.created_at is not None


def test_create_mission_with_relationship(db_session: Session):
    """Verify mission creation and relationship back to astronaut."""
    astronaut = AstronautProfile(
        name="Dr. Alex Rivera",
        crew_id="AST-9102",
        role="Flight Surgeon",
    )
    db_session.add(astronaut)
    db_session.commit()

    mission = Mission(
        astronaut_id=astronaut.id,
        name="Astra Artemis VII",
        destination="MOON",
        duration="180 Days",
        launch_date=date(2027, 4, 12),
        environment="Low Gravity • Lunar Regolith",
    )
    db_session.add(mission)
    db_session.commit()
    db_session.refresh(mission)

    assert mission.destination == "MOON"
    assert mission.astronaut is not None
    assert mission.astronaut.name == "Dr. Alex Rivera"


def test_create_health_assessment(db_session: Session):
    """Verify health assessment creation and baseline vitals recording."""
    astronaut = AstronautProfile(
        name="Lt. Marcus Chen",
        crew_id="AST-4512",
        role="Lead Systems Engineer",
    )
    db_session.add(astronaut)
    db_session.commit()

    assessment = HealthAssessment(
        astronaut_id=astronaut.id,
        assessment_date=datetime.now(timezone.utc),
        status="OPTIMAL",
        summary="All cardiovascular and oxygenation parameters within standard flight envelope.",
        baseline_heart_rate=68.0,
        baseline_spo2=99.0,
        baseline_temperature=36.7,
        baseline_blood_pressure="116/74",
        sleep_hours=7.5,
        countermeasures_adherence="Adherent",
    )
    db_session.add(assessment)
    db_session.commit()
    db_session.refresh(assessment)

    assert assessment.status == "OPTIMAL"
    assert assessment.baseline_heart_rate == 68.0
    assert assessment.baseline_spo2 == 99.0
    assert assessment.astronaut.crew_id == "AST-4512"


def test_create_health_measurement_with_simulated_flag(db_session: Session):
    """Verify health measurement logging and simulated/real data flag distinction."""
    astronaut = AstronautProfile(
        name="Dr. Elena Rostova",
        crew_id="AST-3301",
        role="Biomedical Specialist",
    )
    db_session.add(astronaut)
    db_session.commit()

    measurement = HealthMeasurement(
        astronaut_id=astronaut.id,
        measured_at=datetime.now(timezone.utc),
        heart_rate_bpm=72.5,
        blood_oxygen_pct=98.5,
        body_temperature_celsius=36.8,
        systolic_bp_mmhg=118,
        diastolic_bp_mmhg=76,
        source="BIO_HARNESS_V2",
        is_simulated=True,
    )
    db_session.add(measurement)
    db_session.commit()
    db_session.refresh(measurement)

    assert measurement.is_simulated is True
    assert measurement.heart_rate_bpm == 72.5
    assert measurement.systolic_bp_mmhg == 118
    assert measurement.diastolic_bp_mmhg == 76
    assert measurement.astronaut.name == "Dr. Elena Rostova"
