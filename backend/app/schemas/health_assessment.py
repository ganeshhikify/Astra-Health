"""
Pydantic schemas for Health Assessment management.
"""

from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class HealthAssessmentBase(BaseModel):
    astronaut_id: uuid.UUID = Field(..., description="UUID of the astronaut evaluated")
    assessment_date: datetime = Field(..., description="Date and time of the clinical evaluation")
    status: str = Field("OPTIMAL", description="Assessment evaluation status: OPTIMAL, ATTENTION_REQUIRED, CRITICAL, COMPLETED")
    summary: Optional[str] = Field(None, description="Flight surgeon summary or qualitative findings")
    baseline_heart_rate: Optional[float] = Field(None, ge=30, le=250, description="Resting heart rate in BPM")
    baseline_spo2: Optional[float] = Field(None, ge=50, le=100, description="Blood oxygen saturation percentage")
    baseline_temperature: Optional[float] = Field(None, ge=30, le=45, description="Core body temperature in Celsius")
    baseline_blood_pressure: Optional[str] = Field(None, max_length=50, description="Blood pressure, e.g. '120/80'")
    sleep_hours: Optional[float] = Field(None, ge=0, le=24, description="Average daily sleep hours")
    countermeasures_adherence: Optional[str] = Field(None, max_length=100, description="Physical countermeasure exercise adherence")


class HealthAssessmentCreate(HealthAssessmentBase):
    pass


class HealthAssessmentUpdate(BaseModel):
    assessment_date: Optional[datetime] = None
    status: Optional[str] = None
    summary: Optional[str] = None
    baseline_heart_rate: Optional[float] = Field(None, ge=30, le=250)
    baseline_spo2: Optional[float] = Field(None, ge=50, le=100)
    baseline_temperature: Optional[float] = Field(None, ge=30, le=45)
    baseline_blood_pressure: Optional[str] = None
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    countermeasures_adherence: Optional[str] = None


class HealthAssessmentResponse(HealthAssessmentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
