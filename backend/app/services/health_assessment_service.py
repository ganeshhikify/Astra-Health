"""
Service layer for Health Assessment clinical evaluations.
"""

from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.health_assessment import HealthAssessment
from app.schemas.health_assessment import HealthAssessmentCreate, HealthAssessmentUpdate


class HealthAssessmentService:
    @staticmethod
    def get_all(
        db: Session,
        astronaut_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[HealthAssessment]:
        statement = select(HealthAssessment)
        if astronaut_id:
            statement = statement.where(HealthAssessment.astronaut_id == astronaut_id)
        statement = statement.offset(skip).limit(limit).order_by(HealthAssessment.assessment_date.desc())
        return list(db.scalars(statement).all())

    @staticmethod
    def get_by_id(db: Session, assessment_id: uuid.UUID) -> Optional[HealthAssessment]:
        return db.get(HealthAssessment, assessment_id)

    @staticmethod
    def create(db: Session, data: HealthAssessmentCreate) -> HealthAssessment:
        assessment = HealthAssessment(
            astronaut_id=data.astronaut_id,
            assessment_date=data.assessment_date,
            status=data.status,
            summary=data.summary,
            baseline_heart_rate=data.baseline_heart_rate,
            baseline_spo2=data.baseline_spo2,
            baseline_temperature=data.baseline_temperature,
            baseline_blood_pressure=data.baseline_blood_pressure,
            sleep_hours=data.sleep_hours,
            countermeasures_adherence=data.countermeasures_adherence,
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        return assessment

    @staticmethod
    def update(db: Session, assessment: HealthAssessment, data: HealthAssessmentUpdate) -> HealthAssessment:
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(assessment, field, value)
        db.commit()
        db.refresh(assessment)
        return assessment
