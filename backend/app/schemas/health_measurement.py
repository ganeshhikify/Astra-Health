"""
Pydantic schemas for Health Measurement telemetry events.
"""

from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class HealthMeasurementBase(BaseModel):
    astronaut_id: uuid.UUID = Field(..., description="UUID of the monitored astronaut")
    measured_at: datetime = Field(..., description="Telemetry event timestamp (UTC)")
    heart_rate_bpm: Optional[float] = Field(None, ge=30, le=260, description="Heart rate in BPM")
    blood_oxygen_pct: Optional[float] = Field(None, ge=50, le=100, description="SpO2 oxygen saturation percentage")
    body_temperature_celsius: Optional[float] = Field(None, ge=30, le=45, description="Core body temperature in Celsius")
    systolic_bp_mmhg: Optional[int] = Field(None, ge=50, le=260, description="Systolic blood pressure in mmHg")
    diastolic_bp_mmhg: Optional[int] = Field(None, ge=30, le=160, description="Diastolic blood pressure in mmHg")
    source: Optional[str] = Field("BIO_HARNESS_V2", max_length=100, description="Sensor origin: BIO_HARNESS, CABIN_SENSOR, MANUAL")
    is_simulated: bool = Field(True, description="Identifies simulated/demo telemetry vs actual hardware readings")


class HealthMeasurementCreate(HealthMeasurementBase):
    pass


class HealthMeasurementResponse(HealthMeasurementBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
