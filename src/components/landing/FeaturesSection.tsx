import { motion } from "framer-motion";
import { SalonCard } from "@/components/ui/salon-card";
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
import { Calendar, Users, CreditCard, BarChart3, Bell, Settings, Gift, Star } from "lucide-react";

const features = [
  {
    icon: <Calendar className="w-7 h-7" />,
    salonIcon: <ScissorsIcon size={24} />,
    title: "Smart Scheduling",
    description: "Drag-and-drop calendar with color-coded bookings and automated reminders.",
    color: "from-rose-gold to-rose-gold-light",
  },
  {
    icon: <Users className="w-7 h-7" />,
    salonIcon: <MirrorIcon size={24} />,
    title: "Client Management",
    description: "Complete profiles with visit history, preferences, and loyalty tracking.",
    color: "from-gold to-gold-light",
  },
  {
    icon: <CreditCard className="w-7 h-7" />,
    salonIcon: <NailPolishIcon size={24} />,
    title: "Elegant Billing",
    description: "Beautiful invoices, multiple payment methods, and seamless transactions.",
    color: "from-plum to-burgundy",
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    salonIcon: <CombIcon size={24} />,
    title: "Insightful Reports",
    description: "Interactive charts showing revenue trends, popular services, and staff performance.",
    color: "from-rose-gold to-gold",
  },
  {
    icon: <Gift className="w-7 h-7" />,
    salonIcon: <SpaStoneIcon size={24} />,
    title: "Loyalty Rewards",
    description: "Animated progress bars, points system, and personalized offers for VIP clients.",
    color: "from-gold to-rose-gold-light",
  },
  {
    icon: <Bell className="w-7 h-7" />,
    salonIcon: <HairDryerIcon size={24} />,
    title: "Smart Notifications",
    description: "Automated reminders, promotional alerts, and real-time updates.",
    color: "from-burgundy to-plum",
  },
  {
    icon: <Star className="w-7 h-7" />,
    salonIcon: <MakeupBrushIcon size={24} />,
    title: "AI Insights",
    description: "Smart suggestions for best-selling services and personalized recommendations.",
    color: "from-rose-gold-light to-gold",
  },
  {
    icon: <Settings className="w-7 h-7" />,
    salonIcon: <LotionBottleIcon size={24} />,
    title: "Inventory Control",
    description: "Product tracking with animated low-stock alerts and reorder suggestions.",
    color: "from-gold-light to-rose-gold",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-champagne/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-gold/30 to-transparent" />
      
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-blush text-rose-gold text-sm font-medium mb-4">
            ✨ Powerful Features
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Everything You Need to
            <span className="text-gradient"> Shine</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete suite of luxury tools designed specifically for beauty professionals
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <SalonCard
                variant="glow"
                className="h-full group hover:border-rose-gold/40"
              >
                <div className="flex flex-col h-full">
                  {/* Icon container */}
                  <div className="relative mb-5">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    {/* Floating salon icon */}
                    <motion.div
                      className="absolute -top-2 -right-2 p-2 rounded-full bg-champagne text-rose-gold shadow-md"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      {feature.salonIcon}
                    </motion.div>
                  </div>

                  {/* Content */}
                  <h3 className="font-serif text-xl font-semibold mb-3 text-foreground group-hover:text-rose-gold transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed flex-grow">
                    {feature.description}
                  </p>

                  {/* Hover effect line */}
                  <div className="mt-4 h-0.5 w-0 bg-gradient-luxury group-hover:w-full transition-all duration-500" />
                </div>
              </SalonCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
