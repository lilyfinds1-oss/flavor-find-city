
-- Restaurant dishes table (AI-parsed menu items)
CREATE TABLE public.restaurant_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  dish_name text NOT NULL,
  category text,
  ingredients text[],
  dietary_tags text[],
  price numeric,
  ai_spice_level text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurant_dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dishes are publicly viewable" ON public.restaurant_dishes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage dishes" ON public.restaurant_dishes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Restaurant claim owners can manage dishes" ON public.restaurant_dishes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurant_claims rc
      WHERE rc.restaurant_id = restaurant_dishes.restaurant_id
        AND rc.user_id = auth.uid()
        AND rc.status = 'approved'
    )
  );

-- Restaurant subscriptions table
CREATE TABLE public.restaurant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  plan_name text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id)
);

ALTER TABLE public.restaurant_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.restaurant_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.restaurant_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.restaurant_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON public.restaurant_subscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
