/**
 * ASTRA HEALTH - Universal API Client
 * Wraps browser Fetch API with error normalization and configuration management.
 */

import { ApiErrorResponse, ValidationErrorDetail } from './types';

// Read API Base URL from Vite environment or fallback to relative /api/v1 (supports Vite proxy and remote tunnels)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiClientError extends Error {
  public status: number;
  public details?: ValidationErrorDetail[];
  public rawResponse?: any;

  constructor(message: string, status: number, details?: ValidationErrorDetail[], rawResponse?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
    this.rawResponse = rawResponse;
  }
}

/**
 * Normalizes FastAPI detail structures into a clean human-readable error string.
 */
function formatErrorMessage(status: number, data?: ApiErrorResponse): string {
  if (!data) {
    return `Network or server error (HTTP ${status})`;
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map(err => {
        const field = err.loc ? err.loc.slice(1).join('.') : 'Field';
        return `${field}: ${err.msg}`;
      })
      .join('; ');
  }

  if (data.message) {
    return data.message;
  }

  return `Request failed with status code ${status}`;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  // Read optional auth credentials from session storage (if demo authentication is enabled)
  const authHeader = sessionStorage.getItem('astra_demo_auth');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(authHeader ? { 'Authorization': authHeader } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get('content-type');
    let responseData: any = null;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const details = Array.isArray(responseData?.detail) ? responseData.detail : undefined;
      const message = formatErrorMessage(response.status, responseData);
      throw new ApiClientError(message, response.status, details, responseData);
    }

    return responseData as T;
  } catch (err: any) {
    if (err instanceof ApiClientError) {
      throw err;
    }

    // Network disconnection, CORS failure, or connection refused
    const fallbackMessage =
      `Unable to reach ASTRA HEALTH backend at ${BASE_URL}. Ensure the FastAPI server is online and reachable.`;
    throw new ApiClientError(fallbackMessage, 0, undefined, err);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: 'GET', headers }),

  post: <T>(endpoint: string, body?: any, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  put: <T>(endpoint: string, body?: any, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  delete: <T>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: 'DELETE', headers }),
};
