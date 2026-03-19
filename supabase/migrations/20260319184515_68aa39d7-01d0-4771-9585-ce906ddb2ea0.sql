-- Add foreign key from community_posts.user_id to profiles.id
ALTER TABLE public.community_posts
ADD CONSTRAINT community_posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from community_comments.user_id to profiles.id
ALTER TABLE public.community_comments
ADD CONSTRAINT community_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;