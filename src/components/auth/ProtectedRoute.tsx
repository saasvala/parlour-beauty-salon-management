import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { user, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      // Redirect based on their actual role
      const primaryRole = roles[0];
      const roleRedirects: Record<AppRole, string> = {
        super_admin: '/super-admin',
        salon_owner: '/dashboard',
        branch_manager: '/dashboard',
        receptionist: '/receptionist',
        beautician: '/staff',
        customer: '/customer',
      };
      
      return <Navigate to={roleRedirects[primaryRole] || '/'} replace />;
    }
  }

  return <>{children}</>;
};
