
-- Add image_url column to services table
ALTER TABLE public.services ADD COLUMN image_url text;

-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);

-- Allow public read access to service images
CREATE POLICY "Service images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

-- Allow admins to upload service images
CREATE POLICY "Admins can upload service images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update service images
CREATE POLICY "Admins can update service images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete service images
CREATE POLICY "Admins can delete service images"
ON storage.objects FOR DELETE
USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));
