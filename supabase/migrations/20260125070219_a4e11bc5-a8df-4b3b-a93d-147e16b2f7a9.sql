-- Fix function search path for calculate_ranking_score
CREATE OR REPLACE FUNCTION public.calculate_ranking_score(restaurant_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  score DECIMAL;
  r RECORD;
BEGIN
  SELECT * INTO r FROM public.restaurants WHERE id = restaurant_id;
  
  score := (
    (COALESCE(r.google_rating, 0) / 5.0 * 30) +
    (LEAST(COALESCE(r.internal_votes, 0), 100) / 100.0 * 25) +
    (COALESCE(r.average_rating, 0) / 5.0 * 25) +
    (LEAST(COALESCE(r.tiktok_trend_score, 0), 100) / 100.0 * 20)
  );
  
  RETURN score;
END;
$$;

-- Drop overly permissive newsletter policy and create proper one
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);