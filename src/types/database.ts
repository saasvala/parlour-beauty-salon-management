// Custom database types for the salon management system

export type AppRole = 
  | 'super_admin'
  | 'salon_owner'
  | 'branch_manager'
  | 'receptionist'
  | 'beautician'
  | 'customer';

export type AppointmentStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentMethod = 
  | 'cash'
  | 'upi'
  | 'card'
  | 'online'
  | 'wallet';

export type PaymentStatus = 
  | 'pending'
  | 'partial'
  | 'completed'
  | 'refunded';

export type SubscriptionStatus = 
  | 'active'
  | 'inactive'
  | 'expired'
  | 'trial';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_branches: number;
  max_staff: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Salon {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  pincode: string | null;
  gst_number: string | null;
  subscription_plan_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  salon_id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  manager_id: string | null;
  is_main_branch: boolean;
  is_active: boolean;
  working_hours: WorkingHours;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string;
  close: string;
  is_open: boolean;
}

export interface Staff {
  id: string;
  user_id: string;
  salon_id: string;
  branch_id: string | null;
  employee_code: string | null;
  designation: string | null;
  specialization: string[];
  commission_percentage: number;
  base_salary: number;
  joining_date: string | null;
  is_active: boolean;
  working_hours: WorkingHours | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  profile?: Profile;
}

export interface ServiceCategory {
  id: string;
  salon_id: string | null;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_global: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  salon_id: string | null;
  category_id: string | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  discounted_price: number | null;
  image_url: string | null;
  is_global: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: ServiceCategory;
}

export interface Customer {
  id: string;
  user_id: string | null;
  salon_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  notes: string | null;
  loyalty_points: number;
  total_visits: number;
  total_spent: number;
  last_visit_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  branch_id: string | null;
  customer_id: string;
  staff_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  created_by: string | null;
  is_walkin: boolean;
  cancelled_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer?: Customer;
  staff?: Staff;
  services?: AppointmentService[];
}

export interface AppointmentService {
  id: string;
  appointment_id: string;
  service_id: string;
  staff_id: string | null;
  price: number;
  duration_minutes: number;
  status: AppointmentStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  // Joined fields
  service?: Service;
  staff?: Staff;
}

export interface Payment {
  id: string;
  appointment_id: string;
  salon_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id: string | null;
  notes: string | null;
  received_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  appointment_id: string;
  salon_id: string;
  invoice_number: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  tax_percentage: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  notes: string | null;
  created_at: string;
}

export interface Package {
  id: string;
  salon_id: string;
  name: string;
  description: string | null;
  original_price: number;
  discounted_price: number;
  validity_days: number;
  max_uses: number;
  image_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  services?: Service[];
}

export interface Expense {
  id: string;
  salon_id: string;
  branch_id: string | null;
  category: string;
  description: string | null;
  amount: number;
  expense_date: string;
  payment_method: PaymentMethod | null;
  receipt_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  salon_id: string;
  branch_id: string | null;
  category_id: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  quantity: number;
  min_quantity: number;
  unit: string;
  cost_price: number;
  selling_price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffAttendance {
  id: string;
  staff_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  notes: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  salon_id: string;
  customer_id: string;
  appointment_id: string | null;
  rating: number;
  review: string | null;
  is_visible: boolean;
  created_at: string;
  // Joined
  customer?: Customer;
}
