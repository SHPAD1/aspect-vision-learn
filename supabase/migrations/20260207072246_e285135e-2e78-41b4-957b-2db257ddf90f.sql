-- Add validation constraints to enrollment_leads table
-- Using validation trigger instead of CHECK constraints for better flexibility

-- Create validation function for enrollment_leads
CREATE OR REPLACE FUNCTION public.validate_enrollment_lead()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email format
  IF NEW.email IS NULL OR NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate email length
  IF length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'Email must be less than 255 characters';
  END IF;
  
  -- Validate phone format (10 digits starting with 6-9 for Indian numbers)
  IF NEW.phone IS NULL OR NEW.phone !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Invalid phone format. Must be 10 digits starting with 6-9';
  END IF;
  
  -- Validate student_name length
  IF NEW.student_name IS NULL OR length(NEW.student_name) < 2 OR length(NEW.student_name) > 100 THEN
    RAISE EXCEPTION 'Student name must be between 2 and 100 characters';
  END IF;
  
  -- Validate city length if provided
  IF NEW.city IS NOT NULL AND (length(NEW.city) < 2 OR length(NEW.city) > 100) THEN
    RAISE EXCEPTION 'City must be between 2 and 100 characters';
  END IF;
  
  -- Validate notes length if provided (prevent storage exhaustion)
  IF NEW.notes IS NOT NULL AND length(NEW.notes) > 1000 THEN
    RAISE EXCEPTION 'Notes must be less than 1000 characters';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for validation on INSERT and UPDATE
DROP TRIGGER IF EXISTS validate_enrollment_lead_trigger ON public.enrollment_leads;
CREATE TRIGGER validate_enrollment_lead_trigger
  BEFORE INSERT OR UPDATE ON public.enrollment_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_enrollment_lead();