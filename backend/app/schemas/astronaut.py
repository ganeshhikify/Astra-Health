"""
Pydantic schemas for Astronaut Profile management.
"""

from datetime import datetime
from typing import Optional, List
import uuid
from pydantic import BaseModel, ConfigDict, Field


class AstronautBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Full name of astronaut operative")
    crew_id: str = Field(..., min_length=2, max_length=50, description="Unique crew identifier, e.g. AST-7824")
    role: Optional[str] = Field("Mission Specialist", max_length=100, description="Operational role or specialization")
    is_active: bool = Field(True, description="Active flight deployment status")
    notes: Optional[str] = Field(None, description="Clinical or operational flight readiness notes")


class AstronautCreate(AstronautBase):
    pass


class AstronautUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    crew_id: Optional[str] = Field(None, min_length=2, max_length=50)
    role: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class AstronautResponse(AstronautBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
