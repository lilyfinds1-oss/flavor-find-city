INSERT INTO public.app_config (key, value, description)
VALUES ('openai_api_key', NULL, 'OpenAI API key for AI search, moderation, embeddings and blog generation')
ON CONFLICT (key) DO NOTHING;