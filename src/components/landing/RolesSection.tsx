import { motion } from "framer-motion";
import { SalonCard } from "@/components/ui/salon-card";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { 
  Shield, 
  UserCircle, 
  Scissors, 
  Heart,
  ChevronRight,
  CheckCircle2
} from "lucide-react";

const roles = [
  {
    icon: <Shield className="w-10 h-10" />,
    title: "Admin",
    subtitle: "Full Control",
    description: "Complete access to manage your entire salon empire.",
    features: [
      "Staff & schedule management",
      "Financial reports & analytics",
      "Inventory & service control",
      "Multi-branch oversight",
    ],
    gradient: "from-burgundy to-plum",
    buttonVariant: "default" as const,
  },
  {
    icon: <UserCircle className="w-10 h-10" />,
    title: "Receptionist",
    subtitle: "Front Desk Power",
    description: "Streamline client interactions and daily operations.",
    features: [
      "Appointment scheduling",
      "Client check-in & billing",
      "Customer profile access",
      "Notification management",
    ],
    gradient: "from-rose-gold to-rose-gold-light",
    buttonVariant: "rose" as const,
  },
  {
    icon: <Scissors className="w-10 h-10" />,
    title: "Beautician",
    subtitle: "Service Excellence",
    description: "Focus on what you do best - making clients beautiful.",
    features: [
      "View assigned appointments",
      "Update service status",
      "Track performance stats",
      "Client preferences access",
    ],
    gradient: "from-gold to-gold-light",
    buttonVariant: "gold" as const,
  },
  {
    icon: <Heart className="w-10 h-10" />,
    title: "Customer",
    subtitle: "VIP Experience",
    description: "Enjoy a seamless luxury booking experience.",
    features: [
      "Online appointment booking",
      "View packages & loyalty points",
      "Payment history access",
      "Personalized recommendations",
    ],
    gradient: "from-rose-gold-light to-gold-light",
    buttonVariant: "champagne" as const,
  },
];

const RolesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-champagne/20 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-rose-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-lavender text-plum text-sm font-medium mb-4">
            👥 Role-Based Access
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Tailored for
            <span className="text-gradient"> Every Role</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each team member gets a personalized dashboard designed for their unique responsibilities
          </p>
        </motion.div>

        {/* Roles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <SalonCard
                variant="luxury"
                className="h-full group relative"
                padding="lg"
              >
                {/* Top gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${role.gradient}`} />

                {/* Icon */}
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${role.gradient} text-white shadow-lg mb-6`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {role.icon}
                </motion.div>

                {/* Content */}
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">{role.subtitle}</span>
                  <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                    {role.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-6">
                  {role.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + featureIndex * 0.1 }}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-rose-gold flex-shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                {/* CTA */}
                <LuxuryButton
                  variant={role.buttonVariant}
                  size="sm"
                  className="w-full group/btn"
                >
                  <span>Login as {role.title}</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </LuxuryButton>
              </SalonCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
