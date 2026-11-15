"""
Mission model representing an orbital or interplanetary mission assignment.
"""

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Date, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.astronaut import AstronautProfile


class Mission(Base):
    """
    Mission model.
    Tracks aerospace mission parameters, target destinations, and schedules.
    """

    __tablename__ = "missions"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        comment="Unique identifier for the mission record",
    )

    # Association with Astronaut
    astronaut_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("astronaut_profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Foreign key linking to the assigned astronaut profile",
    )

    # Mission Parameters
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="Operational name of the mission (e.g., Astra Artemis VII)",
    )
    destination: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="Target destination vector: ISS, MOON, or MARS",
    )
    duration: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Planned mission duration (e.g., '180 Days')",
    )
    launch_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Scheduled or actual launch date",
    )
    environment: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Baseline environmental hazards and gravity profile",
    )

    # Audit Timestamps
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp when mission was logged",
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Timestamp when mission was last modified",
    )

    # Relationships
    astronaut: Mapped[Optional["AstronautProfile"]] = relationship(
        "AstronautProfile",
        back_populates="missions",
    )

    def __repr__(self) -> str:
        return f"<Mission(id={self.id}, name='{self.name}', destination='{self.destination}')>"
