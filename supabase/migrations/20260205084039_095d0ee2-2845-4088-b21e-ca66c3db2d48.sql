-- Create banners table for admin-managed hero banners
CREATE TABLE public.banners (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    subtitle text,
    image_url text,
    button_text text DEFAULT 'Explore Now',
    button_link text DEFAULT '/#batches',
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
ON public.banners
FOR SELECT
USING (is_active = true);

-- Only admins can manage banners
CREATE POLICY "Admins can manage banners"
ON public.banners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add source column to enrollment_leads to track where leads come from
ALTER TABLE public.enrollment_leads 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'website';

-- Insert sample banners
INSERT INTO public.banners (title, subtitle, button_text, button_link, display_order) VALUES
('Crack Your Dream Entrance Exam', 'Join 300+ successful students who cleared their exams with our expert guidance', 'Explore Batches', '/#batches', 1),
('Expert Faculty, Proven Results', '98% Selection Rate with personalized coaching and comprehensive study materials', 'Enroll Now', '/#batches', 2),
('New Batches Starting Soon', 'Limited seats available for SSC, Banking, Railway & Defence exams preparation', 'View Schedule', '/batches', 3);