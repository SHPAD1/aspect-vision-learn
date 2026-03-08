
-- Payment settings table to store Razorpay config from admin panel
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage payment settings
CREATE POLICY "Admins can manage payment settings"
ON public.payment_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Edge functions need to read settings (via service role, bypasses RLS)

-- Trigger for updated_at
CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
