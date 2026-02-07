-- Drop the restrictive department check constraint to allow management department
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_department_check;

-- Add a more flexible check constraint allowing common departments
ALTER TABLE public.employees ADD CONSTRAINT employees_department_check 
CHECK (department IN ('sales', 'support', 'teaching', 'management', 'operations', 'hr', 'accounts'));