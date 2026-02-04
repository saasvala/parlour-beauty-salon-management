import { useState } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { SalonCard } from "@/components/ui/salon-card";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { Animated3DIcon, GlowingOrb, FloatingParticles, SparkleEffect } from "@/components/ui/animated-3d-icon";
import { 
  ScissorsIcon, 
  NailPolishIcon, 
  SpaStoneIcon,
  MakeupBrushIcon,
  HairDryerIcon,
  FloatingIcon,
  FlowerIcon,
  CombIcon
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
  Plus,
  ArrowUpRight,
  Sparkles,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";

const stats = [
  {
    icon: <Calendar className="w-6 h-6" />,
    salonIcon: <ScissorsIcon size={20} />,
    title: "Today's Appointments",
    value: 24,
    trend: "+12% from yesterday",
    trendUp: true,
    gradient: "from-rose-gold to-rose-gold-light",
    bgGradient: "from-rose-gold/10 to-blush/50",
  },
  {
    icon: <Users className="w-6 h-6" />,
    salonIcon: <NailPolishIcon size={20} />,
    title: "Active Customers",
    value: "1,847",
    trend: "+8% this month",
    trendUp: true,
    gradient: "from-gold to-gold-light",
    bgGradient: "from-gold/10 to-champagne/50",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    salonIcon: <SpaStoneIcon size={20} />,
    title: "Today's Revenue",
    value: "$3,240",
    trend: "+23% from avg",
    trendUp: true,
    gradient: "from-emerald-500 to-teal-400",
    bgGradient: "from-emerald-500/10 to-mint/50",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    salonIcon: <MakeupBrushIcon size={20} />,
    title: "Staff Efficiency",
    value: "94%",
    trend: "+5% improvement",
    trendUp: true,
    gradient: "from-plum to-burgundy",
    bgGradient: "from-plum/10 to-lavender/50",
  },
];

const upcomingAppointments = [
  { time: "09:00 AM", customer: "Sarah Johnson", service: "Hair Styling", staff: "Emma W.", status: "confirmed", avatar: "SJ" },
  { time: "09:30 AM", customer: "Emily Davis", service: "Manicure", staff: "Olivia M.", status: "confirmed", avatar: "ED" },
  { time: "10:00 AM", customer: "Jessica Brown", service: "Facial Treatment", staff: "Sophia L.", status: "pending", avatar: "JB" },
  { time: "10:30 AM", customer: "Amanda Wilson", service: "Hair Color", staff: "Emma W.", status: "confirmed", avatar: "AW" },
  { time: "11:00 AM", customer: "Rachel Green", service: "Spa Package", staff: "Isabella K.", status: "confirmed", avatar: "RG" },
];

const topServices = [
  { name: "Hair Styling", icon: <ScissorsIcon size={28} />, bookings: 156, revenue: "$7,800", growth: "+15%", gradient: "from-rose-gold to-rose-gold-light" },
  { name: "Manicure", icon: <NailPolishIcon size={28} />, bookings: 134, revenue: "$4,690", growth: "+12%", gradient: "from-plum to-burgundy" },
  { name: "Facial", icon: <SpaStoneIcon size={28} />, bookings: 98, revenue: "$6,370", growth: "+8%", gradient: "from-emerald-500 to-teal-400" },
  { name: "Makeup", icon: <MakeupBrushIcon size={28} />, bookings: 87, revenue: "$4,785", growth: "+22%", gradient: "from-gold to-gold-light" },
];

const topStaff = [
  { name: "Emma Watson", role: "Senior Stylist", rating: 4.9, appointments: 48, avatar: "EW", color: "from-rose-gold to-gold" },
  { name: "Olivia Martin", role: "Nail Technician", rating: 4.8, appointments: 42, avatar: "OM", color: "from-plum to-rose-gold" },
  { name: "Sophia Lee", role: "Aesthetician", rating: 4.9, appointments: 38, avatar: "SL", color: "from-gold to-champagne" },
];

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-champagne/5 to-blush/10 relative overflow-hidden">
      {/* Background decorations */}
      <GlowingOrb color="pink" size="lg" className="fixed top-20 -right-32 opacity-30" />
      <GlowingOrb color="gold" size="md" className="fixed bottom-20 -left-16 opacity-30" />
      <FloatingParticles count={15} className="fixed inset-0 opacity-50" />

      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      <main 
        className="transition-all duration-300 relative"
        style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      >
        {/* Enhanced Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
                <motion.span 
                  className="px-3 py-1 rounded-full bg-gradient-luxury text-primary-foreground text-xs font-bold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  LIVE
                </motion.span>
              </motion.div>
              <p className="text-muted-foreground text-sm mt-1">Welcome back, here's what's happening today</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-72 rounded-xl bg-card/50 border-border/50 focus:border-rose-gold/50 focus:ring-rose-gold/20"
                />
              </div>
              <motion.button 
                className="relative p-3 rounded-xl bg-card/50 border border-border/30 hover:bg-blush/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <motion.span 
                  className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-gradient-luxury"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.button>
              <LuxuryButton size="sm" className="shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </LuxuryButton>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Floating decorative icons */}
          <div className="fixed right-10 top-40 pointer-events-none">
            <FloatingIcon delay={0} className="opacity-20">
              <HairDryerIcon size={48} className="text-rose-gold" />
            </FloatingIcon>
          </div>
          <div className="fixed right-32 top-64 pointer-events-none">
            <FloatingIcon delay={1} className="opacity-15">
              <FlowerIcon size={36} className="text-gold" />
            </FloatingIcon>
          </div>
          <div className="fixed right-16 bottom-32 pointer-events-none">
            <FloatingIcon delay={2} className="opacity-15">
              <CombIcon size={32} className="text-plum" />
            </FloatingIcon>
          </div>

          {/* Enhanced Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="perspective-1000"
              >
                <div className={`relative rounded-2xl p-6 bg-gradient-to-br ${stat.bgGradient} border border-border/30 overflow-hidden group`}>
                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 blur-xl bg-gradient-to-br ${stat.gradient} opacity-20`} />
                  </div>

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 font-medium">{stat.title}</p>
                      <p className="text-4xl font-serif font-bold text-foreground">{stat.value}</p>
                      <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trendUp ? "text-emerald-600" : "text-destructive"}`}>
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="font-medium">{stat.trend}</span>
                      </div>
                    </div>
                    <Animated3DIcon
                      variant="gradient"
                      size="lg"
                      floatDelay={index * 0.3}
                      className={`bg-gradient-to-br ${stat.gradient}`}
                    >
                      {stat.icon}
                    </Animated3DIcon>
                  </div>

                  {/* Decorative salon icon */}
                  <motion.div
                    className="absolute bottom-3 right-3 text-foreground/10"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  >
                    {stat.salonIcon}
                  </motion.div>

                  <SparkleEffect count={3} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Appointments - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <SalonCard variant="glass" padding="none" className="backdrop-blur-xl">
                <div className="p-6 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Animated3DIcon variant="rose" size="sm" floatDelay={0}>
                      <Clock className="w-5 h-5 text-primary-foreground" />
                    </Animated3DIcon>
                    <h2 className="font-serif text-xl font-bold text-foreground">Upcoming Appointments</h2>
                  </div>
                  <LuxuryButton variant="ghost" size="sm">
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </LuxuryButton>
                </div>
                <div className="divide-y divide-border/30">
                  {upcomingAppointments.map((apt, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                      whileHover={{ backgroundColor: "hsl(var(--blush) / 0.3)" }}
                      className="p-4 flex items-center gap-4 cursor-pointer group transition-colors"
                    >
                      <div className="text-center min-w-[80px]">
                        <span className="text-sm font-bold text-foreground">{apt.time}</span>
                      </div>
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-gradient-luxury flex items-center justify-center text-primary-foreground font-bold shadow-lg"
                        whileHover={{ scale: 1.1 }}
                      >
                        {apt.avatar}
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground group-hover:text-rose-gold transition-colors">{apt.customer}</p>
                        <p className="text-sm text-muted-foreground">{apt.service} • {apt.staff}</p>
                      </div>
                      <motion.span 
                        className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                          apt.status === "confirmed" 
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {apt.status}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              </SalonCard>
            </motion.div>

            {/* Top Staff - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SalonCard variant="glass" padding="none" className="backdrop-blur-xl h-full">
                <div className="p-6 border-b border-border/30 flex items-center gap-3">
                  <Animated3DIcon variant="gold" size="sm" floatDelay={0.5}>
                    <Star className="w-5 h-5 text-primary-foreground" />
                  </Animated3DIcon>
                  <h2 className="font-serif text-xl font-bold text-foreground">Top Performers</h2>
                </div>
                <div className="p-4 space-y-4">
                  {topStaff.map((staff, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-blush/30 transition-all cursor-pointer group border border-transparent hover:border-rose-gold/20"
                    >
                      <motion.div 
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${staff.color} flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        {staff.avatar}
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground group-hover:text-gradient transition-all">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">{staff.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Star className="w-5 h-5 fill-gold text-gold" />
                          </motion.div>
                          <span className="font-bold text-foreground">{staff.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{staff.appointments} bookings</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SalonCard>
            </motion.div>
          </div>

          {/* Top Services - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6"
          >
            <SalonCard variant="glass" padding="none" className="backdrop-blur-xl">
              <div className="p-6 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Animated3DIcon variant="gradient" size="sm" floatDelay={1}>
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  </Animated3DIcon>
                  <h2 className="font-serif text-xl font-bold text-foreground">Top Services This Month</h2>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span>Based on revenue</span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {topServices.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      whileHover={{ y: -8, scale: 1.03 }}
                      className="perspective-1000 group cursor-pointer"
                    >
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-champagne/50 to-blush/50 border border-border/30 relative overflow-hidden transform-3d">
                        {/* Glow on hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl bg-gradient-to-br ${service.gradient}`} style={{ opacity: 0.1 }} />
                        
                        <div className="relative flex items-center gap-4 mb-4">
                          <Animated3DIcon
                            size="md"
                            variant="gradient"
                            floatDelay={index * 0.2}
                            className={`bg-gradient-to-br ${service.gradient}`}
                          >
                            {service.icon}
                          </Animated3DIcon>
                          <span className="font-semibold text-foreground group-hover:text-gradient transition-all">{service.name}</span>
                        </div>
                        <div className="relative flex items-end justify-between">
                          <div>
                            <p className="text-3xl font-bold text-foreground">{service.bookings}</p>
                            <p className="text-xs text-muted-foreground">bookings</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gradient text-lg">{service.revenue}</p>
                            <p className="text-xs font-semibold text-emerald-600">{service.growth}</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${service.gradient}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(service.bookings / 160) * 100}%` }}
                            transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                          />
                        </div>

                        <SparkleEffect count={3} className="opacity-0 group-hover:opacity-100 transition-opacity" />
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
