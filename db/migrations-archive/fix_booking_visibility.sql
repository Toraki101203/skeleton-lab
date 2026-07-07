-- Allow anyone (public/anon/authenticated) to view bookings.
-- This is required for the Booking Wizard to check availability (blocked slots).
-- Note: In a production environment with sensitive PII, consider using a separate view 
-- or edge function to return only availability (start/end times) without PII.
-- For this prototype/MVP, we allow SELECT on the table to enable the Calendar and Real-time features.

create policy "Anyone can view bookings"
on public.bookings
for select
using (true);
