-- Add missing UPDATE policy for bookings table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'bookings'
        AND policyname = 'Clinic admins can update bookings for their clinic.'
    ) THEN
        CREATE POLICY "Clinic admins can update bookings for their clinic." ON public.bookings
        FOR UPDATE
        USING (
            (auth.jwt() -> 'app_metadata' ->> 'role' IN ('clinic_admin', 'super_admin'))
            AND
            EXISTS (
                SELECT 1 FROM public.clinics
                WHERE public.clinics.id = public.bookings.clinic_id
                AND public.clinics.owner_uid = auth.uid()
            )
        );
    END IF;
END $$;
