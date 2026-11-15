/**
 * ASTRA HEALTH - TypeScript API Schemas and Data Types
 * Strict typing matching FastAPI backend Pydantic models.
 */

// ==========================================
// ASTRONAUT TYPES
// ==========================================

export interface AstronautBase {
  name: string;
  crew_id: string;
  role?: string;
  is_active?: boolean;
  notes?: string | null;
}

export interface AstronautCreate extends AstronautBase {}

export interface AstronautUpdate {
  name?: string;
  crew_id?: string;
  role?: string;
  is_active?: boolean;
  notes?: string | null;
}

export interface AstronautResponse extends AstronautBase {
  id: string; // UUID
  role: string;
  is_active: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

// ==========================================
// MISSION TYPES
// ==========================================

export type DestinationVector = 'ISS' | 'MOON' | 'MARS';

export interface MissionBase {
  name: string;
  destination: string;
  duration?: string | null;
  launch_date?: string | null; // YYYY-MM-DD
  environment?: string | null;
  astronaut_id?: string | null; // UUID
}

export interface MissionCreate extends MissionBase {}

export interface MissionUpdate {
  name?: string;
  destination?: string;
  duration?: string | null;
  launch_date?: string | null;
  environment?: string | null;
  astronaut_id?: string | null;
}

export interface MissionResponse extends MissionBase {
  id: string; // UUID
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

// ==========================================
// HEALTH ASSESSMENT TYPES
// ==========================================

export type AssessmentStatus = 'OPTIMAL' | 'ATTENTION_REQUIRED' | 'CRITICAL' | 'COMPLETED';

export interface HealthAssessmentBase {
  astronaut_id: string; // UUID
  assessment_date: string; // ISO datetime
  status: AssessmentStatus | string;
  summary?: string | null;
  baseline_heart_rate?: number | null;
  baseline_spo2?: number | null;
  baseline_temperature?: number | null;
  baseline_blood_pressure?: string | null; // e.g. "120/80"
  sleep_hours?: number | null;
  countermeasures_adherence?: string | null;
}

export interface HealthAssessmentCreate extends HealthAssessmentBase {}

export interface HealthAssessmentUpdate {
  assessment_date?: string;
  status?: string;
  summary?: string | null;
  baseline_heart_rate?: number | null;
  baseline_spo2?: number | null;
  baseline_temperature?: number | null;
  baseline_blood_pressure?: string | null;
  sleep_hours?: number | null;
  countermeasures_adherence?: string | null;
}

export interface HealthAssessmentResponse extends HealthAssessmentBase {
  id: string; // UUID
  created_at: string;
  updated_at: string;
}

// ==========================================
// HEALTH MEASUREMENT (TELEMETRY) TYPES
// ==========================================

export interface HealthMeasurementBase {
  astronaut_id: string; // UUID
  measured_at: string; // ISO datetime
  heart_rate_bpm?: number | null;
  blood_oxygen_pct?: number | null;
  body_temperature_celsius?: number | null;
  systolic_bp_mmhg?: number | null;
  diastolic_bp_mmhg?: number | null;
  source?: string;
  is_simulated?: boolean;
}

export interface HealthMeasurementCreate extends HealthMeasurementBase {}

export interface HealthMeasurementResponse extends HealthMeasurementBase {
  id: string; // UUID
  created_at: string;
}

// ==========================================
// API CLIENT & ERROR TYPES
// ==========================================

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiErrorResponse {
  detail?: string | ValidationErrorDetail[];
  message?: string;
}
