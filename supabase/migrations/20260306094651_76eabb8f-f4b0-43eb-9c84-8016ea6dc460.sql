
-- 1. Restaurant owner claims table
CREATE TABLE public.restaurant_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  business_email TEXT NOT NULL,
  proof_description TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.restaurant_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
ON public.restaurant_claims FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims"
ON public.restaurant_claims FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can submit claims"
ON public.restaurant_claims FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update claims"
ON public.restaurant_claims FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2. Referral system
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  xp_awarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id);

CREATE POLICY "System can create referrals"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referred_id);

-- Generate referral codes for existing profiles
UPDATE public.profiles SET referral_code = UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8)) WHERE referral_code IS NULL;
