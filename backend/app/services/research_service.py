"""
Research Service providing access to verified scientific public health datasets.
Serves comparative analytics, population benchmarks, and clinical distributions
strictly isolated from operational astronaut crew profiles and live telemetry.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.research import ResearchDataset, ResearchObservation

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "research" / "processed"


class ResearchService:
    @staticmethod
    def _read_json_fallback(filename: str) -> Optional[Dict[str, Any]]:
        path = PROCESSED_DIR / filename
        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return None
        return None

    @classmethod
    def get_all_datasets(cls, db: Session) -> List[Dict[str, Any]]:
        """Returns catalog of all verified public research datasets."""
        datasets = db.query(ResearchDataset).all()
        if datasets:
            return [
                {
                    "id": str(d.id),
                    "dataset_key": d.dataset_key,
                    "name": d.name,
                    "version": d.version,
                    "source_url": d.source_url,
                    "license": d.license,
                    "citation": d.citation,
                    "population_type": d.population_type,
                    "subject_count": d.subject_count,
                    "description": d.description,
                    "created_at": d.created_at.isoformat() if d.created_at else None,
                }
                for d in datasets
            ]
        
        # Fallback metadata if DB has not been seeded yet
        return [
            {
                "dataset_key": "bidmc",
                "name": "PhysioNet BIDMC PPG and Respiration Dataset",
                "version": "1.0.0",
                "source_url": "https://physionet.org/content/bidmc/1.0.0/",
                "license": "Open Data Commons Attribution License v1.0 (ODC-By)",
                "citation": "Pimentel, M. A., Johnson, A. E., Charlton, P. H., et al. (2016). IEEE TBME, 64(8), 1914-1923.",
                "population_type": "53 Adult ICU Patients",
                "subject_count": 53,
                "description": "High-fidelity PPG, ECG, and impedance respiration signals with derived Heart Rate, SpO2, and Respiratory Rate time-series.",
            },
            {
                "dataset_key": "osd_575",
                "name": "NASA Inspiration4 Commercial Astronaut Biomedical Study (OSD-575)",
                "version": "1.0",
                "source_url": "https://osdr.nasa.gov/bio/repo/data/studies/OSD-575",
                "license": "NASA Open Science Data Repository (Public Domain / CC0 equivalent)",
                "citation": "Overbey, E. G., et al. (2024). The Space Omics and Medical Atlas (SOMA) across orbits. Nature, 632, 1153-1165. NASA OSDR Study OSD-575.",
                "population_type": "4 Commercial Astronauts (Inspiration4)",
                "subject_count": 4,
                "description": "Spaceflight clinical chemistry, comprehensive metabolic panels, and cardiovascular multiplex cytokine assays across pre-flight, splashdown, and 82-day recovery timepoints.",
            },
            {
                "dataset_key": "fitbit",
                "name": "FitBit Fitness Tracker Activity & Sleep Research Dataset",
                "version": "1.0.0",
                "source_url": "https://doi.org/10.5281/zenodo.53894",
                "license": "Creative Commons Attribution 4.0 International (CC-BY 4.0)",
                "citation": "Furberg, R., Brinton, J., Keating, M., & Ortiz, A. (2016). Crowd-sourced Fitbit datasets based on argus system. Zenodo. doi:10.5281/zenodo.53894. (DataCite verified CC-BY 4.0).",
                "population_type": "34 Active Wearable Research Participants (35 raw IDs)",
                "subject_count": 34,
                "description": "Wearable activity tracker monitoring recording daily steps, caloric expenditure, active/sedentary intensity minutes, and sleep chronobiology across 34 active participants with valid physical records.",
            },
            {
                "dataset_key": "autonomic_aging",
                "name": "PhysioNet Autonomic Aging Cardiovascular Dataset",
                "version": "1.0.0",
                "source_url": "https://physionet.org/content/autonomic-aging-cardiovascular/1.0.0/",
                "license": "PhysioNet Credentialed / Open Access License",
                "citation": "Schumann, A., Bär, K. J., et al. (2021). Autonomic Aging: A dataset of cardiovascular recordings. PhysioNet.",
                "population_type": "1,121 Demographic Volunteer Records (Ages 18-92)",
                "subject_count": 1121,
                "description": "Demographic profiles across 15 age classifications from Jena University Hospital, contextualized with literature-derived normative hemodynamic reference curves (Schumann et al., 2021).",
            },
        ]

    @classmethod
    def get_dataset_analytics(cls, db: Session, dataset_key: str) -> Optional[Dict[str, Any]]:
        """Returns deep analytical aggregates for a specific research dataset."""
        obs = db.query(ResearchObservation).filter_by(
            dataset_key=dataset_key, category="analytics_aggregate"
        ).first()

        if obs and obs.metrics:
            return obs.metrics

        # Fallback to file-based cache if database row not yet written
        file_map = {
            "bidmc": "bidmc_analytics.json",
            "osd_575": "osd575_analytics.json",
            "fitbit": "fitbit_analytics.json",
            "autonomic_aging": "autonomic_aging_analytics.json",
        }
        filename = file_map.get(dataset_key)
        if filename:
            return cls._read_json_fallback(filename)
        return None

    @classmethod
    def get_summary(cls, db: Session) -> Dict[str, Any]:
        """Provides executive-level summary of all integrated public research datasets."""
        datasets = cls.get_all_datasets(db)
        total_subjects = sum(d.get("subject_count", 0) for d in datasets)

        return {
            "total_datasets": len(datasets),
            "total_research_subjects": total_subjects,
            "domains": [
                {
                    "domain": "ICU Oxygenation & Respiration",
                    "dataset": "PhysioNet BIDMC",
                    "subject_count": 53,
                    "key_metrics": "HR, SpO2, Respiratory Rate, Hypoxemia/Tachypnea incidence",
                },
                {
                    "domain": "Commercial Spaceflight Omics & Biomarkers",
                    "dataset": "NASA Inspiration4 (OSD-575)",
                    "subject_count": 4,
                    "key_metrics": "Metabolic panels, AST/ALT, Creatinine, Calcium, Recovery timeline",
                },
                {
                    "domain": "Wearable Biometrics & Sleep Chronobiology",
                    "dataset": "FitBit (Furberg et al.)",
                    "subject_count": 34,
                    "key_metrics": "Daily steps, Active intensity vs sedentary, Sleep cycles",
                },
                {
                    "domain": "Demographic Volunteers & Normative Hemodynamics",
                    "dataset": "PhysioNet Autonomic Aging",
                    "subject_count": 1121,
                    "key_metrics": "1,121 Demographic records; literature-derived SBP, DBP, MAP, PP reference curves across 8 age decades (Schumann et al., 2021)",
                },
            ],
            "model_isolation_notice": (
                "Public research datasets provide comparative reference cohorts and domain benchmarks. "
                "Incomplete research observation records are strictly isolated from the 6-feature "
                "Isolation Forest anomaly detection engine to prevent synthetic feature hallucination."
            ),
        }
