-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create employee_requests table for leave/problem requests
CREATE TABLE public.employee_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    request_type TEXT NOT NULL, -- 'leave', 'problem', 'other'
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'branch_approved', 'admin_approved', 'rejected'
    branch_id UUID REFERENCES public.branches(id),
    branch_approved_by UUID,
    branch_approved_at TIMESTAMP WITH TIME ZONE,
    admin_approved_by UUID,
    admin_approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on employee_requests
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_requests
CREATE POLICY "Users can view own requests"
ON public.employee_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests"
ON public.employee_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Branch admins can view branch requests"
ON public.employee_requests FOR SELECT
USING (
    has_role(auth.uid(), 'branch_admin'::app_role) AND 
    branch_id IN (SELECT branch_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "Branch admins can update branch requests"
ON public.employee_requests FOR UPDATE
USING (
    has_role(auth.uid(), 'branch_admin'::app_role) AND 
    branch_id IN (SELECT branch_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all requests"
ON public.employee_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all requests"
ON public.employee_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_employee_requests_updated_at
BEFORE UPDATE ON public.employee_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();