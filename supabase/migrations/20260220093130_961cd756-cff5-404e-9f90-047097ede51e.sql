
-- Store editable homepage content as key-value pairs
CREATE TABLE public.site_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content
CREATE POLICY "Site content is publicly readable"
ON public.site_content FOR SELECT
USING (true);

-- Only admins can manage site content
CREATE POLICY "Admins can manage site content"
ON public.site_content FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default homepage content
INSERT INTO public.site_content (key, value) VALUES
  ('hero_badge', 'Bitcoin-native digital services'),
  ('hero_title_line1', 'Digital services,'),
  ('hero_title_line2', 'paid your way.'),
  ('hero_subtitle', 'Premium email marketing, custom websites, and more — all purchasable with Bitcoin. No banks. No middlemen. Just results.'),
  ('features_title', 'Built for Privacy & Speed'),
  ('features_subtitle', 'Everything you need to buy and manage digital services — without compromise.'),
  ('cta_title', 'Ready to go?'),
  ('cta_subtitle', 'Create your account and start browsing services in under a minute.');
