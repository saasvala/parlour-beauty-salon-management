import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { AppointmentStatus } from '@/types/database';

export const useSalon = () => {
  const { salon, staff } = useAuth();
  const salonId = salon?.id || staff?.salon_id;
  
  return { salonId, salon };
};

// Public services for customer booking (no auth required for listing)
export const usePublicServices = (salonId?: string) => {
  return useQuery({
    queryKey: ['public-services', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('services')
        .select('*, category:service_categories(*)')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

// Public staff for customer booking
export const usePublicStaff = (salonId?: string) => {
  return useQuery({
    queryKey: ['public-staff', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('staff')
        .select('*, profile:profiles(full_name, avatar_url)')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

// Public appointments for time slot checking
export const usePublicAppointments = (salonId?: string, date?: string) => {
  return useQuery({
    queryKey: ['public-appointments', salonId, date],
    queryFn: async () => {
      if (!salonId || !date) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('start_time, end_time, staff_id')
        .eq('salon_id', salonId)
        .eq('appointment_date', date)
        .neq('status', 'cancelled');
      if (error) throw error;
      return data;
    },
    enabled: !!salonId && !!date,
  });
};

// Services Hooks
export const useServices = () => {
  const { salonId } = useSalon();
  
  return useQuery({
    queryKey: ['services', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('services')
        .select('*, category:service_categories(*)')
        .eq('salon_id', salonId)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

export const useServiceCategories = () => {
  const { salonId } = useSalon();
  
  return useQuery({
    queryKey: ['service_categories', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .or(`salon_id.eq.${salonId},is_global.eq.true`)
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

// Staff Hooks
export const useStaff = () => {
  const { salonId } = useSalon();
  
  return useQuery({
    queryKey: ['staff', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('staff')
        .select('*, profile:profiles(*)')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

// Customers Hooks
export const useCustomers = () => {
  const { salonId } = useSalon();
  
  return useQuery({
    queryKey: ['customers', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('salon_id', salonId)
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

// Appointments Hooks
export const useAppointments = (date?: string, status?: AppointmentStatus) => {
  const { salonId } = useSalon();
  
  return useQuery({
    queryKey: ['appointments', salonId, date, status],
    queryFn: async () => {
      if (!salonId) return [];
      let query = supabase
        .from('appointments')
        .select(`
          *,
          customer:customers(*),
          staff:staff(*, profile:profiles(*)),
          appointment_services(*, service:services(*))
        `)
        .eq('salon_id', salonId)
        .order('start_time', { ascending: true });
      
      if (date) {
        query = query.eq('appointment_date', date);
      }
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

// Payments Hooks
export const usePayments = (startDate?: string, endDate?: string) => {
  const { salonId } = useSalon();
  
  return useQuery({
    queryKey: ['payments', salonId, startDate, endDate],
    queryFn: async () => {
      if (!salonId) return [];
      let query = supabase
        .from('payments')
        .select('*, appointment:appointments(*, customer:customers(*))')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

// Invoices Hooks
export const useInvoices = () => {
  const { salonId } = useSalon();
  
  return useQuery({
    queryKey: ['invoices', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('invoices')
        .select('*, appointment:appointments(*, customer:customers(*))')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

// Packages Hooks
export const usePackages = () => {
  const { salonId } = useSalon();
  
  return useQuery({
    queryKey: ['packages', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('packages')
        .select('*, package_services(*, service:services(*))')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

// Expenses Hooks
export const useExpenses = (startDate?: string, endDate?: string) => {
  const { salonId } = useSalon();
  
  return useQuery({
    queryKey: ['expenses', salonId, startDate, endDate],
    queryFn: async () => {
      if (!salonId) return [];
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('salon_id', salonId)
        .order('expense_date', { ascending: false });
      
      if (startDate) {
        query = query.gte('expense_date', startDate);
      }
      if (endDate) {
        query = query.lte('expense_date', endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};

// Inventory Hooks
export const useInventory = () => {
  const { salonId } = useSalon();
  
  return useQuery({
    queryKey: ['inventory', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('inventory')
        .select('*, category:inventory_categories(*)')
        .eq('salon_id', salonId)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
};
