-- Create the profiles table to store user roles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the assessments table to store assessment submissions
CREATE TABLE public.assessments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the training_plans table to store generated training plans
CREATE TABLE public.training_plans (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_details JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row-Level Security (RLS) for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to manage their own data
CREATE POLICY "Allow users to view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to manage their own assessments" ON public.assessments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow users to manage their own training plans" ON public.training_plans
  FOR ALL USING (auth.uid() = user_id);
