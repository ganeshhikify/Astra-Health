"""
Service layer for Astronaut Profile operations.
"""

from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.astronaut import AstronautProfile
from app.schemas.astronaut import AstronautCreate, AstronautUpdate


class AstronautService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[AstronautProfile]:
        statement = select(AstronautProfile).offset(skip).limit(limit).order_by(AstronautProfile.created_at.desc())
        return list(db.scalars(statement).all())

    @staticmethod
    def get_by_id(db: Session, astronaut_id: uuid.UUID) -> Optional[AstronautProfile]:
        return db.get(AstronautProfile, astronaut_id)

    @staticmethod
    def get_by_crew_id(db: Session, crew_id: str) -> Optional[AstronautProfile]:
        statement = select(AstronautProfile).where(AstronautProfile.crew_id == crew_id)
        return db.scalar(statement)

    @staticmethod
    def create(db: Session, data: AstronautCreate) -> AstronautProfile:
        astronaut = AstronautProfile(
            name=data.name,
            crew_id=data.crew_id,
            role=data.role,
            is_active=data.is_active,
            notes=data.notes,
        )
        db.add(astronaut)
        db.commit()
        db.refresh(astronaut)
        return astronaut

    @staticmethod
    def update(db: Session, astronaut: AstronautProfile, data: AstronautUpdate) -> AstronautProfile:
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(astronaut, field, value)
        db.commit()
        db.refresh(astronaut)
        return astronaut

    @staticmethod
    def delete(db: Session, astronaut: AstronautProfile) -> None:
        db.delete(astronaut)
        db.commit()
