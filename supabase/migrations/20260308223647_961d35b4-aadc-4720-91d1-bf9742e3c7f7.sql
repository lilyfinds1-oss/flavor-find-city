
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS ai_quality_score integer,
  ADD COLUMN IF NOT EXISTS ai_moderation_notes text;

ALTER TABLE public.reviews ALTER COLUMN status SET DEFAULT 'pending'::review_status;
