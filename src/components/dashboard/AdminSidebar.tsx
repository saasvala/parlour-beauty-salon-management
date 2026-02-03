import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { 
  ScissorsIcon, 
  NailPolishIcon, 
  SpaStoneIcon,
  CombIcon,
  MakeupBrushIcon 
} from "@/components/icons/SalonIcons";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Sparkles,
  CreditCard,
  Package,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { 
    icon: <LayoutDashboard className="w-5 h-5" />, 
    label: "Dashboard", 
    path: "/admin",
    salonIcon: <ScissorsIcon size={14} />
  },
  { 
    icon: <Calendar className="w-5 h-5" />, 
    label: "Appointments", 
    path: "/admin/appointments",
    salonIcon: <CombIcon size={14} />
  },
  { 
    icon: <Sparkles className="w-5 h-5" />, 
    label: "Services", 
    path: "/admin/services",
    salonIcon: <NailPolishIcon size={14} />
  },
  { 
    icon: <Users className="w-5 h-5" />, 
    label: "Staff", 
    path: "/admin/staff",
    salonIcon: <MakeupBrushIcon size={14} />
  },
  { 
    icon: <Users className="w-5 h-5" />, 
    label: "Customers", 
    path: "/admin/customers",
    salonIcon: <SpaStoneIcon size={14} />
  },
  { 
    icon: <CreditCard className="w-5 h-5" />, 
    label: "Billing", 
    path: "/admin/billing",
    salonIcon: <ScissorsIcon size={14} />
  },
  { 
    icon: <Package className="w-5 h-5" />, 
    label: "Inventory", 
    path: "/admin/inventory",
    salonIcon: <CombIcon size={14} />
  },
  { 
    icon: <BarChart3 className="w-5 h-5" />, 
    label: "Reports", 
    path: "/admin/reports",
    salonIcon: <NailPolishIcon size={14} />
  },
  { 
    icon: <Building2 className="w-5 h-5" />, 
    label: "Branches", 
    path: "/admin/branches",
    salonIcon: <SpaStoneIcon size={14} />
  },
];

const bottomItems = [
  { icon: <Bell className="w-5 h-5" />, label: "Notifications", path: "/admin/notifications", badge: 3 },
  { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/admin/settings" },
];

const AdminSidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-card border-r border-border/50 z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Link to="/admin" className="flex items-center gap-3">
          <motion.div
            className="p-2.5 rounded-xl bg-gradient-luxury flex-shrink-0"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <ScissorsIcon size={22} className="text-primary-foreground" />
          </motion.div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-serif text-xl font-bold text-gradient"
            >
              GlamourFlow
            </motion.span>
          )}
        </Link>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 p-1.5 rounded-full bg-card border border-border shadow-md hover:bg-blush transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Main menu */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
                isActive
                  ? "bg-gradient-luxury text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-blush hover:text-foreground"
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              {!collapsed && (
                <motion.span
                  className={cn(
                    "ml-auto transition-opacity",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  )}
                >
                  {item.salonIcon}
                </motion.span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom menu */}
      <div className="p-3 border-t border-border/50 space-y-1.5">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative group",
                isActive
                  ? "bg-blush text-foreground"
                  : "text-muted-foreground hover:bg-blush hover:text-foreground"
              )}
            >
              <span className="relative flex-shrink-0">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </span>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}

        {/* Logout */}
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-300"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium"
            >
              Logout
            </motion.span>
          )}
        </Link>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-luxury flex items-center justify-center text-primary-foreground font-semibold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">Jane Doe</p>
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default AdminSidebar;
