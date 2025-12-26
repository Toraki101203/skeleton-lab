-- Enable deletion for clinics table
-- This policy allows authenticated users to delete rows from the clinics table.

-- First, ensure RLS is enabled (usually it is, but good to be sure)
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow DELETE for authenticated users
-- DROP POLICY IF EXISTS "Enable delete for users" ON clinics; -- Uncomment to reset if needed

CREATE POLICY "Enable delete for authenticated users" 
ON clinics 
FOR DELETE 
TO authenticated 
USING (true);

-- Also ensure UPDATE is allowed for the approval feature
CREATE POLICY "Enable update for authenticated users" 
ON clinics 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);
