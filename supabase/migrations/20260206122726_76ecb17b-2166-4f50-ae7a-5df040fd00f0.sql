-- ==============================
-- ENUMS
-- ==============================

-- App roles enum
CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'salon_owner',
  'branch_manager',
  'receptionist',
  'beautician',
  'customer'
);

-- Appointment status enum
CREATE TYPE public.appointment_status AS ENUM (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

-- Payment method enum
CREATE TYPE public.payment_method AS ENUM (
  'cash',
  'upi',
  'card',
  'online',
  'wallet'
);

-- Payment status enum
CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'partial',
  'completed',
  'refunded'
);

-- Subscription status enum
CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'inactive',
  'expired',
  'trial'
);

-- ==============================
-- CORE TABLES
-- ==============================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Subscription plans (managed by super admin)
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_branches INTEGER DEFAULT 1,
  max_staff INTEGER DEFAULT 5,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Salons table
CREATE TABLE public.salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pincode TEXT,
  gst_number TEXT,
  subscription_plan_id UUID REFERENCES public.subscription_plans(id),
  subscription_status subscription_status DEFAULT 'trial',
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Branches table (for multi-branch support)
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  manager_id UUID REFERENCES auth.users(id),
  is_main_branch BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  working_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "21:00", "is_open": true},
    "tuesday": {"open": "09:00", "close": "21:00", "is_open": true},
    "wednesday": {"open": "09:00", "close": "21:00", "is_open": true},
    "thursday": {"open": "09:00", "close": "21:00", "is_open": true},
    "friday": {"open": "09:00", "close": "21:00", "is_open": true},
    "saturday": {"open": "09:00", "close": "21:00", "is_open": true},
    "sunday": {"open": "10:00", "close": "18:00", "is_open": false}
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff members table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  employee_code TEXT,
  designation TEXT,
  specialization TEXT[],
  commission_percentage DECIMAL(5,2) DEFAULT 0,
  base_salary DECIMAL(10,2) DEFAULT 0,
  joining_date DATE,
  is_active BOOLEAN DEFAULT true,
  working_hours JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, salon_id)
);

-- Service categories
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_global BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discounted_price DECIMAL(10,2),
  image_url TEXT,
  is_global BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff services (which staff can do which services)
CREATE TABLE public.staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, service_id)
);

-- Customers table (salon-specific customer records)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  gender TEXT,
  date_of_birth DATE,
  address TEXT,
  notes TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_visit_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending',
  notes TEXT,
  total_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  is_walkin BOOLEAN DEFAULT false,
  cancelled_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointment services (many-to-many)
CREATE TABLE public.appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  staff_id UUID REFERENCES public.staff(id),
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status appointment_status DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  transaction_id TEXT,
  notes TEXT,
  received_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  tax_percentage DECIMAL(5,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  due_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salon_id, invoice_number)
);

-- Packages / Offers
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL,
  validity_days INTEGER DEFAULT 30,
  max_uses INTEGER DEFAULT 1,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Package services
CREATE TABLE public.package_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  UNIQUE(package_id, service_id)
);

-- Customer packages (purchased)
CREATE TABLE public.customer_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date TIMESTAMPTZ,
  remaining_uses INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expenses
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method payment_method,
  receipt_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory categories
CREATE TABLE public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory / Products
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  category_id UUID REFERENCES public.inventory_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 5,
  unit TEXT DEFAULT 'pcs',
  cost_price DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory transactions
CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff attendance
CREATE TABLE public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'present', -- present, absent, half_day, leave
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews / Ratings
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Error logs (for super admin)
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id),
  user_id UUID REFERENCES auth.users(id),
  error_type TEXT,
  error_message TEXT,
  error_stack TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================
-- ENABLE RLS ON ALL TABLES
-- ==============================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- ==============================
-- SECURITY DEFINER FUNCTIONS
-- ==============================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'super_admin')
$$;

-- Check if user belongs to a salon (as owner or staff)
CREATE OR REPLACE FUNCTION public.user_belongs_to_salon(_user_id UUID, _salon_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.salons WHERE id = _salon_id AND owner_id = _user_id
    UNION
    SELECT 1 FROM public.staff WHERE salon_id = _salon_id AND user_id = _user_id AND is_active = true
  )
$$;

