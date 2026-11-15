/**
 * ASTRA HEALTH - Astronaut Profile API Service
 */

import { apiClient } from './client';
import {
  AstronautCreate,
  AstronautUpdate,
  AstronautResponse,
} from './types';

export const astronautsApi = {
  /**
   * Registers a new astronaut operative.
   */
  create: async (data: AstronautCreate): Promise<AstronautResponse> => {
    return apiClient.post<AstronautResponse>('/astronauts/', data);
  },

  /**
   * Lists registered astronaut profiles with pagination.
   */
  list: async (skip: number = 0, limit: number = 100): Promise<AstronautResponse[]> => {
    return apiClient.get<AstronautResponse[]>(`/astronauts/?skip=${skip}&limit=${limit}`);
  },

  /**
   * Retrieves a single astronaut profile by UUID.
   */
  getById: async (id: string): Promise<AstronautResponse> => {
    return apiClient.get<AstronautResponse>(`/astronauts/${id}`);
  },

  /**
   * Finds an astronaut by crew ID (e.g. "AST-7824").
   */
  findByCrewId: async (crewId: string): Promise<AstronautResponse | null> => {
    const list = await astronautsApi.list(0, 100);
    const found = list.find(a => a.crew_id.trim().toUpperCase() === crewId.trim().toUpperCase());
    return found || null;
  },

  /**
   * Updates an astronaut profile by UUID.
   */
  update: async (id: string, data: AstronautUpdate): Promise<AstronautResponse> => {
    return apiClient.put<AstronautResponse>(`/astronauts/${id}`, data);
  },

  /**
   * Deletes an astronaut profile by UUID.
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/astronauts/${id}`);
  },
};
