-- Add status column to clinics table
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Update existing records to active if needed (optional)
-- UPDATE clinics SET status = 'active' WHERE status IS NULL;
