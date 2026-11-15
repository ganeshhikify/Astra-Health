"""
Research dataset models for storing verified public scientific research data.
Ensures strict separation between research study subjects and astronaut operative profiles.
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, JSON, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class ResearchDataset(Base):
    """
    Catalog of verified scientific public datasets integrated into ASTRA HEALTH.
    """
    __tablename__ = "research_datasets"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    dataset_key: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique slug identifier (e.g., 'bidmc', 'osd_575', 'fitbit', 'autonomic_aging')",
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Official dataset display title",
    )
    version: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="1.0.0",
    )
    source_url: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
        comment="Official repository or publication URL",
    )
    license: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        comment="Open science license (e.g. ODC-BY, CC0, CC-BY 4.0)",
    )
    citation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Formal research citation",
    )
    population_type: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        comment="Type of cohort (e.g., ICU patients, civilian astronauts, healthy volunteers)",
    )
    subject_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    observations: Mapped[List["ResearchObservation"]] = relationship(
        "ResearchObservation",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )


class ResearchObservation(Base):
    """
    Individual physiological, metabolic, or activity observations from public research cohorts.
    Separated strictly from astronaut operative telemetry.
    """
    __tablename__ = "research_observations"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("research_datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    dataset_key: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
    )
    subject_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        comment="Anonymized participant or subject ID from the dataset",
    )
    timepoint: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        index=True,
        comment="Study timepoint (e.g. 'continuous', 'L-92', 'R+1', '2016-04-12')",
    )
    category: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        comment="Domain category (e.g., 'oxygenation_respiration', 'spaceflight_biomarkers', 'activity_sleep', 'cardiovascular_aging')",
    )
    metrics: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        comment="Structured physiological/metabolic measurements",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    dataset: Mapped["ResearchDataset"] = relationship(
        "ResearchDataset",
        back_populates="observations",
    )
