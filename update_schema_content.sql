-- Add new columns for extended clinic content

ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS director_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS news_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS faq_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS access_details text DEFAULT '',
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload config';
