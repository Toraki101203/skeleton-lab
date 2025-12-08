-- Change default value of status column in bookings table
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'confirmed';

-- Update any remaining pending bookings to confirmed
UPDATE bookings SET status = 'confirmed' WHERE status = 'pending';
