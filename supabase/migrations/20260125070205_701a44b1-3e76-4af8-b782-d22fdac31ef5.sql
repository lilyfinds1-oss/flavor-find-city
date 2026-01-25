-- Create custom types for the food discovery platform
CREATE TYPE public.cuisine_type AS ENUM (
  'american', 'italian', 'mexican', 'chinese', 'japanese', 'indian', 'thai', 
  'mediterranean', 'french', 'korean', 'vietnamese', 'middle_eastern', 
  'bbq', 'seafood', 'steakhouse', 'pizza', 'burger', 'cafe', 'bakery', 
  'desi', 'halal', 'vegetarian', 'vegan', 'fast_food', 'fine_dining', 'other'
);

CREATE TYPE public.price_range AS ENUM ('$', '$$', '$$$', '$$$$');

CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE public.deal_type AS ENUM ('percentage', 'fixed', 'bogo', 'free_item');

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Users profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  xp_points INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  total_photos INTEGER DEFAULT 0,
  is_verified_foodie BOOLEAN DEFAULT FALSE,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Toronto',
  neighborhood TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  website TEXT,
  instagram TEXT,
  tiktok TEXT,
  
  -- Cuisine and pricing
  cuisines cuisine_type[] DEFAULT '{}',
  price_range price_range DEFAULT '$$',
  
  -- Hours (JSON format for flexibility)
  hours JSONB DEFAULT '{}',
  
  -- Features
  is_halal BOOLEAN DEFAULT FALSE,
  is_vegetarian_friendly BOOLEAN DEFAULT FALSE,
  is_vegan_friendly BOOLEAN DEFAULT FALSE,
  is_family_friendly BOOLEAN DEFAULT FALSE,
  has_outdoor_seating BOOLEAN DEFAULT FALSE,
  has_delivery BOOLEAN DEFAULT FALSE,
  has_takeout BOOLEAN DEFAULT TRUE,
  has_reservations BOOLEAN DEFAULT FALSE,
  
  -- Media
  cover_image TEXT,
  photos TEXT[] DEFAULT '{}',
  
  -- Best dishes
  signature_dishes TEXT[] DEFAULT '{}',
  
  -- External signals (for ranking)
  google_rating DECIMAL(2, 1) DEFAULT 0,
  google_review_count INTEGER DEFAULT 0,
  tiktok_trend_score INTEGER DEFAULT 0,
  facebook_popularity INTEGER DEFAULT 0,
  
  -- Internal metrics
  internal_votes INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(2, 1) DEFAULT 0,
  
  -- Calculated ranking score
  ranking_score DECIMAL(5, 2) DEFAULT 0,
  city_rank INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_promoted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant categories junction table
CREATE TABLE public.restaurant_categories (
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (restaurant_id, category_id)
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  video_url TEXT,
  
  -- Verified visit indicator
  is_verified_visit BOOLEAN DEFAULT FALSE,
  
  -- Engagement
  helpful_votes INTEGER DEFAULT 0,
  
  -- XP earned from this review
  xp_earned INTEGER DEFAULT 0,
  
  -- Moderation
  status review_status DEFAULT 'approved',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table (for restaurant voting)
CREATE TABLE public.restaurant_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (restaurant_id, user_id)
);

-- Review helpful votes
CREATE TABLE public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (review_id, user_id)
);

-- Deals and coupons
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deal_type deal_type NOT NULL,
  discount_value DECIMAL(10, 2),
  code TEXT,
  terms TEXT,
  xp_cost INTEGER DEFAULT 0,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User deal redemptions
CREATE TABLE public.deal_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  xp_spent INTEGER DEFAULT 0,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- XP transactions log
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  action TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_subscribed BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Saved/favorited restaurants
CREATE TABLE public.saved_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, restaurant_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_restaurants ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies

