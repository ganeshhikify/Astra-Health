"""
Health measurement model representing individual telemetry metric events.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.astronaut import AstronautProfile


class HealthMeasurement(Base):
    """
    HealthMeasurement model.
    Stores vital physiological telemetry events (Heart Rate, SpO2, Temp, BP)
    originating from wearable sensors, telemetry downlinks, or simulations.
    """

    __tablename__ = "health_measurements"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        comment="Unique identifier for the telemetry measurement",
    )

    # Astronaut Link
    astronaut_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("astronaut_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking measurement to the astronaut operative",
    )

    # Telemetry Timestamp
    measured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        comment="Exact timestamp when the biometric reading occurred",
    )

    # Core Vital Telemetry Metrics
    heart_rate_bpm: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Heart rate in beats per minute (BPM)",
    )
    blood_oxygen_pct: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Blood oxygen saturation percentage (SpO2 %)",
    )
    body_temperature_celsius: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Core body temperature in Celsius (°C)",
    )
    systolic_bp_mmhg: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Systolic blood pressure in mmHg",
    )
    diastolic_bp_mmhg: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Diastolic blood pressure in mmHg",
    )

    # Telemetry Metadata & Simulation Tracking
    source: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        default="BIO_HARNESS_V2",
        comment="Origin of measurement: e.g. BIO_HARNESS, CABIN_SENSOR, MANUAL_CLINICAL",
    )
    is_simulated: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
        comment="Explicitly distinguishes simulated demonstration data from real sensor telemetry",
    )

    # Audit Creation Timestamp
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp when record was stored in the database",
    )

    # Relationships
    astronaut: Mapped["AstronautProfile"] = relationship(
        "AstronautProfile",
        back_populates="health_measurements",
    )

    def __repr__(self) -> str:
        return (
            f"<HealthMeasurement(id={self.id}, astronaut_id={self.astronaut_id}, "
            f"measured_at={self.measured_at}, HR={self.heart_rate_bpm}, SpO2={self.blood_oxygen_pct})>"
        )
