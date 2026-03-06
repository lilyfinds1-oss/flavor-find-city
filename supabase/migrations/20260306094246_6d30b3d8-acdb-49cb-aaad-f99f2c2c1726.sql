
-- Fix the overly permissive INSERT policy on notifications
DROP POLICY "System can create notifications" ON public.notifications;
CREATE POLICY "Users can receive notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
