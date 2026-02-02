-- Create role enum for the application
CREATE TYPE public.app_role AS ENUM ('admin', 'student', 'sales', 'support', 'teacher', 'branch_admin');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create branches table
CREATE TABLE public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_weeks INTEGER NOT NULL DEFAULT 12,
    category TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create batches table
CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    mode TEXT NOT NULL CHECK (mode IN ('online', 'offline', 'hybrid')),
    fees DECIMAL(10,2) NOT NULL,
    max_students INTEGER DEFAULT 50,
    description TEXT,
    schedule TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on batches
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Create enrollment_leads table (for public enrollment forms)
CREATE TABLE public.enrollment_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'enrolled', 'not_interested')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on enrollment_leads
ALTER TABLE public.enrollment_leads ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    student_id TEXT NOT NULL UNIQUE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create student_enrollments table
CREATE TABLE public.student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
    fees_paid DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(student_id, batch_id)
);

-- Enable RLS on student_enrollments
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- Create employees table
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    employee_id TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL CHECK (department IN ('sales', 'support', 'teaching', 'admin')),
    designation TEXT,
    salary DECIMAL(10,2),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT,
    transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create support_tickets table
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create study_materials table
CREATE TABLE public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('video', 'document', 'link', 'notes')),
    url TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on study_materials
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Branches: Public read, admin/branch_admin write
CREATE POLICY "Anyone can view active branches" ON public.branches
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage branches" ON public.branches
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Courses: Public read for active courses
CREATE POLICY "Anyone can view active courses" ON public.courses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON public.courses
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Batches: Public read for active batches
CREATE POLICY "Anyone can view active batches" ON public.batches
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage batches" ON public.batches
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Branch admins can manage own batches" ON public.batches
    FOR ALL USING (
        public.has_role(auth.uid(), 'branch_admin') AND
        branch_id IN (SELECT e.branch_id FROM public.employees e WHERE e.user_id = auth.uid())
    );

-- Enrollment leads: Public insert, sales/admin read
CREATE POLICY "Anyone can submit enrollment leads" ON public.enrollment_leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Sales can view leads" ON public.enrollment_leads
    FOR SELECT USING (public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sales can update assigned leads" ON public.enrollment_leads
    FOR UPDATE USING (public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'admin'));

-- Students: Own data access
CREATE POLICY "Students can view own data" ON public.students
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage students" ON public.students
    FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'branch_admin'));

-- Student enrollments
CREATE POLICY "Students can view own enrollments" ON public.student_enrollments
    FOR SELECT USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage enrollments" ON public.student_enrollments
    FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'branch_admin'));

-- Employees
CREATE POLICY "Employees can view own data" ON public.employees
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage employees" ON public.employees
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Payments
CREATE POLICY "Students can view own payments" ON public.payments
    FOR SELECT USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'branch_admin'));

-- Support tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Support can view all tickets" ON public.support_tickets
    FOR SELECT USING (public.has_role(auth.uid(), 'support') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Support can update tickets" ON public.support_tickets
    FOR UPDATE USING (public.has_role(auth.uid(), 'support') OR public.has_role(auth.uid(), 'admin'));

-- Study materials
CREATE POLICY "Students can view materials for enrolled courses" ON public.study_materials
    FOR SELECT USING (
        is_active = true AND (
            course_id IN (
                SELECT b.course_id FROM public.batches b
                JOIN public.student_enrollments se ON se.batch_id = b.id
                JOIN public.students s ON s.id = se.student_id
                WHERE s.user_id = auth.uid()
            ) OR
            public.has_role(auth.uid(), 'teacher') OR
            public.has_role(auth.uid(), 'admin')
        )
    );

CREATE POLICY "Teachers can manage materials" ON public.study_materials
    FOR ALL USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollment_leads_updated_at BEFORE UPDATE ON public.enrollment_leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for branches
INSERT INTO public.branches (name, code, city, address, phone, email) VALUES
('Main Campus', 'MC001', 'Mumbai', '123 Education Street, Andheri', '+91 9876543210', 'main@aspectvision.com'),
('Tech Hub', 'TH002', 'Bangalore', '456 Tech Park, Whitefield', '+91 9876543211', 'tech@aspectvision.com'),
('North Center', 'NC003', 'Delhi', '789 Knowledge Lane, Connaught Place', '+91 9876543212', 'north@aspectvision.com');

-- Insert sample courses
INSERT INTO public.courses (name, description, duration_weeks, category, thumbnail_url) VALUES
('Full Stack Web Development', 'Master modern web development with React, Node.js, and databases. Build real-world projects and launch your career in tech.', 24, 'Technology', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'),
('Data Science & Analytics', 'Learn Python, Machine Learning, and Data Visualization. Transform data into insights and drive business decisions.', 20, 'Technology', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'),
('Digital Marketing Mastery', 'Master SEO, Social Media, Content Marketing, and Paid Advertising. Grow brands and drive revenue online.', 12, 'Marketing', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'),
('UI/UX Design Bootcamp', 'Design beautiful, user-friendly interfaces. Learn Figma, design thinking, and create stunning portfolios.', 16, 'Design', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800');

-- Insert sample batches
INSERT INTO public.batches (course_id, branch_id, name, start_date, end_date, mode, fees, max_students, description, schedule) VALUES
((SELECT id FROM public.courses WHERE name = 'Full Stack Web Development'), (SELECT id FROM public.branches WHERE code = 'MC001'), 'FSWD Batch 2025-A', '2025-02-15', '2025-08-15', 'hybrid', 49999.00, 30, 'Weekend batch with live projects and mentorship', 'Sat-Sun 10:00 AM - 2:00 PM'),
((SELECT id FROM public.courses WHERE name = 'Full Stack Web Development'), (SELECT id FROM public.branches WHERE code = 'TH002'), 'FSWD Batch 2025-B', '2025-03-01', '2025-09-01', 'online', 44999.00, 50, 'Fully online batch with recorded sessions', 'Mon-Wed-Fri 7:00 PM - 9:00 PM'),
((SELECT id FROM public.courses WHERE name = 'Data Science & Analytics'), (SELECT id FROM public.branches WHERE code = 'MC001'), 'DS Batch 2025-A', '2025-02-20', '2025-07-20', 'offline', 54999.00, 25, 'Intensive classroom training with industry projects', 'Mon-Fri 10:00 AM - 1:00 PM'),
((SELECT id FROM public.courses WHERE name = 'Digital Marketing Mastery'), (SELECT id FROM public.branches WHERE code = 'NC003'), 'DM Batch 2025-A', '2025-02-10', '2025-05-10', 'online', 29999.00, 40, 'Learn from industry experts with real campaigns', 'Tue-Thu 6:00 PM - 8:00 PM'),
((SELECT id FROM public.courses WHERE name = 'UI/UX Design Bootcamp'), (SELECT id FROM public.branches WHERE code = 'TH002'), 'UX Batch 2025-A', '2025-03-15', '2025-07-15', 'hybrid', 39999.00, 20, 'Design portfolio-focused bootcamp', 'Sat-Sun 2:00 PM - 6:00 PM');