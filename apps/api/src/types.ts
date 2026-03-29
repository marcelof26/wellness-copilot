// ─── User & Profile ───────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  date_of_birth: string | null;
  sex: 'male' | 'female' | 'other' | null;
  primary_goal: HealthGoal | null;
  focus_lock_until: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Health Goals ─────────────────────────────────────────────────────────────

export type HealthGoal =
  | 'energy'
  | 'sleep_recovery'
  | 'metabolism'
  | 'longevity_prevention'
  | 'performance';

export interface GoalScore {
  goal: HealthGoal;
  score: number; // 0–100
  label: string;
  contributing_biomarkers: string[];
  summary: string;
}

// ─── Biomarkers ───────────────────────────────────────────────────────────────

export interface BiomarkerDefinition {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  unit: string;
  alternative_units: string[];
  reference_range_low: number | null;
  reference_range_high: number | null;
  optimal_low: number | null;
  optimal_high: number | null;
  goals: HealthGoal[];
  description: string | null;
  created_at: string;
}

export interface BiomarkerEducation {
  id: string;
  biomarker_id: string;
  plain_language_name: string;
  what_it_measures: string;
  why_it_matters: string;
  how_to_improve: string;
  created_at: string;
}

export interface BiomarkerResult {
  id: string;
  user_id: string;
  document_id: string;
  biomarker_id: string | null;
  raw_name: string;
  normalized_name: string | null;
  value: number;
  unit: string;
  normalized_value: number | null;
  normalized_unit: string | null;
  reference_range_low: number | null;
  reference_range_high: number | null;
  status: 'optimal' | 'normal' | 'borderline' | 'abnormal' | 'unknown';
  confidence_score: number;
  lab_date: string;
  created_at: string;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  parse_status: 'pending' | 'processing' | 'completed' | 'failed';
  parse_error: string | null;
  lab_date: string | null;
  lab_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParsedLabDocument {
  lab_date: string | null;
  lab_name: string | null;
  patient_name: string | null;
  biomarkers: ParsedBiomarker[];
}

export interface ParsedBiomarker {
  name: string;
  value: number;
  unit: string;
  reference_range_low: number | null;
  reference_range_high: number | null;
  raw_text?: string;
  source_row_text: string;
}

export interface ValidatedBiomarker {
  raw_name: string;
  canonical_name: string | null;
  value: number;
  unit: string;
  reference_range_text: string | null;
  reference_range_low: number | null;
  reference_range_high: number | null;
  source_row_text: string;
  extraction_confidence: 'high' | 'medium' | 'low';
  validation_notes: string[];
}

// ─── Check-ins ────────────────────────────────────────────────────────────────

export interface CheckIn {
  id: string;
  user_id: string;
  energy_level: number | null; // 1–10
  sleep_quality: number | null; // 1–10
  stress_level: number | null; // 1–10
  mood: number | null; // 1–10
  notes: string | null;
  checked_in_at: string;
  created_at: string;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface Recommendation {
  id: string;
  user_id: string;
  goal: HealthGoal;
  title: string;
  body: string;
  action_type: 'lifestyle' | 'nutrition' | 'supplement' | 'medical_followup';
  priority_score: number;
  is_active: boolean;
  generated_at: string;
  expires_at: string | null;
  created_at: string;
}

// ─── Priority ─────────────────────────────────────────────────────────────────

export interface PriorityState {
  id: string;
  user_id: string;
  primary_goal: HealthGoal;
  secondary_goals: HealthGoal[];
  goal_scores: GoalScore[];
  focus_lock_until: string | null;
  user_preference_boost: HealthGoal | null;
  recalculated_at: string;
  created_at: string;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export type TimelineEventType =
  | 'lab_upload'
  | 'check_in'
  | 'goal_change'
  | 'recommendation_generated'
  | 'weekly_review';

export interface TimelineEvent {
  id: string;
  user_id: string;
  event_type: TimelineEventType;
  title: string;
  summary: string | null;
  metadata: Record<string, unknown>;
  event_date: string;
  created_at: string;
}

// ─── Weekly Review ────────────────────────────────────────────────────────────

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  summary_bullets: string[];
  focus_changed: boolean;
  new_primary_goal: HealthGoal | null;
  previous_primary_goal: HealthGoal | null;
  created_at: string;
}

// ─── Follow-up Questions ──────────────────────────────────────────────────────

export interface FollowUpQuestion {
  id: string;
  text: string;
  type: 'scale' | 'boolean' | 'multiple_choice' | 'open';
  options?: string[];
  goal_relevance: HealthGoal[];
}

export interface FollowUpSession {
  id: string;
  user_id: string;
  goal: HealthGoal;
  questions: FollowUpQuestion[];
  answers: Record<string, unknown>;
  completed_at: string | null;
  created_at: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}
