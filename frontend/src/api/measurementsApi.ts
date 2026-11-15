/**
 * ASTRA HEALTH - Physiological Telemetry Measurement API Service
 */

import { apiClient } from './client';
import {
  HealthMeasurementCreate,
  HealthMeasurementResponse,
} from './types';

export const measurementsApi = {
  /**
   * Records a physiological biometric telemetry event.
   */
  create: async (data: HealthMeasurementCreate): Promise<HealthMeasurementResponse> => {
    return apiClient.post<HealthMeasurementResponse>('/measurements/', data);
  },

  /**
   * Records multiple physiological biometric telemetry events in a single batch.
   */
  createBatch: async (data: HealthMeasurementCreate[]): Promise<HealthMeasurementResponse[]> => {
    return apiClient.post<HealthMeasurementResponse[]>('/measurements/batch', data);
  },

  /**
   * Lists telemetry records with optional filtering.
   */
  list: async (
    astronautId?: string,
    isSimulated?: boolean,
    skip: number = 0,
    limit: number = 100
  ): Promise<HealthMeasurementResponse[]> => {
    const params = new URLSearchParams();
    if (astronautId) params.append('astronaut_id', astronautId);
    if (isSimulated !== undefined) params.append('is_simulated', String(isSimulated));
    params.append('skip', String(skip));
    params.append('limit', String(limit));

    return apiClient.get<HealthMeasurementResponse[]>(`/measurements/?${params.toString()}`);
  },

  /**
   * Retrieves telemetry history specifically for an astronaut.
   */
  getByAstronaut: async (
    astronautId: string,
    skip: number = 0,
    limit: number = 100,
    startDate?: string,
    endDate?: string
  ): Promise<HealthMeasurementResponse[]> => {
    const params = new URLSearchParams();
    params.append('skip', String(skip));
    params.append('limit', String(limit));
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get<HealthMeasurementResponse[]>(
      `/measurements/astronaut/${astronautId}?${params.toString()}`
    );
  },

  /**
   * Retrieves a single measurement event by UUID.
   */
  getById: async (id: string): Promise<HealthMeasurementResponse> => {
    return apiClient.get<HealthMeasurementResponse>(`/measurements/${id}`);
  },
};
