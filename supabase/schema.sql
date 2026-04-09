-- ─────────────────────────────────────────────────────────────────
-- OpenNEtrikkan Simulator — Full Schema with Auth
-- Run this entire file in Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────

-- Profiles: extends auth.users with business fields
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name        TEXT NOT NULL,
  company     TEXT NOT NULL,
  title       TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation runs linked to auth user
CREATE TABLE IF NOT EXISTS public.simulation_runs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label           TEXT,
  params          JSONB NOT NULL,
  results         JSONB NOT NULL,
  avail_mean      NUMERIC(6,2),
  grm_mean        NUMERIC(6,3),
  delay_mean      NUMERIC(6,2),
  stockout_mean   NUMERIC(6,2),
  trials          INTEGER,
  ran_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sim_runs_user_id ON public.simulation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_sim_runs_ran_at  ON public.simulation_runs(ran_at DESC);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own runs"
  ON public.simulation_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own runs"
  ON public.simulation_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users delete own runs"
  ON public.simulation_runs FOR DELETE USING (auth.uid() = user_id);

-- ── Auto-create profile on signup ────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, company, title, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name',    'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'company', 'Unknown'),
    NEW.raw_user_meta_data->>'title',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Admin leads view ─────────────────────────────────────────────
CREATE OR REPLACE VIEW public.leads_dashboard AS
  SELECT
    p.id,
    p.name,
    u.email,
    p.company,
    p.title,
    p.phone,
    p.created_at,
    COUNT(r.id)                      AS run_count,
    MAX(r.ran_at)                    AS last_run_at,
    AVG(r.avail_mean)::NUMERIC(6,2)  AS avg_avail,
    AVG(r.grm_mean)::NUMERIC(6,3)   AS avg_grm
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.simulation_runs r ON r.user_id = p.id
  GROUP BY p.id, p.name, u.email, p.company, p.title, p.phone, p.created_at
  ORDER BY p.created_at DESC;
