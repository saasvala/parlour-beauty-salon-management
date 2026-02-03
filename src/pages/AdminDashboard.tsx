import { useState } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { StatsCard, SalonCard } from "@/components/ui/salon-card";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { 
  ScissorsIcon, 
  NailPolishIcon, 
  SpaStoneIcon,
  MakeupBrushIcon,
  HairDryerIcon,
  FloatingIcon
} from "@/components/icons/SalonIcons";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  Star,
  Bell,
  Search,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";

const stats = [
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Today's Appointments",
    value: 24,
    trend: "+12% from yesterday",
    trendUp: true,
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Active Customers",
    value: "1,847",
    trend: "+8% this month",
    trendUp: true,
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Today's Revenue",
    value: "$3,240",
    trend: "+23% from avg",
    trendUp: true,
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Staff Efficiency",
    value: "94%",
    trend: "+5% improvement",
    trendUp: true,
  },
];

const upcomingAppointments = [
  { time: "09:00 AM", customer: "Sarah Johnson", service: "Hair Styling", staff: "Emma W.", status: "confirmed" },
  { time: "09:30 AM", customer: "Emily Davis", service: "Manicure", staff: "Olivia M.", status: "confirmed" },
  { time: "10:00 AM", customer: "Jessica Brown", service: "Facial Treatment", staff: "Sophia L.", status: "pending" },
  { time: "10:30 AM", customer: "Amanda Wilson", service: "Hair Color", staff: "Emma W.", status: "confirmed" },
  { time: "11:00 AM", customer: "Rachel Green", service: "Spa Package", staff: "Isabella K.", status: "confirmed" },
];

const topServices = [
  { name: "Hair Styling", icon: <ScissorsIcon size={24} />, bookings: 156, revenue: "$7,800", growth: "+15%" },
  { name: "Manicure", icon: <NailPolishIcon size={24} />, bookings: 134, revenue: "$4,690", growth: "+12%" },
  { name: "Facial", icon: <SpaStoneIcon size={24} />, bookings: 98, revenue: "$6,370", growth: "+8%" },
  { name: "Makeup", icon: <MakeupBrushIcon size={24} />, bookings: 87, revenue: "$4,785", growth: "+22%" },
];

const topStaff = [
  { name: "Emma Watson", role: "Senior Stylist", rating: 4.9, appointments: 48, avatar: "EW" },
  { name: "Olivia Martin", role: "Nail Technician", rating: 4.8, appointments: 42, avatar: "OM" },
  { name: "Sophia Lee", role: "Aesthetician", rating: 4.9, appointments: 38, avatar: "SL" },
];

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-champagne/10 to-blush/10">
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      <main 
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Welcome back, here's what's happening today</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64 rounded-xl bg-card/50 border-border"
                />
              </div>
              <button className="relative p-2 rounded-xl hover:bg-blush transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-gold" />
              </button>
              <LuxuryButton size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Booking
              </LuxuryButton>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Floating decorative icons */}
          <div className="fixed right-10 top-32 pointer-events-none opacity-20">
            <FloatingIcon delay={0}>
              <HairDryerIcon size={40} className="text-rose-gold" />
            </FloatingIcon>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StatsCard
                  icon={stat.icon}
                  title={stat.title}
                  value={stat.value}
                  trend={stat.trend}
                  trendUp={stat.trendUp}
                />
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <SalonCard variant="glass" padding="none">
                <div className="p-6 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                      <Clock className="w-5 h-5 text-rose-gold" />
                      Upcoming Appointments
                    </h2>
                    <LuxuryButton variant="ghost" size="sm">
                      View All
                    </LuxuryButton>
                  </div>
                </div>
                <div className="divide-y divide-border/50">
                  {upcomingAppointments.map((apt, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      className="p-4 hover:bg-blush/30 transition-colors flex items-center gap-4"
                    >
                      <div className="text-center min-w-[70px]">
                        <span className="text-sm font-semibold text-foreground">{apt.time}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-luxury flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {apt.customer.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{apt.customer}</p>
                        <p className="text-sm text-muted-foreground">{apt.service} • {apt.staff}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === "confirmed" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {apt.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </SalonCard>
            </motion.div>

            {/* Top Staff */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SalonCard variant="glass" padding="none">
                <div className="p-6 border-b border-border/50">
                  <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                    <Star className="w-5 h-5 text-gold" />
                    Top Performers
                  </h2>
                </div>
                <div className="p-4 space-y-4">
                  {topStaff.map((staff, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-blush/30 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-gold to-gold flex items-center justify-center text-primary-foreground font-bold group-hover:scale-110 transition-transform">
                        {staff.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">{staff.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-gold">
                          <Star className="w-4 h-4 fill-gold" />
                          <span className="font-semibold">{staff.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{staff.appointments} bookings</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SalonCard>
            </motion.div>
          </div>

          {/* Top Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6"
          >
            <SalonCard variant="glass" padding="none">
              <div className="p-6 border-b border-border/50">
                <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-rose-gold" />
                  Top Services This Month
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topServices.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-champagne/50 to-blush/50 border border-border/50 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-card text-rose-gold group-hover:scale-110 transition-transform">
                          {service.icon}
                        </div>
                        <span className="font-medium text-foreground">{service.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-foreground">{service.bookings}</p>
                          <p className="text-xs text-muted-foreground">bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gradient">{service.revenue}</p>
                          <p className="text-xs text-emerald-600">{service.growth}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </SalonCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
