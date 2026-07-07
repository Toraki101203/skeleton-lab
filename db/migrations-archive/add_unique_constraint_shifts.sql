
-- Add unique constraint for upsert to work correctly
ALTER TABLE shifts
ADD CONSTRAINT shifts_clinic_staff_date_unique UNIQUE (clinic_id, staff_id, date);
