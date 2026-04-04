/* Global TypeScript types for the Livestock Tracker system */

export interface User {
  id: number;
  email: string;
  full_name: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: number;
  animal_uid: string;
  name: string | null;
  species: string;
  breed: string | null;
  date_of_birth: string | null;
  gender: string;
  weight: number | null;
  growth_stage: string | null;
  status: string;
  owner_id: number;
  owner_name: string;
  registered_by: number;
  qr_code_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnimalDetail extends Animal {
  health_records_count: number;
  treatments_count: number;
  vaccinations_count: number;
  movements_count: number;
}

export interface HealthRecord {
  id: number;
  animal_id: number;
  animal_uid: string;
  record_type: string;
  description: string;
  severity: string | null;
  diagnosis: string | null;
  record_date: string;
  recorded_by: number;
  recorder_name: string;
  created_at: string;
}

export interface Treatment {
  id: number;
  animal_id: number;
  animal_uid: string;
  health_record_id: number | null;
  treatment_type: string;
  medication: string | null;
  dosage: string | null;
  treatment_date: string;
  next_treatment_date: string | null;
  administered_by: string | null;
  recorded_by: number;
  recorder_name: string;
  notes: string | null;
  created_at: string;
}

export interface Vaccination {
  id: number;
  animal_id: number;
  animal_uid: string;
  vaccine_name: string;
  batch_number: string | null;
  vaccination_date: string;
  next_due_date: string | null;
  administered_by: string | null;
  recorded_by: number;
  recorder_name: string;
  notes: string | null;
  created_at: string;
}

export interface Movement {
  id: number;
  animal_id: number;
  animal_uid: string;
  movement_type: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  arrival_date: string | null;
  handler: string | null;
  transport_method: string | null;
  purpose: string | null;
  buyer_info: string | null;
  recorded_by: number;
  recorder_name: string;
  notes: string | null;
  created_at: string;
}

export interface TimelineEvent {
  event_type: string;
  title: string;
  description: string;
  date: string;
  details: Record<string, string | null>;
}

export interface DashboardStats {
  total_animals: number;
  active_animals: number;
  deceased_animals: number;
  sold_animals: number;
  recent_registrations: number;
  health_alerts: number;
  upcoming_vaccinations: number;
  total_users?: number;
  species_breakdown: { species: string; count: number }[];
  growth_stage_breakdown: { stage: string; count: number }[];
}

export interface ActivityItem {
  type: string;
  title: string;
  description: string;
  date: string;
  animal_uid?: string;
  severity?: string;
}

export interface PaginatedResponse<T> {
  animals: T[];
  total: number;
  page: number;
  per_page: number;
}
