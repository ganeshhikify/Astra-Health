/**
 * ASTRA HEALTH - Aerospace Mission API Service
 */

import { apiClient } from './client';
import {
  MissionCreate,
  MissionUpdate,
  MissionResponse,
} from './types';

export const missionsApi = {
  /**
   * Registers a new mission configuration.
   */
  create: async (data: MissionCreate): Promise<MissionResponse> => {
    return apiClient.post<MissionResponse>('/missions/', data);
  },

  /**
   * Lists all configured aerospace missions.
   */
  list: async (skip: number = 0, limit: number = 100): Promise<MissionResponse[]> => {
    return apiClient.get<MissionResponse[]>(`/missions/?skip=${skip}&limit=${limit}`);
  },

  /**
   * Retrieves a mission configuration by UUID.
   */
  getById: async (id: string): Promise<MissionResponse> => {
    return apiClient.get<MissionResponse>(`/missions/${id}`);
  },

  /**
   * Finds the latest mission associated with an astronaut UUID.
   */
  findByAstronautId: async (astronautId: string): Promise<MissionResponse | null> => {
    const list = await missionsApi.list(0, 100);
    const found = list.find(m => m.astronaut_id === astronautId);
    return found || null;
  },

  /**
   * Updates an existing mission record.
   */
  update: async (id: string, data: MissionUpdate): Promise<MissionResponse> => {
    return apiClient.put<MissionResponse>(`/missions/${id}`, data);
  },

  /**
   * Deletes a mission by UUID.
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/missions/${id}`);
  },
};
