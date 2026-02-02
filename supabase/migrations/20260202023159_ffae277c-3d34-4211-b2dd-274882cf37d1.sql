-- Create avatars storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update reviews RLS: Only writers, moderators, and admins can create reviews
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

CREATE POLICY "Writers can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    public.has_role(auth.uid(), 'writer') OR
    public.has_role(auth.uid(), 'moderator') OR
    public.has_role(auth.uid(), 'admin')
  )
);

-- Moderators and admins can view all reviews (including pending)
CREATE POLICY "Moderators can view all reviews"
ON public.reviews FOR SELECT
USING (
  public.has_role(auth.uid(), 'moderator') OR
  public.has_role(auth.uid(), 'admin')
);