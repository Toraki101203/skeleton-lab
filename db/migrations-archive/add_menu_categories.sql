-- Add menu_categories column to clinics table
ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS menu_categories jsonb DEFAULT '[]'::jsonb;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload config';
