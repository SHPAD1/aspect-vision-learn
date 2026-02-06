-- Create team_members table for Our Team section
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  designation text NOT NULL,
  bio text,
  photo_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policies for team_members
CREATE POLICY "Anyone can view active team members" ON public.team_members
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  cover_image_url text,
  category text NOT NULL DEFAULT 'blog', -- 'blog', 'success_story'
  branch_id uuid REFERENCES public.branches(id),
  author_id uuid,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies for blog_posts
CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all posts" ON public.blog_posts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Branch admins can manage own branch posts" ON public.blog_posts
  FOR ALL USING (
    has_role(auth.uid(), 'branch_admin'::app_role) AND 
    branch_id IN (SELECT e.branch_id FROM employees e WHERE e.user_id = auth.uid())
  );

-- Create storage bucket for team photos
INSERT INTO storage.buckets (id, name, public) VALUES ('team-photos', 'team-photos', true);

-- Storage policies for team photos
CREATE POLICY "Team photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'team-photos');

CREATE POLICY "Admins can upload team photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'team-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update team photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'team-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete team photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'team-photos' AND has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Storage policies for blog images
CREATE POLICY "Blog images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Admins and branch admins can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' AND 
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'branch_admin'::app_role))
  );

CREATE POLICY "Admins and branch admins can update blog images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-images' AND 
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'branch_admin'::app_role))
  );

CREATE POLICY "Admins and branch admins can delete blog images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images' AND 
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'branch_admin'::app_role))
  );