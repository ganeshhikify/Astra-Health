"""
Astronaut profile model representing an astronaut operative in the mission system.
"""

import uuid
from typing import TYPE_CHECKING, List
from sqlalchemy import String, Boolean, Text, DateTime, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.mission import Mission
    from app.models.health_assessment import HealthAssessment
    from app.models.health_measurement import HealthMeasurement


class AstronautProfile(Base):
    """
    Astronaut Profile model.
    Stores foundational operative credentials and baseline identity.
    Designed to easily attach to future user authentication and data ownership.
    """

    __tablename__ = "astronaut_profiles"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        comment="Unique identifier for the astronaut profile",
    )

    # Core Profile Information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="Full operational name of the astronaut",
    )
    crew_id: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
        comment="Unique mission crew code (e.g., AST-7824)",
    )
    role: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
        default="Mission Specialist",
        comment="Operational role (e.g., Mission Commander, Flight Surgeon)",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Indicates whether the astronaut is on an active assignment",
    )
    notes: Mapped[str] = mapped_column(
        Text,
        nullable=True,
        comment="Optional flight surgeon or mission readiness notes",
    )

    # Future User Ownership Extension (nullable for unauthenticated phase)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
        index=True,
        comment="Reserved for future authentication and user-specific data ownership",
    )

    # Audit Timestamps
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp when profile was created",
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Timestamp when profile was last updated",
    )

    # Relationships
    missions: Mapped[List["Mission"]] = relationship(
        "Mission",
        back_populates="astronaut",
        cascade="all, delete-orphan",
        order_by="desc(Mission.created_at)",
    )
    health_assessments: Mapped[List["HealthAssessment"]] = relationship(
        "HealthAssessment",
        back_populates="astronaut",
        cascade="all, delete-orphan",
        order_by="desc(HealthAssessment.assessment_date)",
    )
    health_measurements: Mapped[List["HealthMeasurement"]] = relationship(
        "HealthMeasurement",
        back_populates="astronaut",
        cascade="all, delete-orphan",
        order_by="desc(HealthMeasurement.measured_at)",
    )

    def __repr__(self) -> str:
        return f"<AstronautProfile(id={self.id}, name='{self.name}', crew_id='{self.crew_id}')>"
