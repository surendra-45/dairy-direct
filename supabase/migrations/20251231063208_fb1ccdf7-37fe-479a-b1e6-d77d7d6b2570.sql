-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'dairy_director');

-- Create dairy centers table (each center is managed by a director)
CREATE TABLE public.dairy_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  dairy_center_id UUID REFERENCES public.dairy_centers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create farmers table (linked to dairy center)
CREATE TABLE public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dairy_center_id UUID NOT NULL REFERENCES public.dairy_centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  village TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create milk entries table
CREATE TABLE public.milk_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dairy_center_id UUID NOT NULL REFERENCES public.dairy_centers(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  session TEXT NOT NULL CHECK (session IN ('morning', 'evening')),
  fat_percentage DECIMAL(4,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.dairy_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_entries ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user's dairy center
CREATE OR REPLACE FUNCTION public.get_user_dairy_center(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dairy_center_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for dairy_centers
CREATE POLICY "Super admins can manage all dairy centers"
  ON public.dairy_centers FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Directors can view their dairy center"
  ON public.dairy_centers FOR SELECT
  USING (id = public.get_user_dairy_center(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Super admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_roles
CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policies for farmers (data isolation by dairy center)
CREATE POLICY "Directors can manage their center's farmers"
  ON public.farmers FOR ALL
  USING (dairy_center_id = public.get_user_dairy_center(auth.uid()));

CREATE POLICY "Super admins can manage all farmers"
  ON public.farmers FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for milk_entries (data isolation by dairy center)
CREATE POLICY "Directors can manage their center's entries"
  ON public.milk_entries FOR ALL
  USING (dairy_center_id = public.get_user_dairy_center(auth.uid()));

CREATE POLICY "Super admins can manage all entries"
  ON public.milk_entries FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_dairy_centers_updated_at
  BEFORE UPDATE ON public.dairy_centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_farmers_updated_at
  BEFORE UPDATE ON public.farmers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for performance
CREATE INDEX idx_profiles_dairy_center ON public.profiles(dairy_center_id);
CREATE INDEX idx_farmers_dairy_center ON public.farmers(dairy_center_id);
CREATE INDEX idx_milk_entries_dairy_center ON public.milk_entries(dairy_center_id);
CREATE INDEX idx_milk_entries_farmer ON public.milk_entries(farmer_id);
CREATE INDEX idx_milk_entries_date ON public.milk_entries(date);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);