"""
Service layer for vital Health Measurement telemetry.
"""

from datetime import datetime
from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.health_measurement import HealthMeasurement
from app.schemas.health_measurement import HealthMeasurementCreate


class HealthMeasurementService:
    @staticmethod
    def get_all(
        db: Session,
        astronaut_id: Optional[uuid.UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        is_simulated: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[HealthMeasurement]:
        statement = select(HealthMeasurement)

        if astronaut_id:
            statement = statement.where(HealthMeasurement.astronaut_id == astronaut_id)
        if start_date:
            statement = statement.where(HealthMeasurement.measured_at >= start_date)
        if end_date:
            statement = statement.where(HealthMeasurement.measured_at <= end_date)
        if is_simulated is not None:
            statement = statement.where(HealthMeasurement.is_simulated == is_simulated)

        statement = statement.offset(skip).limit(limit).order_by(HealthMeasurement.measured_at.desc())
        return list(db.scalars(statement).all())

    @staticmethod
    def get_by_id(db: Session, measurement_id: uuid.UUID) -> Optional[HealthMeasurement]:
        return db.get(HealthMeasurement, measurement_id)

    @staticmethod
    def get_by_astronaut(
        db: Session,
        astronaut_id: uuid.UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[HealthMeasurement]:
        statement = select(HealthMeasurement).where(HealthMeasurement.astronaut_id == astronaut_id)
        if start_date:
            statement = statement.where(HealthMeasurement.measured_at >= start_date)
        if end_date:
            statement = statement.where(HealthMeasurement.measured_at <= end_date)
        statement = statement.offset(skip).limit(limit).order_by(HealthMeasurement.measured_at.desc())
        return list(db.scalars(statement).all())

    @staticmethod
    def create(db: Session, data: HealthMeasurementCreate) -> HealthMeasurement:
        measurement = HealthMeasurement(
            astronaut_id=data.astronaut_id,
            measured_at=data.measured_at,
            heart_rate_bpm=data.heart_rate_bpm,
            blood_oxygen_pct=data.blood_oxygen_pct,
            body_temperature_celsius=data.body_temperature_celsius,
            systolic_bp_mmhg=data.systolic_bp_mmhg,
            diastolic_bp_mmhg=data.diastolic_bp_mmhg,
            source=data.source,
            is_simulated=data.is_simulated,
        )
        db.add(measurement)
        db.commit()
        db.refresh(measurement)
        return measurement
