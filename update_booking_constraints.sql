-- Update constraints for bookings table to support new status and booked_by values

-- 1. Update status constraint to include 'no_show'
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'no_show'));

-- 2. Update booked_by constraint to include 'guest' and 'proxy'
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booked_by_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_booked_by_check 
    CHECK (booked_by IN ('user', 'operator', 'guest', 'proxy'));
