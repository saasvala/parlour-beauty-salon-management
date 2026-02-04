import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { 
  ScissorsIcon, 
  NailPolishIcon, 
  SpaStoneIcon,
  CombIcon,
  MakeupBrushIcon,
  FlowerIcon
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
  Building2,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SparkleEffect } from "@/components/ui/animated-3d-icon";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { 
    icon: <LayoutDashboard className="w-5 h-5" />, 
    label: "Dashboard", 
    path: "/admin",
    salonIcon: <ScissorsIcon size={14} />,
    gradient: "from-rose-gold to-gold"
  },
  { 
    icon: <Calendar className="w-5 h-5" />, 
    label: "Appointments", 
    path: "/admin/appointments",
    salonIcon: <CombIcon size={14} />,
    gradient: "from-gold to-gold-light"
  },
  { 
    icon: <Sparkles className="w-5 h-5" />, 
    label: "Services", 
    path: "/admin/services",
    salonIcon: <NailPolishIcon size={14} />,
    gradient: "from-plum to-rose-gold"
  },
  { 
    icon: <Users className="w-5 h-5" />, 
    label: "Staff", 
    path: "/admin/staff",
    salonIcon: <MakeupBrushIcon size={14} />,
    gradient: "from-rose-gold-light to-gold"
  },
  { 
    icon: <Users className="w-5 h-5" />, 
    label: "Customers", 
    path: "/admin/customers",
    salonIcon: <SpaStoneIcon size={14} />,
    gradient: "from-emerald-500 to-teal-400"
  },
  { 
    icon: <CreditCard className="w-5 h-5" />, 
    label: "Billing", 
    path: "/admin/billing",
    salonIcon: <ScissorsIcon size={14} />,
    gradient: "from-gold to-champagne"
  },
  { 
    icon: <Package className="w-5 h-5" />, 
    label: "Inventory", 
    path: "/admin/inventory",
    salonIcon: <CombIcon size={14} />,
    gradient: "from-burgundy to-plum"
  },
  { 
    icon: <BarChart3 className="w-5 h-5" />, 
    label: "Reports", 
    path: "/admin/reports",
    salonIcon: <NailPolishIcon size={14} />,
    gradient: "from-rose-gold to-rose-gold-light"
  },
  { 
    icon: <Building2 className="w-5 h-5" />, 
    label: "Branches", 
    path: "/admin/branches",
    salonIcon: <SpaStoneIcon size={14} />,
    gradient: "from-gold-light to-rose-gold"
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
      className="fixed left-0 top-0 h-screen bg-card/95 backdrop-blur-xl border-r border-border/30 z-50 flex flex-col shadow-xl"
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-gold/5 via-transparent to-gold/5 pointer-events-none" />
      
      {/* Logo */}
      <div className="p-4 border-b border-border/30 relative">
        <Link to="/admin" className="flex items-center gap-3 group">
          <motion.div
            className="p-3 rounded-xl bg-gradient-luxury flex-shrink-0 shadow-lg relative overflow-hidden"
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <ScissorsIcon size={22} className="text-primary-foreground relative z-10" />
            <motion.div 
              className="absolute inset-0 bg-white/20"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-serif text-xl font-bold text-gradient">
                GlamourFlow
              </span>
              <span className="text-xs text-muted-foreground">Salon Management</span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Toggle button */}
      <motion.button
        onClick={onToggle}
        className="absolute -right-3.5 top-20 p-2 rounded-full bg-card border border-border/50 shadow-lg hover:bg-blush hover:border-rose-gold/30 transition-all z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </motion.button>

      {/* Main menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto relative">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
            >
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-blush/50"
                )}
                whileHover={{ x: 3 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Active background gradient */}
                {isActive && (
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl`}
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <span className="flex-shrink-0 relative z-10">{item.icon}</span>
                {!collapsed && (
                  <>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium relative z-10"
                    >
                      {item.label}
                    </motion.span>
                    <motion.span
                      className={cn(
                        "ml-auto relative z-10 transition-opacity",
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                      )}
                    >
                      {item.salonIcon}
                    </motion.span>
                  </>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-card border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                )}

                {isActive && <SparkleEffect count={2} className="z-20" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom menu */}
      <div className="p-3 border-t border-border/30 space-y-1 relative">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
            >
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative group",
                  isActive
                    ? "bg-blush text-foreground"
                    : "text-muted-foreground hover:bg-blush/50 hover:text-foreground"
                )}
                whileHover={{ x: 3 }}
              >
                <span className="relative flex-shrink-0">
                  {item.icon}
                  {item.badge && (
                    <motion.span 
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gradient-luxury text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-lg"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {item.badge}
                    </motion.span>
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
              </motion.div>
            </Link>
          );
        })}

        {/* Logout */}
        <Link to="/">
          <motion.div
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-300"
            whileHover={{ x: 3 }}
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
          </motion.div>
        </Link>
      </div>

      {/* User info */}
      {!collapsed && (
        <motion.div 
          className="p-4 border-t border-border/30 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-3 p-2 rounded-xl bg-champagne/30 border border-gold/20">
            <motion.div 
              className="w-11 h-11 rounded-xl bg-gradient-luxury flex items-center justify-center text-primary-foreground font-bold shadow-lg relative"
              whileHover={{ scale: 1.1 }}
            >
              JD
              <motion.div
                className="absolute -top-1 -right-1 p-0.5 rounded-full bg-card border border-gold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-3 h-3 text-gold" />
              </motion.div>
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">Jane Doe</p>
              <p className="text-xs text-muted-foreground truncate">Super Admin</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <FlowerIcon size={18} className="text-rose-gold/50" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default AdminSidebar;
