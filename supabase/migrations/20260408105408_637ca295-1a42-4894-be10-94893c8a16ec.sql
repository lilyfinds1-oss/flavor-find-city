CREATE POLICY "Restaurant owners can view deal redemptions"
ON public.deal_redemptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.deals d
    JOIN public.restaurant_claims rc ON rc.restaurant_id = d.restaurant_id
    WHERE d.id = deal_redemptions.deal_id
      AND rc.user_id = auth.uid()
      AND rc.status = 'approved'
  )
);