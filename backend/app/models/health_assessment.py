"""
Health assessment model representing comprehensive clinical evaluations.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Text, Float, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.astronaut import AstronautProfile


class HealthAssessment(Base):
    """
    HealthAssessment model.
    Stores comprehensive astronaut health evaluations, clinical checkups,
    and baseline wellness parameters.
    """

    __tablename__ = "health_assessments"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        comment="Unique identifier for the assessment evaluation",
    )

    # Astronaut Link
    astronaut_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("astronaut_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key referencing the astronaut profile evaluated",
    )

    # Evaluation Information
    assessment_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        comment="Timestamp when the clinical evaluation was performed",
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="OPTIMAL",
        index=True,
        comment="Assessment status: OPTIMAL, ATTENTION_REQUIRED, CRITICAL, COMPLETED",
    )
    summary: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Clinical or flight surgeon qualitative summary",
    )

    # Baseline Measurements (when recorded during assessment)
    baseline_heart_rate: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Baseline resting heart rate in BPM",
    )
    baseline_spo2: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Baseline oxygen saturation percentage (SpO2 %)",
    )
    baseline_temperature: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Baseline core body temperature in Celsius (°C)",
    )
    baseline_blood_pressure: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Baseline blood pressure in mmHg format (e.g. '118/76')",
    )

    # Wellness & Countermeasures Data
    sleep_hours: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Average daily sleep hours logged prior to assessment",
    )
    countermeasures_adherence: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Status of physical countermeasure exercise regimen (e.g. 'Adherent')",
    )

    # Audit Timestamps
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp when record was created",
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Timestamp when record was last updated",
    )

    # Relationships
    astronaut: Mapped["AstronautProfile"] = relationship(
        "AstronautProfile",
        back_populates="health_assessments",
    )

    def __repr__(self) -> str:
        return f"<HealthAssessment(id={self.id}, astronaut_id={self.astronaut_id}, status='{self.status}')>"