-- Get user's salon IDs
CREATE OR REPLACE FUNCTION public.get_user_salon_ids(_user_id UUID)
RETURNS UUID[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY(
    SELECT id FROM public.salons WHERE owner_id = _user_id
    UNION
    SELECT salon_id FROM public.staff WHERE user_id = _user_id AND is_active = true
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Default role is customer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create update triggers for tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================
-- RLS POLICIES
-- ==============================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_super_admin(auth.uid()));

-- User roles policies (only super admin can manage roles, users can see their own)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all roles" ON public.user_roles FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Salon owners can view staff roles" ON public.user_roles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s 
      JOIN public.salons sl ON s.salon_id = sl.id 
      WHERE s.user_id = public.user_roles.user_id AND sl.owner_id = auth.uid()
    )
  );

-- Subscription plans policies
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Super admins can manage plans" ON public.subscription_plans FOR ALL USING (public.is_super_admin(auth.uid()));

-- Salons policies
CREATE POLICY "Owners can manage their salons" ON public.salons FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Staff can view their salon" ON public.salons FOR SELECT 
  USING (id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Super admins can manage all salons" ON public.salons FOR ALL USING (public.is_super_admin(auth.uid()));

-- Branches policies
CREATE POLICY "Salon members can view branches" ON public.branches FOR SELECT 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Salon owners can manage branches" ON public.branches FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.salons WHERE id = branches.salon_id AND owner_id = auth.uid()));
CREATE POLICY "Super admins can manage all branches" ON public.branches FOR ALL USING (public.is_super_admin(auth.uid()));

-- Staff policies
CREATE POLICY "Staff can view themselves" ON public.staff FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Salon members can view staff" ON public.staff FOR SELECT 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Salon owners can manage staff" ON public.staff FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.salons WHERE id = staff.salon_id AND owner_id = auth.uid()));
CREATE POLICY "Super admins can manage all staff" ON public.staff FOR ALL USING (public.is_super_admin(auth.uid()));

-- Service categories policies
CREATE POLICY "Anyone can view active categories" ON public.service_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Salon owners can manage categories" ON public.service_categories FOR ALL 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())) OR public.is_super_admin(auth.uid()));

-- Services policies
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Salon owners can manage services" ON public.services FOR ALL 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())) OR public.is_super_admin(auth.uid()));

-- Staff services policies
CREATE POLICY "Salon members can view staff services" ON public.staff_services FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.staff WHERE id = staff_services.staff_id AND salon_id = ANY(public.get_user_salon_ids(auth.uid()))));
CREATE POLICY "Salon owners can manage staff services" ON public.staff_services FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.staff s 
    JOIN public.salons sl ON s.salon_id = sl.id 
    WHERE s.id = staff_services.staff_id AND sl.owner_id = auth.uid()
  ));

-- Customers policies
CREATE POLICY "Salon members can view customers" ON public.customers FOR SELECT 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Salon members can manage customers" ON public.customers FOR ALL 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Customers can view own record" ON public.customers FOR SELECT 
  USING (user_id = auth.uid());

-- Appointments policies
CREATE POLICY "Salon members can view appointments" ON public.appointments FOR SELECT 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Salon members can manage appointments" ON public.appointments FOR ALL 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Customers can view own appointments" ON public.appointments FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.customers WHERE id = appointments.customer_id AND user_id = auth.uid()));
CREATE POLICY "Customers can create appointments" ON public.appointments FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers WHERE id = appointments.customer_id AND user_id = auth.uid()));

-- Appointment services policies
CREATE POLICY "Salon members can view appointment services" ON public.appointment_services FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.appointments a WHERE a.id = appointment_services.appointment_id AND a.salon_id = ANY(public.get_user_salon_ids(auth.uid()))));
CREATE POLICY "Salon members can manage appointment services" ON public.appointment_services FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.appointments a WHERE a.id = appointment_services.appointment_id AND a.salon_id = ANY(public.get_user_salon_ids(auth.uid()))));

-- Payments policies
CREATE POLICY "Salon members can view payments" ON public.payments FOR SELECT 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Salon members can manage payments" ON public.payments FOR ALL 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));

-- Invoices policies
CREATE POLICY "Salon members can view invoices" ON public.invoices FOR SELECT 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Salon members can manage invoices" ON public.invoices FOR ALL 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));

