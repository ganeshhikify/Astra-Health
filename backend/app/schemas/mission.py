"""
Pydantic schemas for Mission management.
"""

from datetime import date, datetime
from typing import Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class MissionBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Mission name, e.g. Astra Artemis VII")
    destination: str = Field(..., min_length=2, max_length=100, description="Destination vector: ISS, MOON, or MARS")
    duration: Optional[str] = Field(None, max_length=100, description="Planned mission duration, e.g. '180 Days'")
    launch_date: Optional[date] = Field(None, description="Scheduled launch date")
    environment: Optional[str] = Field(None, max_length=255, description="Environmental hazards baseline")
    astronaut_id: Optional[uuid.UUID] = Field(None, description="Assigned astronaut operative UUID")


class MissionCreate(MissionBase):
    pass


class MissionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    destination: Optional[str] = Field(None, min_length=2, max_length=100)
    duration: Optional[str] = Field(None, max_length=100)
    launch_date: Optional[date] = None
    environment: Optional[str] = Field(None, max_length=255)
    astronaut_id: Optional[uuid.UUID] = None


class MissionResponse(MissionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
