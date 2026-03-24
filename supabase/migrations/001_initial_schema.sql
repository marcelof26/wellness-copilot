-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS weekly_reviews CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS priority_states CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS biomarker_results CASCADE;
DROP TABLE IF EXISTS biomarker_education CASCADE;
DROP TABLE IF EXISTS biomarker_definitions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  primary_goal TEXT CHECK (primary_goal IN ('energy','sleep_recovery','metabolism','longevity_prevention','performance')),
  focus_lock_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Documents ────────────────────────────────────────────────────────────────
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  parse_status TEXT DEFAULT 'pending' CHECK (parse_status IN ('pending','processing','completed','failed')),
  parse_error TEXT,
  lab_date DATE,
  lab_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Biomarker Definitions ────────────────────────────────────────────────────
CREATE TABLE biomarker_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  aliases TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  alternative_units TEXT[] DEFAULT '{}',
  reference_range_low NUMERIC,
  reference_range_high NUMERIC,
  optimal_low NUMERIC,
  optimal_high NUMERIC,
  goals TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Biomarker Education ──────────────────────────────────────────────────────
CREATE TABLE biomarker_education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  biomarker_id UUID REFERENCES biomarker_definitions(id) ON DELETE CASCADE NOT NULL,
  plain_language_name TEXT NOT NULL,
  what_it_measures TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  how_to_improve TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Biomarker Results ────────────────────────────────────────────────────────
CREATE TABLE biomarker_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  biomarker_id UUID REFERENCES biomarker_definitions(id),
  raw_name TEXT NOT NULL,
  normalized_name TEXT,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  normalized_value NUMERIC,
  normalized_unit TEXT,
  reference_range_low NUMERIC,
  reference_range_high NUMERIC,
  status TEXT DEFAULT 'unknown' CHECK (status IN ('optimal','normal','borderline','abnormal','unknown')),
  confidence_score NUMERIC DEFAULT 0,
  lab_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Check-ins ────────────────────────────────────────────────────────────────
CREATE TABLE check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  notes TEXT,
  checked_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Recommendations ──────────────────────────────────────────────────────────
CREATE TABLE recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL CHECK (goal IN ('energy','sleep_recovery','metabolism','longevity_prevention','performance')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('lifestyle','nutrition','supplement','medical_followup')),
  priority_score NUMERIC DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Priority States ──────────────────────────────────────────────────────────
CREATE TABLE priority_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  primary_goal TEXT NOT NULL CHECK (primary_goal IN ('energy','sleep_recovery','metabolism','longevity_prevention','performance')),
  secondary_goals TEXT[] DEFAULT '{}',
  goal_scores JSONB DEFAULT '[]',
  focus_lock_until TIMESTAMPTZ,
  user_preference_boost TEXT,
  recalculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Timeline Events ──────────────────────────────────────────────────────────
CREATE TABLE timeline_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('lab_upload','check_in','goal_change','recommendation_generated','weekly_review')),
  title TEXT NOT NULL,
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  event_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Weekly Reviews ───────────────────────────────────────────────────────────
CREATE TABLE weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_start TIMESTAMPTZ NOT NULL,
  week_end TIMESTAMPTZ NOT NULL,
  summary_bullets TEXT[] DEFAULT '{}',
  focus_changed BOOLEAN DEFAULT FALSE,
  new_primary_goal TEXT,
  previous_primary_goal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Biomarker results policies
CREATE POLICY "Users can view own biomarker results" ON biomarker_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own biomarker results" ON biomarker_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view own check-ins" ON check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own check-ins" ON check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON recommendations FOR UPDATE USING (auth.uid() = user_id);

-- Priority states policies
CREATE POLICY "Users can view own priority" ON priority_states FOR SELECT USING (auth.uid() = user_id);

-- Timeline events policies
CREATE POLICY "Users can view own timeline" ON timeline_events FOR SELECT USING (auth.uid() = user_id);

-- Weekly reviews policies
CREATE POLICY "Users can view own weekly reviews" ON weekly_reviews FOR SELECT USING (auth.uid() = user_id);

-- Biomarker definitions are public (read-only)
ALTER TABLE biomarker_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Biomarker definitions are public" ON biomarker_definitions FOR SELECT USING (TRUE);
CREATE POLICY "Biomarker education is public" ON biomarker_education FOR SELECT USING (TRUE);

-- Storage bucket for lab documents
INSERT INTO storage.buckets (id, name, public) VALUES ('lab-documents', 'lab-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own lab documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'lab-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own lab documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'lab-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