-- Packages policies
CREATE POLICY "Anyone can view active packages" ON public.packages FOR SELECT USING (is_active = true);
CREATE POLICY "Salon owners can manage packages" ON public.packages FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.salons WHERE id = packages.salon_id AND owner_id = auth.uid()));

-- Package services policies
CREATE POLICY "Anyone can view package services" ON public.package_services FOR SELECT USING (true);
CREATE POLICY "Salon owners can manage package services" ON public.package_services FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.packages p 
    JOIN public.salons s ON p.salon_id = s.id 
    WHERE p.id = package_services.package_id AND s.owner_id = auth.uid()
  ));

-- Customer packages policies
CREATE POLICY "Customers can view own packages" ON public.customer_packages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.customers WHERE id = customer_packages.customer_id AND user_id = auth.uid()));
CREATE POLICY "Salon members can manage customer packages" ON public.customer_packages FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.customers c WHERE c.id = customer_packages.customer_id AND c.salon_id = ANY(public.get_user_salon_ids(auth.uid()))
  ));

-- Expenses policies
CREATE POLICY "Salon members can view expenses" ON public.expenses FOR SELECT 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Salon owners can manage expenses" ON public.expenses FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.salons WHERE id = expenses.salon_id AND owner_id = auth.uid()));

-- Inventory categories policies
CREATE POLICY "Salon members can view inventory categories" ON public.inventory_categories FOR SELECT 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Salon owners can manage inventory categories" ON public.inventory_categories FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.salons WHERE id = inventory_categories.salon_id AND owner_id = auth.uid()));

-- Inventory policies
CREATE POLICY "Salon members can view inventory" ON public.inventory FOR SELECT 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Salon owners can manage inventory" ON public.inventory FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.salons WHERE id = inventory.salon_id AND owner_id = auth.uid()));

-- Inventory transactions policies
CREATE POLICY "Salon members can view transactions" ON public.inventory_transactions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.inventory i WHERE i.id = inventory_transactions.inventory_id AND i.salon_id = ANY(public.get_user_salon_ids(auth.uid()))));
CREATE POLICY "Salon members can create transactions" ON public.inventory_transactions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.inventory i WHERE i.id = inventory_transactions.inventory_id AND i.salon_id = ANY(public.get_user_salon_ids(auth.uid()))));

-- Staff attendance policies
CREATE POLICY "Staff can view own attendance" ON public.staff_attendance FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.staff WHERE id = staff_attendance.staff_id AND user_id = auth.uid()));
CREATE POLICY "Staff can mark own attendance" ON public.staff_attendance FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.staff WHERE id = staff_attendance.staff_id AND user_id = auth.uid()));
CREATE POLICY "Salon owners can manage attendance" ON public.staff_attendance FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.staff s 
    JOIN public.salons sl ON s.salon_id = sl.id 
    WHERE s.id = staff_attendance.staff_id AND sl.owner_id = auth.uid()
  ));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Reviews policies
CREATE POLICY "Anyone can view visible reviews" ON public.reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers WHERE id = reviews.customer_id AND user_id = auth.uid()));
CREATE POLICY "Salon owners can manage reviews" ON public.reviews FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.salons WHERE id = reviews.salon_id AND owner_id = auth.uid()));

-- Error logs policies
CREATE POLICY "Super admins can view all error logs" ON public.error_logs FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Salon owners can view their error logs" ON public.error_logs FOR SELECT 
  USING (salon_id = ANY(public.get_user_salon_ids(auth.uid())));
CREATE POLICY "Anyone can create error logs" ON public.error_logs FOR INSERT WITH CHECK (true);

-- ==============================
-- INDEXES FOR PERFORMANCE
-- ==============================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_staff_salon_id ON public.staff(salon_id);
CREATE INDEX idx_staff_user_id ON public.staff(user_id);
CREATE INDEX idx_services_salon_id ON public.services(salon_id);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_customers_salon_id ON public.customers(salon_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_appointments_salon_id ON public.appointments(salon_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX idx_appointments_staff_id ON public.appointments(staff_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_payments_salon_id ON public.payments(salon_id);
CREATE INDEX idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX idx_inventory_salon_id ON public.inventory(salon_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_reviews_salon_id ON public.reviews(salon_id);