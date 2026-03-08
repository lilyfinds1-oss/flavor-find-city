-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create AI response cache table
CREATE TABLE IF NOT EXISTS public.ai_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  cache_type text NOT NULL, -- 'search' or 'discovery'
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Index for fast lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON public.ai_cache (cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON public.ai_cache (expires_at);

-- RLS: only service role accesses this table (edge functions use service key)
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (via service role) full access; no user-facing policies needed
CREATE POLICY "Service role full access" ON public.ai_cache FOR ALL USING (true) WITH CHECK (true);

-- Function to trigger embedding generation on restaurant insert/update
CREATE OR REPLACE FUNCTION public.trigger_generate_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, extensions'
AS $$
DECLARE
  project_url text;
  anon_key text;
BEGIN
  -- Get project config
  SELECT value INTO project_url FROM public.app_config WHERE key = 'supabase_url';
  SELECT value INTO anon_key FROM public.app_config WHERE key = 'supabase_anon_key';
  
  -- Use env defaults if not in app_config
  IF project_url IS NULL THEN
    project_url := 'https://ypcsinlgsmrlnidsparm.supabase.co';
  END IF;
  IF anon_key IS NULL THEN
    anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwY3Npbmxnc21ybG5pZHNwYXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMjE0MDgsImV4cCI6MjA4NDg5NzQwOH0.NmKzaZDtoWuFr3cLJ3TzCF0IlhEHqDi8cNnuhJeqYyM';
  END IF;

  -- Fire async HTTP call to generate-embeddings function
  PERFORM net.http_post(
    url := project_url || '/functions/v1/generate-embeddings',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('restaurantId', NEW.id)
  );

  RETURN NEW;
END;
$$;

-- Trigger on insert or relevant column updates
CREATE TRIGGER trg_restaurant_generate_embedding
AFTER INSERT OR UPDATE OF name, description, short_description, cuisines, neighborhood, signature_dishes, popular_dishes, tags, ambience, price_range
ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.trigger_generate_embedding();