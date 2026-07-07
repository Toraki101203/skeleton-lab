-- Add missing columns to clinics table (Comprehensive Fix)

-- Standard timestamps
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Core info
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS name text;

ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS location jsonb DEFAULT '{}'::jsonb;

-- CMS features
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS menu_items jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS template_id text DEFAULT 'standard';

ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS staff_info jsonb DEFAULT '[]'::jsonb;

-- Force schema cache reload
NOTIFY pgrst, 'reload config';
