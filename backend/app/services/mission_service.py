"""
Service layer for Mission operations.
"""

from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.mission import Mission
from app.schemas.mission import MissionCreate, MissionUpdate


class MissionService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Mission]:
        statement = select(Mission).offset(skip).limit(limit).order_by(Mission.created_at.desc())
        return list(db.scalars(statement).all())

    @staticmethod
    def get_by_id(db: Session, mission_id: uuid.UUID) -> Optional[Mission]:
        return db.get(Mission, mission_id)

    @staticmethod
    def create(db: Session, data: MissionCreate) -> Mission:
        mission = Mission(
            name=data.name,
            destination=data.destination.upper(),
            duration=data.duration,
            launch_date=data.launch_date,
            environment=data.environment,
            astronaut_id=data.astronaut_id,
        )
        db.add(mission)
        db.commit()
        db.refresh(mission)
        return mission

    @staticmethod
    def update(db: Session, mission: Mission, data: MissionUpdate) -> Mission:
        update_data = data.model_dump(exclude_unset=True)
        if "destination" in update_data and update_data["destination"]:
            update_data["destination"] = update_data["destination"].upper()
        for field, value in update_data.items():
            setattr(mission, field, value)
        db.commit()
        db.refresh(mission)
        return mission

    @staticmethod
    def delete(db: Session, mission: Mission) -> None:
        db.delete(mission)
        db.commit()
