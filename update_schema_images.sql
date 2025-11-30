-- Add staff_info to clinics table
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS staff_info jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.clinics.staff_info IS 'List of staff members for display (name, image_url)';

-- Storage Setup (Idempotent-ish)
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-assets', 'clinic-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'clinic-assets' );

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'clinic-assets' AND auth.role() = 'authenticated' );

CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'clinic-assets' AND auth.uid() = owner );

CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'clinic-assets' AND auth.uid() = owner );
