-- Add template_id and menu_items to clinics table
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS template_id text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS menu_items jsonb DEFAULT '[]'::jsonb;

-- Comment on columns
COMMENT ON COLUMN public.clinics.template_id IS 'Selected design template ID (standard, warm, modern)';
COMMENT ON COLUMN public.clinics.menu_items IS 'List of menu items/services offered by the clinic';
