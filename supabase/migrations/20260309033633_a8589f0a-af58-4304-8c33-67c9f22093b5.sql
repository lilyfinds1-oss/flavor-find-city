
-- Create cities table
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  default_zoom integer NOT NULL DEFAULT 12,
  neighborhoods text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Cities are publicly readable
CREATE POLICY "Cities are publicly viewable" ON public.cities
  FOR SELECT USING (true);

-- Admins can manage cities
CREATE POLICY "Admins can manage cities" ON public.cities
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed Pakistani cities
INSERT INTO public.cities (name, slug, latitude, longitude, default_zoom, neighborhoods) VALUES
  ('Lahore', 'lahore', 31.5204, 74.3587, 12, ARRAY['Gulberg', 'DHA', 'Johar Town', 'Model Town', 'Liberty', 'MM Alam Road', 'Bahria Town', 'Garden Town', 'Shadman', 'Cantt', 'Walled City', 'Mall Road']),
  ('Karachi', 'karachi', 24.8607, 67.0011, 11, ARRAY['Clifton', 'DHA', 'Gulshan-e-Iqbal', 'Saddar', 'Bahadurabad', 'North Nazimabad', 'PECHS', 'Zamzama', 'Burns Garden', 'Boat Basin']),
  ('Islamabad', 'islamabad', 33.6844, 73.0479, 12, ARRAY['F-6', 'F-7', 'F-8', 'F-10', 'F-11', 'G-9', 'G-10', 'G-11', 'Blue Area', 'Bahria Town', 'E-11', 'I-8']),
  ('Faisalabad', 'faisalabad', 31.4504, 73.1350, 12, ARRAY['D Ground', 'Peoples Colony', 'Madina Town', 'Ghulam Muhammad Abad', 'Jinnah Colony', 'Susan Road', 'Satiana Road', 'Canal Road']),
  ('Multan', 'multan', 30.1575, 71.5249, 12, ARRAY['Cantt', 'Bosan Road', 'Gulgasht Colony', 'Shah Rukn-e-Alam', 'Mumtazabad', 'Garden Town', 'Shalimar Colony', 'Nishtar Road']);
