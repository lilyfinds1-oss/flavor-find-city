
-- Create ai_settings table for dynamic model configuration
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_model text NOT NULL DEFAULT 'gemini-1.5-flash',
  vision_model text NOT NULL DEFAULT 'gemini-1.5-pro',
  recommendation_model text NOT NULL DEFAULT 'gemini-1.5-pro',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.ai_settings (default_model, vision_model, recommendation_model)
VALUES ('gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-pro');

-- RLS
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI settings publicly readable" ON public.ai_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage AI settings" ON public.ai_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create user_activity table for personalized recommendations
CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_activity_user ON public.user_activity (user_id, created_at DESC);
CREATE INDEX idx_user_activity_type ON public.user_activity (activity_type);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own activity" ON public.user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own activity" ON public.user_activity FOR SELECT USING (auth.uid() = user_id);

-- Add AI description columns to restaurants
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS ai_description_short text,
  ADD COLUMN IF NOT EXISTS ai_description_long text,
  ADD COLUMN IF NOT EXISTS ai_vibe_tags text[] DEFAULT '{}'::text[];
