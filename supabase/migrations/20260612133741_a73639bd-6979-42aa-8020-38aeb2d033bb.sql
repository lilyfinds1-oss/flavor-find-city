
-- 1. ai_settings: restrict public read
DROP POLICY IF EXISTS "AI settings publicly readable" ON public.ai_settings;
CREATE POLICY "Authenticated users can view AI settings"
ON public.ai_settings FOR SELECT
TO authenticated
USING (true);

-- 2. app_config: restrict public read to whitelisted non-secret keys only
DROP POLICY IF EXISTS "Config is publicly readable" ON public.app_config;
CREATE POLICY "Public can read non-secret config keys"
ON public.app_config FOR SELECT
USING (key IN ('mapbox_public_token', 'stripe_publishable_key'));

-- 3. restaurant_subscriptions: remove user-level UPDATE to block self-upgrade
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.restaurant_subscriptions;
-- Admin ALL policy and service-role access remain; webhooks/edge functions handle plan changes.

-- 4. storage review-photos: enforce per-user folder on INSERT and add UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can upload review photos" ON storage.objects;
CREATE POLICY "Users can upload review photos to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-photos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can update own review photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-photos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'review-photos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
