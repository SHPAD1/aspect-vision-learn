-- Create discount_coupons table for coupon management
CREATE TABLE public.discount_coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    description text,
    discount_percent integer NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    max_uses integer DEFAULT NULL,
    used_count integer DEFAULT 0,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    is_active boolean DEFAULT true,
    applicable_courses uuid[] DEFAULT NULL,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons"
ON public.discount_coupons
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active coupons (for validation)
CREATE POLICY "Anyone can view active coupons"
ON public.discount_coupons
FOR SELECT
USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Add discount_percent column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS discount_percent integer DEFAULT 0;

-- Add trigger for updated_at on coupons
CREATE TRIGGER update_discount_coupons_updated_at
BEFORE UPDATE ON public.discount_coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();