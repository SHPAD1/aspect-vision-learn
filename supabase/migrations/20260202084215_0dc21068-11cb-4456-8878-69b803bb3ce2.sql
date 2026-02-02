-- Fix the permissive INSERT policy on enrollment_leads
-- Drop the existing permissive policy and create a more secure one
DROP POLICY IF EXISTS "Anyone can submit enrollment leads" ON public.enrollment_leads;

-- Create a more specific policy that requires valid data
CREATE POLICY "Public enrollment lead submission" ON public.enrollment_leads
    FOR INSERT WITH CHECK (
        student_name IS NOT NULL AND 
        email IS NOT NULL AND 
        phone IS NOT NULL AND
        status = 'new'
    );