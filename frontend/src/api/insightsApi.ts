/**
 * ASTRA HEALTH - AI Health Insights & ML Anomaly Inference API Service
 */

import { apiClient } from './client';

export interface VitalsAnalysisPayload {
  heart_rate_bpm: number;
  spo2_pct: number;
  systolic_bp_mmhg: number;
  diastolic_bp_mmhg: number;
  pulse_pressure_mmhg?: number;
  map_mmhg?: number;
}

export interface VitalsAnalysisResponse {
  is_anomaly: boolean;
  prediction_label: 'nominal' | 'anomaly';
  decision_score: number;
  normalized_anomaly_score: number;
  severity: 'nominal' | 'mild_anomaly' | 'moderate_anomaly' | 'critical_anomaly';
  summary_message: string;
  features_analyzed?: Record<string, number>;
  derived_features?: Record<string, number>;
  baseline_comparison?: Record<
    string,
    {
      observed_value: number;
      baseline_mean: number;
      baseline_std: number;
      z_score: number;
    }
  >;
  metadata?: {
    model_type: string;
    model_version: string;
    contamination: number;
    timestamp_utc: string;
  };
  warnings?: string[];
  disclaimer: string;
}

export const insightsApi = {
  /**
   * Submits vital biometrics to the Isolation Forest anomaly detector.
   */
  analyze: async (payload: VitalsAnalysisPayload): Promise<VitalsAnalysisResponse> => {
    return apiClient.post<VitalsAnalysisResponse>('/insights/analyze', payload);
  },
};
