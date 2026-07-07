-- Add columns for wait time tracking to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS checked_in_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Create a table for daily clinic statistics (PVs, etc.)
CREATE TABLE IF NOT EXISTS public.clinic_daily_stats (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
    date date NOT NULL,
    page_views integer DEFAULT 0,
    unique_visitors integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(clinic_id, date)
);

-- Enable RLS
ALTER TABLE public.clinic_daily_stats ENABLE ROW LEVEL SECURITY;

-- Policies for stats
DO $$ BEGIN
    CREATE POLICY "Clinic admins can view own stats." ON public.clinic_daily_stats FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.clinics
            WHERE public.clinics.id = public.clinic_daily_stats.clinic_id
            AND public.clinics.owner_uid = auth.uid()
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Function to increment PV (can be called via RPC or just upsert from client if policy allows)
-- For now, we allow public insert/update for demo purposes or restricted to authenticated users
-- Ideally this should be a secure RPC function.

-- Let's create a secure RPC function to increment PV
CREATE OR REPLACE FUNCTION increment_clinic_pv(p_clinic_id uuid)
RETURNS void AS $$
BEGIN
    INSERT INTO public.clinic_daily_stats (clinic_id, date, page_views)
    VALUES (p_clinic_id, CURRENT_DATE, 1)
    ON CONFLICT (clinic_id, date)
    DO UPDATE SET page_views = public.clinic_daily_stats.page_views + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
