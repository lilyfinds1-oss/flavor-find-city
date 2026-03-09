
-- Fix: Allow all authenticated users to submit reviews (not just writers)
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Writers can create reviews" ON public.reviews;

-- Create a new policy allowing any authenticated user to insert reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
