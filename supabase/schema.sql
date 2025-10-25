-- Supabase Database Schema for Rumo
-- Run this in your Supabase SQL Editor after creating a new project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USER PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'counselor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- STUDENT PROFILES TABLE
-- =============================================
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Basic Info
  country_of_origin TEXT,
  current_grade TEXT CHECK (current_grade IN ('9th', '10th', '11th', '12th')),
  application_cycle TEXT,

  -- Academic Stats
  gpa DECIMAL(3,2) NOT NULL,
  test_score INTEGER CHECK (test_score >= 400 AND test_score <= 1600),
  intended_major TEXT NOT NULL,

  -- Arrays
  languages TEXT[] NOT NULL DEFAULT '{}',
  extracurriculars TEXT[] NOT NULL DEFAULT '{}',
  dream_schools TEXT[] NOT NULL DEFAULT '{}',

  -- Preferences
  budget INTEGER,
  location_preference TEXT CHECK (location_preference IN ('urban', 'suburban', 'rural')),
  research_preference TEXT CHECK (research_preference IN ('research-heavy', 'teaching-focused', 'balanced')),
  campus_size TEXT CHECK (campus_size IN ('small', 'medium', 'large')),

  -- AI Generated Profile Summary
  profile_summary JSONB,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

-- =============================================
-- SCHOOLS TABLE (User's saved schools)
-- =============================================
CREATE TABLE public.user_schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  school_id TEXT NOT NULL,
  school_name TEXT NOT NULL,
  school_data JSONB NOT NULL, -- Store full school data
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, school_id)
);

-- =============================================
-- ESSAYS/DRAFTS TABLE WITH VERSION CONTROL
-- =============================================
CREATE TABLE public.essays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT, -- The essay prompt
  school_name TEXT, -- Which school this essay is for
  category TEXT, -- 'personal-statement', 'supplement', 'why-us', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Essay versions/revisions table
CREATE TABLE public.essay_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  essay_id UUID REFERENCES public.essays(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  notes TEXT, -- Counselor or self notes about this version

  UNIQUE(essay_id, version_number)
);

-- =============================================
-- TIMELINE/TASKS TABLE
-- =============================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  category TEXT CHECK (category IN ('essays', 'testing', 'recommendations', 'financial', 'application')),
  source TEXT, -- Which school or entity this task is for
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ESSAY PROMPTS CACHE TABLE
-- =============================================
CREATE TABLE public.essay_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id TEXT NOT NULL,
  school_name TEXT NOT NULL,
  application_cycle TEXT NOT NULL, -- 'Fall 2025', 'Fall 2026', etc.
  prompt_type TEXT NOT NULL, -- 'common-app', 'supplement', 'coalition', etc.
  prompt_title TEXT,
  prompt_text TEXT NOT NULL,
  word_limit INTEGER,
  required BOOLEAN DEFAULT true,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ,
  source_url TEXT,

  UNIQUE(school_id, application_cycle, prompt_type, prompt_title)
);

-- =============================================
-- DEADLINES CACHE TABLE
-- =============================================
CREATE TABLE public.deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id TEXT NOT NULL,
  school_name TEXT NOT NULL,
  application_cycle TEXT NOT NULL,
  deadline_type TEXT NOT NULL, -- 'early-decision', 'early-action', 'regular-decision', 'test-scores', etc.
  deadline_date DATE NOT NULL,
  deadline_time TIME,
  timezone TEXT DEFAULT 'America/New_York',
  notes TEXT,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ,
  source_url TEXT,

  UNIQUE(school_id, application_cycle, deadline_type)
);

-- =============================================
-- FIT OVERVIEW TABLE
-- =============================================
CREATE TABLE public.fit_overviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  fit_data JSONB NOT NULL, -- Store reach, target, safety schools with rationales
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fit_overviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Student Profiles: Users can manage their own student profile
CREATE POLICY "Users can view own student profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own student profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own student profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- User Schools: Users can manage their saved schools
CREATE POLICY "Users can manage own schools"
  ON public.user_schools FOR ALL
  USING (auth.uid() = user_id);

-- Essays: Users can manage their own essays
CREATE POLICY "Users can manage own essays"
  ON public.essays FOR ALL
  USING (auth.uid() = user_id);

-- Essay Versions: Users can manage versions of their essays
CREATE POLICY "Users can manage own essay versions"
  ON public.essay_versions FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.essays WHERE id = essay_id));

-- Tasks: Users can manage their own tasks
CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id);

-- Fit Overviews: Users can manage their own fit overview
CREATE POLICY "Users can manage own fit overview"
  ON public.fit_overviews FOR ALL
  USING (auth.uid() = user_id);

-- Essay Prompts and Deadlines: Public read access (cached data)
ALTER TABLE public.essay_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read essay prompts"
  ON public.essay_prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read deadlines"
  ON public.deadlines FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.essays
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX idx_user_schools_user_id ON public.user_schools(user_id);
CREATE INDEX idx_essays_user_id ON public.essays(user_id);
CREATE INDEX idx_essay_versions_essay_id ON public.essay_versions(essay_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_essay_prompts_school_cycle ON public.essay_prompts(school_id, application_cycle);
CREATE INDEX idx_deadlines_school_cycle ON public.deadlines(school_id, application_cycle);
CREATE INDEX idx_fit_overviews_user_id ON public.fit_overviews(user_id);
