-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for banners bucket
CREATE POLICY "Admins can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update banners"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete banners"
ON storage.objects FOR DELETE
USING (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Create popup_notices table for homepage popups
CREATE TABLE public.popup_notices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    image_url text,
    button_text text DEFAULT 'Learn More',
    button_link text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    start_date timestamp with time zone DEFAULT now(),
    end_date timestamp with time zone,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.popup_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage popup notices"
ON public.popup_notices FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active popup notices"
ON public.popup_notices FOR SELECT
USING (is_active = true AND (end_date IS NULL OR end_date > now()));

-- Create notifications table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    message text NOT NULL,
    notification_type text DEFAULT 'info',
    target_type text NOT NULL DEFAULT 'all',
    target_branch_id uuid REFERENCES public.branches(id),
    target_department text,
    target_role text,
    target_user_id uuid,
    is_read boolean DEFAULT false,
    sent_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admin can send notifications
CREATE POLICY "Admins can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'branch_admin'::app_role));

-- Admin can view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Branch admins can view branch notifications
CREATE POLICY "Branch admins can view branch notifications"
ON public.notifications FOR SELECT
USING (
    has_role(auth.uid(), 'branch_admin'::app_role) AND 
    (target_branch_id IN (SELECT branch_id FROM employees WHERE user_id = auth.uid()) OR sent_by = auth.uid())
);

-- Users can view their targeted notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (
    target_type = 'all' OR
    target_user_id = auth.uid() OR
    (target_role IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = target_role)) OR
    (target_branch_id IS NOT NULL AND EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND branch_id = target_branch_id)) OR
    (target_branch_id IS NOT NULL AND EXISTS (SELECT 1 FROM students WHERE user_id = auth.uid() AND branch_id = target_branch_id))
);

-- Users can mark notifications as read
CREATE POLICY "Users can update own notification read status"
ON public.notifications FOR UPDATE
USING (
    target_type = 'all' OR
    target_user_id = auth.uid() OR
    (target_role IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = target_role))
);

-- Create support ticket replies table for chat
CREATE TABLE public.ticket_replies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    message text NOT NULL,
    is_support_reply boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Users can create replies on their own tickets
CREATE POLICY "Users can reply to own tickets"
ON public.ticket_replies FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid()) OR
    has_role(auth.uid(), 'support'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
);

-- Users can view replies on their tickets
CREATE POLICY "Users can view own ticket replies"
ON public.ticket_replies FOR SELECT
USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid()) OR
    has_role(auth.uid(), 'support'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
);

-- Add department column to support_tickets if not exists
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS department text;

-- Create triggers for updated_at
CREATE TRIGGER update_popup_notices_updated_at
BEFORE UPDATE ON public.popup_notices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();