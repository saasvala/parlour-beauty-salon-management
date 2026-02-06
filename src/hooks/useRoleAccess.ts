import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/types/database';

export const useRoleAccess = () => {
  const { roles, primaryRole } = useAuth();

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (checkRoles: AppRole[]): boolean => {
    return checkRoles.some(role => roles.includes(role));
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  const isSalonOwner = (): boolean => {
    return hasRole('salon_owner');
  };

  const isBranchManager = (): boolean => {
    return hasRole('branch_manager');
  };

  const isReceptionist = (): boolean => {
    return hasRole('receptionist');
  };

  const isBeautician = (): boolean => {
    return hasRole('beautician');
  };

  const isCustomer = (): boolean => {
    return hasRole('customer');
  };

  const canManageSalon = (): boolean => {
    return hasAnyRole(['super_admin', 'salon_owner']);
  };

  const canManageStaff = (): boolean => {
    return hasAnyRole(['super_admin', 'salon_owner', 'branch_manager']);
  };

  const canManageAppointments = (): boolean => {
    return hasAnyRole(['super_admin', 'salon_owner', 'branch_manager', 'receptionist']);
  };

  const canViewReports = (): boolean => {
    return hasAnyRole(['super_admin', 'salon_owner', 'branch_manager']);
  };

  const canManageInventory = (): boolean => {
    return hasAnyRole(['super_admin', 'salon_owner', 'branch_manager']);
  };

  const canCollectPayments = (): boolean => {
    return hasAnyRole(['super_admin', 'salon_owner', 'branch_manager', 'receptionist']);
  };

  return {
    roles,
    primaryRole,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isSalonOwner,
    isBranchManager,
    isReceptionist,
    isBeautician,
    isCustomer,
    canManageSalon,
    canManageStaff,
    canManageAppointments,
    canViewReports,
    canManageInventory,
    canCollectPayments,
  };
};
