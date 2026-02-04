import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { GlowingOrb, SparkleEffect } from "@/components/ui/animated-3d-icon";
import { 
  Shield, 
  UserCircle, 
  Scissors, 
  Heart,
  ChevronRight,
  CheckCircle2,
  Crown,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: <Shield className="w-10 h-10" />,
    crown: true,
    title: "Admin",
    subtitle: "Full Control",
    description: "Complete access to manage your entire salon empire with powerful analytics.",
    features: [
      "Staff & schedule management",
      "Financial reports & analytics",
      "Inventory & service control",
      "Multi-branch oversight",
    ],
    gradient: "from-burgundy via-plum to-rose-gold",
    bgGradient: "from-burgundy/10 to-plum/5",
    stats: { users: "1.2k", color: "text-burgundy" },
  },
  {
    icon: <UserCircle className="w-10 h-10" />,
    crown: false,
    title: "Receptionist",
    subtitle: "Front Desk Power",
    description: "Streamline client interactions and daily operations with ease.",
    features: [
      "Appointment scheduling",
      "Client check-in & billing",
      "Customer profile access",
      "Notification management",
    ],
    gradient: "from-rose-gold via-rose-gold-light to-gold",
    bgGradient: "from-rose-gold/10 to-blush",
    stats: { users: "2.8k", color: "text-rose-gold" },
  },
  {
    icon: <Scissors className="w-10 h-10" />,
    crown: false,
    title: "Beautician",
    subtitle: "Service Excellence",
    description: "Focus on what you do best - making clients look and feel beautiful.",
    features: [
      "View assigned appointments",
      "Update service status",
      "Track performance stats",
      "Client preferences access",
    ],
    gradient: "from-gold via-gold-light to-champagne",
    bgGradient: "from-gold/10 to-champagne/50",
    stats: { users: "5.4k", color: "text-gold" },
  },
  {
    icon: <Heart className="w-10 h-10" />,
    crown: false,
    title: "Customer",
    subtitle: "VIP Experience",
    description: "Enjoy a seamless luxury booking experience with exclusive perks.",
    features: [
      "Online appointment booking",
      "View packages & loyalty points",
      "Payment history access",
      "Personalized recommendations",
    ],
    gradient: "from-rose-gold-light via-gold-light to-mint",
    bgGradient: "from-lavender/30 to-mint/30",
    stats: { users: "45k", color: "text-emerald-600" },
  },
];

const RoleCard = ({ role, index }: { role: typeof roles[0]; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateY: index % 2 === 0 ? -10 : 10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="perspective-1000 h-full"
    >
      <motion.div
        className={`relative h-full rounded-3xl overflow-hidden bg-gradient-to-br ${role.bgGradient} border border-border/30 transform-3d`}
        animate={{
          rotateX: isHovered ? 3 : 0,
          scale: isHovered ? 1.03 : 1,
          y: isHovered ? -8 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          boxShadow: isHovered 
            ? `0 30px 60px -15px hsl(var(--rose-gold) / 0.25), 0 0 50px hsl(var(--rose-gold) / 0.1)`
            : "0 10px 40px -10px hsl(var(--foreground) / 0.1)"
        }}
      >
        {/* Top gradient bar */}
        <motion.div 
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${role.gradient}`}
          animate={{ scaleX: isHovered ? 1.1 : 1 }}
          style={{ transformOrigin: "center" }}
        />

        {/* Crown badge for admin */}
        {role.crown && (
          <motion.div
            className="absolute top-4 right-4 z-10"
            animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-2 rounded-full bg-gradient-to-br from-gold to-gold-light shadow-lg">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
          </motion.div>
        )}

        <div className="p-8 h-full flex flex-col">
          {/* Icon */}
          <motion.div
            className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${role.gradient} text-primary-foreground shadow-xl mb-6 self-start`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {role.icon}
            <SparkleEffect count={3} className={isHovered ? "opacity-100" : "opacity-0"} />
          </motion.div>

          {/* Content */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${role.stats.color}`}>{role.stats.users} active users</span>
            </div>
            <span className="text-sm text-muted-foreground">{role.subtitle}</span>
            <h3 className="font-serif text-3xl font-bold text-foreground mt-1">
              {role.title}
            </h3>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {role.description}
            </p>
          </div>

          {/* Features list */}
          <ul className="space-y-3 mb-8 flex-grow">
            {role.features.map((feature, featureIndex) => (
              <motion.li
                key={featureIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + featureIndex * 0.1 }}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <motion.div
                  animate={{ scale: isHovered ? 1.2 : 1 }}
                  transition={{ delay: featureIndex * 0.05 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-rose-gold flex-shrink-0" />
                </motion.div>
                {feature}
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <Link to="/login" className="mt-auto">
            <LuxuryButton
              className="w-full group"
              size="sm"
            >
              <span>Login as {role.title}</span>
              <motion.span
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-5 h-5 ml-1" />
              </motion.span>
            </LuxuryButton>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

const RolesSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="py-32 bg-gradient-to-b from-champagne/10 via-background to-background relative overflow-hidden"
    >
      {/* Decorative elements */}
      <GlowingOrb color="pink" size="lg" className="top-20 -right-32" />
      <GlowingOrb color="gold" size="md" className="-bottom-16 -left-16" />
      <GlowingOrb color="purple" size="sm" className="top-1/2 left-1/4" />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-rose-gold/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-lavender text-plum text-sm font-semibold mb-6 border border-plum/20"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4" />
            Role-Based Access
          </motion.span>
          
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Tailored Dashboards for
            <span className="text-gradient block mt-2">Every Role</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Each team member gets a personalized, feature-rich dashboard designed for their unique responsibilities
          </p>
        </motion.div>

        {/* Roles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <RoleCard key={index} role={role} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
