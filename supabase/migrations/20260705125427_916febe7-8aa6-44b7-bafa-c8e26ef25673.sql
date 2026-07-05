
-- 1) Remove self-insert on restaurant_subscriptions (privilege escalation)
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.restaurant_subscriptions;

-- 2) Tighten newsletter unsubscribe: user_id ownership only
DROP POLICY IF EXISTS "Users can manage own subscription" ON public.newsletter_subscribers;
CREATE POLICY "Users can manage own subscription"
ON public.newsletter_subscribers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- 3) Prevent secrets in app_config from being read by admins (or anyone) via SELECT.
--    Split the existing "ALL" admin policy into per-command policies so that SELECT
--    excludes stripe_secret_key and gemini_api_key.
DROP POLICY IF EXISTS "Admins can manage config" ON public.app_config;

CREATE POLICY "Admins can read non-secret config"
ON public.app_config
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND key NOT IN ('stripe_secret_key', 'gemini_api_key')
);

CREATE POLICY "Admins can insert config"
ON public.app_config
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update config"
ON public.app_config
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete config"
ON public.app_config
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4) Purge any previously stored plaintext secret values so they cannot leak.
DELETE FROM public.app_config WHERE key IN ('stripe_secret_key', 'gemini_api_key');
