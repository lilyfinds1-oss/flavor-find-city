
-- Add onboarding preference columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS favorite_cuisines text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_neighborhoods text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
