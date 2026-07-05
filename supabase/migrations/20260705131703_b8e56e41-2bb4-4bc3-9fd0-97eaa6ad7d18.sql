
-- Ensure the referrals table has the grants needed by the trigger/service role
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

-- Replace handle_new_user to also process referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  ref_code TEXT;
  ref_user_id UUID;
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)), ' ', '_')),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Referral handling
  ref_code := NEW.raw_user_meta_data->>'referral_code';
  IF ref_code IS NOT NULL AND length(trim(ref_code)) > 0 THEN
    SELECT id INTO ref_user_id
    FROM public.profiles
    WHERE referral_code = upper(trim(ref_code))
    LIMIT 1;

    IF ref_user_id IS NOT NULL AND ref_user_id <> NEW.id THEN
      -- Record the referral
      INSERT INTO public.referrals (referrer_id, referred_id, xp_awarded)
      VALUES (ref_user_id, NEW.id, true)
      ON CONFLICT DO NOTHING;

      -- Increment referrer's counter
      UPDATE public.profiles
      SET total_referrals = COALESCE(total_referrals, 0) + 1
      WHERE id = ref_user_id;

      -- Mark who referred this new user
      UPDATE public.profiles
      SET referred_by = ref_user_id
      WHERE id = NEW.id;

      -- Award 50 XP to the referrer (notify_xp_earned trigger will send a notification)
      INSERT INTO public.xp_transactions (user_id, amount, action, metadata)
      VALUES (
        ref_user_id,
        50,
        'referral_signup',
        jsonb_build_object('referred_user_id', NEW.id)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
