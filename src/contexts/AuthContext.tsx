import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, Profile, Salon, Staff } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  primaryRole: AppRole | null;
  salon: Salon | null;
  staff: Staff | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesData) {
        const userRoles = rolesData.map(r => r.role as AppRole);
        setRoles(userRoles);
      }

      // Fetch salon (if owner)
      const { data: salonData } = await supabase
        .from('salons')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (salonData) {
        setSalon(salonData as Salon);
      }

      // Fetch staff record
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (staffData) {
        // Cast working_hours from JSON to proper type
        const typedStaff: Staff = {
          ...staffData,
          specialization: staffData.specialization || [],
          working_hours: staffData.working_hours as unknown as Staff['working_hours'],
        };
        setStaff(typedStaff);
        
        // If staff but no salon yet, fetch the salon they belong to
        if (!salonData && staffData.salon_id) {
          const { data: staffSalonData } = await supabase
            .from('salons')
            .select('*')
            .eq('id', staffData.salon_id)
            .single();
          
          if (staffSalonData) {
            setSalon(staffSalonData as Salon);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer data fetching to avoid deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setSalon(null);
          setStaff(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setSalon(null);
    setStaff(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  // Determine primary role (highest privilege)
  const getPrimaryRole = (): AppRole | null => {
    const roleHierarchy: AppRole[] = [
      'super_admin',
      'salon_owner',
      'branch_manager',
      'receptionist',
      'beautician',
      'customer',
    ];
    
    for (const role of roleHierarchy) {
      if (roles.includes(role)) {
        return role;
      }
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    roles,
    primaryRole: getPrimaryRole(),
    salon,
    staff,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
