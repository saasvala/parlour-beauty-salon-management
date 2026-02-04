import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AnimatedBorderCard, GlowingOrb, SparkleEffect } from "@/components/ui/animated-3d-icon";
import { 
  ScissorsIcon, 
  CombIcon, 
  NailPolishIcon, 
  SpaStoneIcon, 
  MakeupBrushIcon, 
  LotionBottleIcon,
  HairDryerIcon,
  MirrorIcon
} from "@/components/icons/SalonIcons";
import { Calendar, Users, CreditCard, BarChart3, Bell, Settings, Gift, Zap, Brain } from "lucide-react";

const features = [
  {
    icon: <Calendar className="w-7 h-7" />,
    salonIcon: <ScissorsIcon size={20} />,
    title: "Smart Scheduling",
    description: "Drag-and-drop calendar with color-coded bookings, automated reminders, and AI-powered optimization.",
    gradient: "from-rose-gold to-rose-gold-light",
    delay: 0,
  },
  {
    icon: <Users className="w-7 h-7" />,
    salonIcon: <MirrorIcon size={20} />,
    title: "Client Management",
    description: "Complete profiles with visit history, preferences, loyalty tracking, and personalized recommendations.",
    gradient: "from-gold to-gold-light",
    delay: 0.1,
  },
  {
    icon: <CreditCard className="w-7 h-7" />,
    salonIcon: <NailPolishIcon size={20} />,
    title: "Elegant Billing",
    description: "Beautiful invoices, multiple payment methods, automatic receipts, and seamless transactions.",
    gradient: "from-plum to-burgundy",
    delay: 0.2,
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    salonIcon: <CombIcon size={20} />,
    title: "Insightful Reports",
    description: "Interactive 3D charts showing revenue trends, popular services, and staff performance analytics.",
    gradient: "from-rose-gold to-gold",
    delay: 0.3,
  },
  {
    icon: <Gift className="w-7 h-7" />,
    salonIcon: <SpaStoneIcon size={20} />,
    title: "Loyalty Rewards",
    description: "Animated progress bars, points system, tiered rewards, and personalized VIP offers.",
    gradient: "from-gold to-rose-gold-light",
    delay: 0.4,
  },
  {
    icon: <Bell className="w-7 h-7" />,
    salonIcon: <HairDryerIcon size={20} />,
    title: "Smart Notifications",
    description: "Automated reminders, promotional alerts, real-time updates, and SMS/email campaigns.",
    gradient: "from-burgundy to-plum",
    delay: 0.5,
  },
  {
    icon: <Brain className="w-7 h-7" />,
    salonIcon: <MakeupBrushIcon size={20} />,
    title: "AI Insights",
    description: "Smart suggestions for best-selling services, staff efficiency alerts, and revenue predictions.",
    gradient: "from-rose-gold-light to-gold",
    delay: 0.6,
  },
  {
    icon: <Settings className="w-7 h-7" />,
    salonIcon: <LotionBottleIcon size={20} />,
    title: "Inventory Control",
    description: "Product tracking with animated low-stock alerts, auto-reorder, and supplier management.",
    gradient: "from-gold-light to-rose-gold",
    delay: 0.7,
  },
];

const FeatureCard = ({ feature }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay: feature.delay }}
      className="perspective-1000"
    >
      <AnimatedBorderCard className="h-full">
        <motion.div
          className="relative p-6 h-full group"
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.3 } 
          }}
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-rose-gold/5 to-gold/5" />
          
          <div className="relative flex flex-col h-full">
            {/* Icon container with 3D effect */}
            <div className="relative mb-6">
              <motion.div
                className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-primary-foreground shadow-xl`}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                  boxShadow: "0 20px 40px hsl(var(--rose-gold) / 0.3)"
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {feature.icon}
              </motion.div>
              
              {/* Floating salon icon */}
              <motion.div
                className="absolute -top-2 -right-2 p-2.5 rounded-full bg-champagne text-rose-gold shadow-lg border border-gold/20"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                whileHover={{ scale: 1.2 }}
              >
                {feature.salonIcon}
              </motion.div>

              <SparkleEffect count={3} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <h3 className="font-serif text-xl font-bold mb-3 text-foreground group-hover:text-gradient transition-all duration-300">
              {feature.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed flex-grow text-sm">
              {feature.description}
            </p>

            {/* Animated bottom line */}
            <motion.div 
              className="mt-5 h-1 rounded-full overflow-hidden bg-muted"
            >
              <motion.div
                className={`h-full bg-gradient-to-r ${feature.gradient}`}
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1, delay: feature.delay + 0.5 }}
              />
            </motion.div>

            {/* Learn more link */}
            <motion.div 
              className="mt-4 flex items-center gap-2 text-rose-gold font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
              whileHover={{ x: 5 }}
            >
              <span>Learn more</span>
              <Zap className="w-4 h-4" />
            </motion.div>
          </div>
        </motion.div>
      </AnimatedBorderCard>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      id="features"
      ref={sectionRef} 
      className="py-32 bg-gradient-to-b from-background via-champagne/10 to-background relative overflow-hidden"
    >
      {/* Decorative elements */}
      <GlowingOrb color="pink" size="lg" className="-top-32 -left-32" />
      <GlowingOrb color="gold" size="md" className="top-1/2 -right-16" />
      <GlowingOrb color="purple" size="sm" className="bottom-20 left-1/4" />

      {/* Animated lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-gold/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blush text-rose-gold text-sm font-semibold mb-6 border border-rose-gold/20"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-4 h-4" />
            Powerful Features
          </motion.span>
          
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Everything You Need to
            <span className="text-gradient block mt-2">Shine Brilliantly</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A complete suite of ultra-premium tools designed specifically for beauty professionals who demand excellence
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            And many more features to explore...
          </p>
          <motion.button
            className="inline-flex items-center gap-2 text-rose-gold font-semibold hover:text-gold transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <span>View All Features</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
