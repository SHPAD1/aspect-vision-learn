-- Create branch_permissions table for department-wise ID creation settings
CREATE TABLE public.branch_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  can_create_ids BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT true,
  can_manage_students BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branch_id, department)
);

-- Enable RLS
ALTER TABLE public.branch_permissions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage all permissions"
ON public.branch_permissions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Branch admins can view own branch permissions"
ON public.branch_permissions FOR SELECT
USING (
  has_role(auth.uid(), 'branch_admin'::app_role) 
  AND branch_id IN (SELECT e.branch_id FROM employees e WHERE e.user_id = auth.uid())
);

CREATE POLICY "Branch admins can update own branch permissions"
ON public.branch_permissions FOR UPDATE
USING (
  has_role(auth.uid(), 'branch_admin'::app_role) 
  AND branch_id IN (SELECT e.branch_id FROM employees e WHERE e.user_id = auth.uid())
);

-- Insert default permissions for existing branches
INSERT INTO public.branch_permissions (branch_id, department, can_create_ids, can_view_reports, can_manage_students)
SELECT b.id, dept.department, false, true, false
FROM branches b
CROSS JOIN (
  VALUES ('sales'), ('support'), ('teaching'), ('management'), ('operations'), ('hr'), ('accounts')
) AS dept(department)
ON CONFLICT DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_branch_permissions_updated_at
  BEFORE UPDATE ON public.branch_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();