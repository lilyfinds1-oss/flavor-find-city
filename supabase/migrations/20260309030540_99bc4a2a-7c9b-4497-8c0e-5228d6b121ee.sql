
-- Trigger: notify when a review is approved
CREATE OR REPLACE FUNCTION public.notify_review_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.user_id,
      'review_approved',
      'Review Approved! 🎉',
      'Your review has been approved and is now visible to the community.',
      '/restaurant/' || (SELECT slug FROM public.restaurants WHERE id = NEW.restaurant_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_approved
  AFTER UPDATE OF status ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_review_approved();

-- Trigger: notify when XP is earned
CREATE OR REPLACE FUNCTION public.notify_xp_earned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.amount > 0 THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.user_id,
      'xp_earned',
      'XP Earned! ⭐',
      'You earned ' || NEW.amount || ' XP for ' || NEW.action || '.',
      '/profile'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_xp_earned
  AFTER INSERT ON public.xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_xp_earned();

-- Trigger: notify all users when a new deal goes live (limited to recent users)
CREATE OR REPLACE FUNCTION public.notify_new_deal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r_name TEXT;
  user_record RECORD;
BEGIN
  IF NEW.is_active = true THEN
    SELECT name INTO r_name FROM public.restaurants WHERE id = NEW.restaurant_id;
    
    -- Notify users who have saved this restaurant
    FOR user_record IN 
      SELECT DISTINCT user_id FROM public.saved_restaurants WHERE restaurant_id = NEW.restaurant_id
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (
        user_record.user_id,
        'new_deal',
        'New Deal! 🎁',
        NEW.title || ' at ' || COALESCE(r_name, 'a restaurant') || '.',
        '/deals'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_deal
  AFTER INSERT ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_deal();