-- Profiles: Public read, own write
CREATE POLICY "Profiles are publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles: Only admins can manage
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Categories: Public read, admin write
CREATE POLICY "Categories are publicly viewable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Restaurants: Public read, admin write
CREATE POLICY "Restaurants are publicly viewable" ON public.restaurants FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage restaurants" ON public.restaurants FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Restaurant categories: Public read
CREATE POLICY "Restaurant categories are publicly viewable" ON public.restaurant_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage restaurant categories" ON public.restaurant_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Reviews: Public read approved, users can write
CREATE POLICY "Approved reviews are publicly viewable" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Restaurant votes: Users can manage own votes
CREATE POLICY "Votes are publicly viewable" ON public.restaurant_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON public.restaurant_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON public.restaurant_votes FOR DELETE USING (auth.uid() = user_id);

-- Review votes: Users can manage own votes
CREATE POLICY "Review votes are viewable" ON public.review_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on reviews" ON public.review_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change own review vote" ON public.review_votes FOR UPDATE USING (auth.uid() = user_id);

-- Deals: Public read active deals
CREATE POLICY "Active deals are publicly viewable" ON public.deals FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage deals" ON public.deals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Deal redemptions: Users can view and create own
CREATE POLICY "Users can view own redemptions" ON public.deal_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can redeem deals" ON public.deal_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP transactions: Users can view own
CREATE POLICY "Users can view own XP" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create XP transactions" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Newsletter: Anyone can subscribe
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage own subscription" ON public.newsletter_subscribers FOR UPDATE USING (auth.uid() = user_id OR email = current_setting('request.jwt.claims', true)::json->>'email');

-- Saved restaurants: Users manage own
CREATE POLICY "Users can view own saved" ON public.saved_restaurants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save restaurants" ON public.saved_restaurants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave" ON public.saved_restaurants FOR DELETE USING (auth.uid() = user_id);

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update restaurant ranking
CREATE OR REPLACE FUNCTION public.calculate_ranking_score(restaurant_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  score DECIMAL;
  r RECORD;
BEGIN
  SELECT * INTO r FROM public.restaurants WHERE id = restaurant_id;
  
  -- Weighted scoring: 
  -- Google rating (30%), Internal votes (25%), Review quality (25%), Trend score (20%)
  score := (
    (COALESCE(r.google_rating, 0) / 5.0 * 30) +
    (LEAST(COALESCE(r.internal_votes, 0), 100) / 100.0 * 25) +
    (COALESCE(r.average_rating, 0) / 5.0 * 25) +
    (LEAST(COALESCE(r.tiktok_trend_score, 0), 100) / 100.0 * 20)
  );
  
  RETURN score;
END;
$$;

-- Insert default categories
INSERT INTO public.categories (name, slug, icon, display_order) VALUES
('Steak & Grills', 'steak', '🥩', 1),
('Desi Food', 'desi', '🍛', 2),
('Italian', 'italian', '🍝', 3),
('BBQ', 'bbq', '🍖', 4),
('Cafes & Coffee', 'cafes', '☕', 5),
('Burgers', 'burgers', '🍔', 6),
('Pizza', 'pizza', '🍕', 7),
('Sushi & Japanese', 'japanese', '🍣', 8),
('Chinese', 'chinese', '🥡', 9),
('Thai', 'thai', '🍜', 10),
('Mexican', 'mexican', '🌮', 11),
('Middle Eastern', 'middle-eastern', '🧆', 12),
('Seafood', 'seafood', '🦞', 13),
('Fine Dining', 'fine-dining', '🍽️', 14),
('Fast Food', 'fast-food', '🍟', 15),
('Halal', 'halal', '🥙', 16),
('Vegan & Vegetarian', 'vegan', '🥗', 17),
('Bakeries & Desserts', 'bakery', '🧁', 18);

-- Create indexes for performance
CREATE INDEX idx_restaurants_city ON public.restaurants(city);
CREATE INDEX idx_restaurants_ranking ON public.restaurants(ranking_score DESC);
CREATE INDEX idx_restaurants_cuisines ON public.restaurants USING GIN(cuisines);
CREATE INDEX idx_reviews_restaurant ON public.reviews(restaurant_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_xp_user ON public.xp_transactions(user_id);