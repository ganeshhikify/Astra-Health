/**
 * ASTRA HEALTH - Research Datasets & Analytics API Client
 * Provides typed methods for accessing verified scientific public research data.
 */

import { apiClient } from './client';

export interface ResearchDatasetInfo {
  id?: string;
  dataset_key: string;
  name: string;
  version: string;
  source_url: string;
  license: string;
  citation: string;
  population_type: string;
  subject_count: number;
  description: string;
}

export interface ResearchSummary {
  total_datasets: number;
  total_research_subjects: number;
  domains: {
    domain: string;
    dataset: string;
    subject_count: number;
    key_metrics: string;
  }[];
  model_isolation_notice: string;
}

export interface BidmcAnalytics {
  dataset_key: string;
  name: string;
  version: string;
  population: string;
  total_subjects: number;
  total_timepoints_analyzed: number;
  vital_distributions: {
    heart_rate: {
      unit: string;
      mean: number;
      median: number;
      std: number;
      min: number;
      max: number;
      p25: number;
      p75: number;
    };
    blood_oxygen: {
      unit: string;
      mean: number;
      median: number;
      std: number;
      min: number;
      max: number;
      p25: number;
      p75: number;
    };
    respiratory_rate: {
      unit: string;
      mean: number;
      median: number;
      std: number;
      min: number;
      max: number;
      p25: number;
      p75: number;
    };
  };
  clinical_events: {
    hypoxemia_event_pct: number;
    tachypnea_event_pct: number;
    spo2_resp_correlation: number;
    respiratory_stability_index: number;
  };
  sample_subjects: {
    subject_id: string;
    sample_count: number;
    mean_hr: number;
    std_hr: number;
    mean_spo2: number;
    min_spo2: number;
    mean_resp: number;
    max_resp: number;
    hypoxemia_events: number;
    tachypnea_events: number;
  }[];
  histograms: {
    spo2: { range: string; count: number }[];
    resp_rate: { range: string; count: number }[];
  };
}

export interface Osd575BiomarkerTrend {
  marker: string;
  category: string;
  unit: string;
  pre_flight_baseline: number;
  immediate_post_flight_r1: number;
  post_flight_recovery_r82: number;
  acute_delta_pct: number;
  recovery_delta_pct: number;
  stress_response: string;
}

export interface Osd575Analytics {
  dataset_key: string;
  name: string;
  version: string;
  population: string;
  subjects: string[];
  flight_duration_days: number;
  orbit_apogee_km: number;
  biomarker_trends: Osd575BiomarkerTrend[];
  timeline: {
    timepoint: string;
    label: string;
    ast?: number;
    creatinine?: number;
    glucose?: number;
    calcium?: number;
  }[];
}

export interface FitbitAnalytics {
  dataset_key: string;
  name: string;
  version: string;
  population: string;
  total_days_recorded: number;
  steps_summary: {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    compliance_10k_steps_pct: number;
  };
  activity_breakdown: {
    very_active_minutes_avg: number;
    fairly_active_minutes_avg: number;
    lightly_active_minutes_avg: number;
    sedentary_minutes_avg: number;
    sedentary_percentage: number;
    active_percentage: number;
  };
  astronaut_countermeasure_benchmark: {
    target_daily_steps: number;
    target_rigorous_exercise_mins: number;
    actual_mean_steps: number;
    actual_rigorous_exercise_mins: number;
    compliance_status: string;
  };
  sleep_summary: {
    mean_sleep_duration_hours: number;
    sleep_efficiency_pct: number;
    deep_sleep_pct: number;
    rem_sleep_pct: number;
    light_sleep_pct: number;
  };
  step_distribution_histogram: { range: string; count: number }[];
}

export interface AutonomicAgingAnalytics {
  dataset_key: string;
  name: string;
  version: string;
  population: string;
  total_subjects: number;
  normative_age_brackets: {
    group: string;
    age_bracket: string;
    n: number;
    mean_sbp: number;
    mean_dbp: number;
    mean_map: number;
    mean_pp: number;
    mean_hr: number;
    autonomic_tone: string;
  }[];
  cardiovascular_distributions: {
    sbp: { mean: number; std: number; p10: number; p50: number; p90: number };
    dbp: { mean: number; std: number; p10: number; p50: number; p90: number };
    pulse_pressure: { mean: number; std: number; p10: number; p50: number; p90: number };
    mean_arterial_pressure: { mean: number; std: number; p10: number; p50: number; p90: number };
  };
  astronaut_normative_baseline: {
    astronaut_typical_age_bracket: string;
    expected_sbp_range: string;
    expected_dbp_range: string;
    expected_pp_range: string;
    microgravity_adaptation_note: string;
  };
}

export const researchApi = {
  getDatasets: () => apiClient.get<ResearchDatasetInfo[]>('research/datasets'),
  getSummary: () => apiClient.get<ResearchSummary>('research/summary'),
  getBidmcAnalytics: () => apiClient.get<BidmcAnalytics>('research/bidmc/analytics'),
  getOsd575Analytics: () => apiClient.get<Osd575Analytics>('research/osd-575/analytics'),
  getFitbitAnalytics: () => apiClient.get<FitbitAnalytics>('research/fitbit/analytics'),
  getAutonomicAgingAnalytics: () => apiClient.get<AutonomicAgingAnalytics>('research/autonomic-aging/analytics'),
  getDatasetByKey: (key: string) => apiClient.get<any>(`research/${key}`),
};
