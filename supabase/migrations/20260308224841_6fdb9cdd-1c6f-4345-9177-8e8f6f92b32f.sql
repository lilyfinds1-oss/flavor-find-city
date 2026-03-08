-- Add new columns to restaurants
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ambience text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS short_description text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS popular_dishes text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS embedding vector(1536) DEFAULT NULL;

-- Add moderation category columns to reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS ai_spam_score integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_toxic_score integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_moderation_category text DEFAULT NULL;

-- Create the vector similarity search function
CREATE OR REPLACE FUNCTION public.match_restaurants(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  neighborhood text,
  cuisines cuisine_type[],
  price_range price_range,
  average_rating numeric,
  total_reviews integer,
  cover_image text,
  is_halal boolean,
  has_delivery boolean,
  signature_dishes text[],
  description text,
  tags text[],
  ambience text,
  short_description text,
  popular_dishes text[],
  similarity float
)
LANGUAGE plpgsql STABLE
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.slug,
    r.neighborhood,
    r.cuisines,
    r.price_range,
    r.average_rating,
    r.total_reviews,
    r.cover_image,
    r.is_halal,
    r.has_delivery,
    r.signature_dishes,
    r.description,
    r.tags,
    r.ambience,
    r.short_description,
    r.popular_dishes,
    (1 - (r.embedding <=> query_embedding))::float AS similarity
  FROM public.restaurants r
  WHERE r.is_active = true
    AND r.embedding IS NOT NULL
    AND (1 - (r.embedding <=> query_embedding))::float > match_threshold
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;