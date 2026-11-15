/**
 * ASTRA HEALTH - Clinical Health Assessment API Service
 */

import { apiClient } from './client';
import {
  HealthAssessmentCreate,
  HealthAssessmentUpdate,
  HealthAssessmentResponse,
} from './types';

export const assessmentsApi = {
  /**
   * Submits a new clinical health assessment.
   */
  create: async (data: HealthAssessmentCreate): Promise<HealthAssessmentResponse> => {
    return apiClient.post<HealthAssessmentResponse>('/assessments/', data);
  },

  /**
   * Lists health assessments, optionally filtered by astronaut UUID.
   */
  list: async (astronautId?: string, skip: number = 0, limit: number = 100): Promise<HealthAssessmentResponse[]> => {
    const query = astronautId ? `?astronaut_id=${astronautId}&skip=${skip}&limit=${limit}` : `?skip=${skip}&limit=${limit}`;
    return apiClient.get<HealthAssessmentResponse[]>(`/assessments/${query}`);
  },

  /**
   * Retrieves an assessment evaluation by UUID.
   */
  getById: async (id: string): Promise<HealthAssessmentResponse> => {
    return apiClient.get<HealthAssessmentResponse>(`/assessments/${id}`);
  },

  /**
   * Updates an existing assessment evaluation.
   */
  update: async (id: string, data: HealthAssessmentUpdate): Promise<HealthAssessmentResponse> => {
    return apiClient.put<HealthAssessmentResponse>(`/assessments/${id}`, data);
  },
};
