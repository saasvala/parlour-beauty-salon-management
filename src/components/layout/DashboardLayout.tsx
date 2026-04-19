import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScissorsIcon } from '@/components/icons/SalonIcons';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Building2,
  UserCircle,
  Clock,
  Wallet,
  ShoppingBag,
  Star,
  ChevronDown,
  Receipt,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, salon, signOut } = useAuth();
  const { primaryRole, isSuperAdmin, isSalonOwner, isReceptionist, isBeautician } = useRoleAccess();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavItems = (): NavItem[] => {
    if (isSuperAdmin()) {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/super-admin' },
        { label: 'Salons', icon: Building2, href: '/super-admin/salons' },
        { label: 'Subscriptions', icon: CreditCard, href: '/super-admin/subscriptions' },
        { label: 'Users', icon: Users, href: '/super-admin/users' },
        { label: 'Services Master', icon: Scissors, href: '/super-admin/services' },
        { label: 'Analytics', icon: BarChart3, href: '/super-admin/analytics' },
        { label: 'Settings', icon: Settings, href: '/super-admin/settings' },
      ];
    }

    if (isSalonOwner()) {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Appointments', icon: Calendar, href: '/dashboard/appointments' },
        { label: 'Customers', icon: Users, href: '/dashboard/customers' },
        { label: 'Staff', icon: UserCircle, href: '/dashboard/staff' },
        { label: 'Services', icon: Scissors, href: '/dashboard/services' },
        { label: 'Packages', icon: Package, href: '/dashboard/packages' },
        { label: 'Billing', icon: CreditCard, href: '/dashboard/billing' },
        { label: 'Expenses', icon: Receipt, href: '/dashboard/expenses' },
        { label: 'Inventory', icon: ShoppingBag, href: '/dashboard/inventory' },
        { label: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
        { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
      ];
    }

    if (isReceptionist()) {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/receptionist' },
        { label: 'Appointments', icon: Calendar, href: '/receptionist/appointments' },
        { label: 'Walk-in', icon: Clock, href: '/receptionist/walkin' },
        { label: 'Customers', icon: Users, href: '/receptionist/customers' },
        { label: 'Billing', icon: CreditCard, href: '/receptionist/billing' },
        { label: 'Daily Summary', icon: BarChart3, href: '/receptionist/summary' },
      ];
    }

    if (isBeautician()) {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/staff' },
        { label: 'My Appointments', icon: Calendar, href: '/staff/appointments' },
        { label: 'Attendance', icon: Clock, href: '/staff/attendance' },
        { label: 'Commission', icon: Wallet, href: '/staff/commission' },
        { label: 'Schedule', icon: Calendar, href: '/staff/schedule' },
      ];
    }

    // Customer
    return [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/customer' },
      { label: 'Book Appointment', icon: Calendar, href: '/customer/book' },
      { label: 'My Bookings', icon: Clock, href: '/customer/bookings' },
      { label: 'Packages', icon: Package, href: '/customer/packages' },
      { label: 'Invoices', icon: CreditCard, href: '/customer/invoices' },
      { label: 'Reviews', icon: Star, href: '/customer/reviews' },
    ];
  };

  const navItems = getNavItems();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const settingsHref = isSuperAdmin()
    ? '/super-admin/settings'
    : isSalonOwner()
    ? '/dashboard/settings'
    : isReceptionist()
    ? '/receptionist'
    : isBeautician()
    ? '/staff'
    : '/customer';

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      salon_owner: 'Salon Owner',
      branch_manager: 'Branch Manager',
      receptionist: 'Receptionist',
      beautician: 'Beautician',
      customer: 'Customer',
    };
    return primaryRole ? labels[primaryRole] : 'User';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-secondary"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-luxury">
                <ScissorsIcon size={20} className="text-background" />
              </div>
              <span className="font-serif text-lg font-bold">GlamFlow</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link to="/" title="Back to Home">
              <Button variant="ghost" size="icon"><Home className="w-5 h-5" /></Button>
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate(settingsHref)} title="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Open user menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{profile?.full_name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{getRoleLabel()}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(settingsHref)}>
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(settingsHref)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -280 }}
            className="lg:hidden fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border pt-16"
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-card border-r border-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-luxury">
              <ScissorsIcon size={24} className="text-background" />
            </div>
            {sidebarOpen && (
              <span className="font-serif text-xl font-bold">
                Glam<span className="text-gradient">Flow</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-secondary"
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform", sidebarOpen ? "rotate-90" : "-rotate-90")} />
          </button>
        </div>

        {/* Salon Info */}
        {salon && sidebarOpen && (
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground">Current Salon</p>
            <p className="font-medium text-sm truncate">{salon.name}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                location.pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
              {item.badge && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="p-3 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors",
                !sidebarOpen && "justify-center"
              )}>
                <Avatar className="w-9 h-9">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(settingsHref)}>
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(settingsHref)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 lg:pt-0 transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-semibold">
              {navItems.find(item => item.href === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" title="Back to Home">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden xl:inline">Back to Home</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate(settingsHref)} title="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
