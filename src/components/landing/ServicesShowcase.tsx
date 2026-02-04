import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Animated3DIcon, GlowingOrb, SparkleEffect } from "@/components/ui/animated-3d-icon";
import { 
  ScissorsIcon, 
  NailPolishIcon, 
  SpaStoneIcon, 
  MakeupBrushIcon,
  HairDryerIcon,
  FlowerIcon
} from "@/components/icons/SalonIcons";
import { Clock, Star, ArrowRight, Sparkles } from "lucide-react";
import { LuxuryButton } from "@/components/ui/luxury-button";

const services = [
  {
    icon: <ScissorsIcon size={48} />,
    name: "Hair Styling",
    description: "Expert cuts, colors, highlights, and luxury treatments by master stylists",
    duration: "45-90 min",
    price: "From $45",
    rating: 4.9,
    popular: true,
    bgGradient: "from-rose-gold/20 to-blush",
    iconGradient: "from-rose-gold to-rose-gold-light",
    bookings: "2.4k",
  },
  {
    icon: <NailPolishIcon size={48} />,
    name: "Nail Art",
    description: "Manicure, pedicure, gel nails, and creative nail art designs",
    duration: "30-60 min",
    price: "From $35",
    rating: 4.8,
    popular: false,
    bgGradient: "from-plum/20 to-lavender",
    iconGradient: "from-plum to-burgundy",
    bookings: "1.8k",
  },
  {
    icon: <SpaStoneIcon size={48} />,
    name: "Spa & Wellness",
    description: "Relaxing massages, body wraps, and rejuvenating spa treatments",
    duration: "60-120 min",
    price: "From $80",
    rating: 5.0,
    popular: true,
    bgGradient: "from-mint to-green-100",
    iconGradient: "from-emerald-500 to-teal-400",
    bookings: "3.1k",
  },
  {
    icon: <MakeupBrushIcon size={48} />,
    name: "Makeup",
    description: "Bridal, party, editorial, and everyday glamorous looks",
    duration: "30-90 min",
    price: "From $55",
    rating: 4.9,
    popular: false,
    bgGradient: "from-gold/20 to-champagne",
    iconGradient: "from-gold to-gold-light",
    bookings: "1.5k",
  },
  {
    icon: <HairDryerIcon size={48} />,
    name: "Hair Treatment",
    description: "Keratin, botox, deep conditioning, and scalp treatments",
    duration: "60-180 min",
    price: "From $120",
    rating: 4.7,
    popular: false,
    bgGradient: "from-rose-gold/10 to-blush/50",
    iconGradient: "from-rose-gold-light to-rose-gold",
    bookings: "980",
  },
  {
    icon: <FlowerIcon size={48} />,
    name: "Facials",
    description: "Cleansing, hydrating, anti-aging, and glow-boosting facials",
    duration: "45-75 min",
    price: "From $65",
    rating: 4.8,
    popular: true,
    bgGradient: "from-gold/10 to-champagne/50",
    iconGradient: "from-gold-light to-gold",
    bookings: "2.2k",
  },
];

const ServiceCard = ({ service, index }: { service: typeof services[0]; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateY: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="perspective-2000"
    >
      <motion.div
        className="relative rounded-3xl overflow-hidden bg-card border border-border/30 shadow-xl h-full transform-3d"
        animate={{
          rotateX: isHovered ? 5 : 0,
          rotateY: isHovered ? -5 : 0,
          scale: isHovered ? 1.02 : 1,
          y: isHovered ? -10 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          boxShadow: isHovered 
            ? "0 30px 60px -15px hsl(var(--rose-gold) / 0.3), 0 0 40px hsl(var(--rose-gold) / 0.1)"
            : "0 10px 30px -10px hsl(var(--foreground) / 0.1)"
        }}
      >
        {/* Popular badge */}
        {service.popular && (
          <motion.div 
            className="absolute top-4 right-4 z-20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="px-4 py-1.5 rounded-full bg-gradient-luxury text-primary-foreground text-xs font-bold shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Popular
            </span>
          </motion.div>
        )}

        {/* Icon section with animated background */}
        <div className={`relative p-10 bg-gradient-to-br ${service.bgGradient} overflow-hidden`}>
          {/* Animated background circles */}
          <motion.div 
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20"
            animate={{ scale: isHovered ? 1.2 : 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div 
            className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-white/10"
            animate={{ scale: isHovered ? 1.3 : 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
          
          {/* 3D Icon */}
          <Animated3DIcon
            variant="gradient"
            size="xl"
            floatDelay={index * 0.2}
            pulseGlow={isHovered}
            className={`bg-gradient-to-br ${service.iconGradient}`}
          >
            <motion.div
              animate={{ 
                rotateY: isHovered ? [0, 360] : 0,
              }}
              transition={{ duration: 1.5 }}
              className="text-primary-foreground"
            >
              {service.icon}
            </motion.div>
          </Animated3DIcon>

          <SparkleEffect count={5} className={isHovered ? "opacity-100" : "opacity-0"} />
        </div>

        {/* Content section */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              {service.name}
            </h3>
            <motion.div 
              className="flex items-center gap-1 text-gold"
              whileHover={{ scale: 1.1 }}
            >
              <Star className="w-5 h-5 fill-gold" />
              <span className="font-bold">{service.rating}</span>
            </motion.div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
            {service.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center justify-between text-sm mb-5 pb-5 border-b border-border/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {service.duration}
              </span>
              <span className="text-muted-foreground">
                {service.bookings} bookings
              </span>
            </div>
            <span className="font-bold text-gradient text-lg">
              {service.price}
            </span>
          </div>

          {/* Book Now Button - Always visible, enhanced on hover */}
          <motion.div
            animate={{ y: isHovered ? 0 : 5, opacity: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <LuxuryButton className="w-full group" size="sm">
              <span>Book Now</span>
              <motion.span
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.span>
            </LuxuryButton>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ServicesShowcase = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      id="services"
      ref={sectionRef}
      className="py-32 bg-gradient-to-b from-background via-blush/5 to-background relative overflow-hidden"
    >
      {/* Background decorations */}
      <GlowingOrb color="pink" size="lg" className="top-0 right-0" />
      <GlowingOrb color="gold" size="md" className="bottom-0 left-0" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--rose-gold)) 1px, transparent 0)`,
        backgroundSize: "50px 50px",
      }} />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-mint text-emerald-700 text-sm font-semibold mb-6 border border-emerald-200"
            whileHover={{ scale: 1.05 }}
          >
            <SpaStoneIcon size={16} />
            Service Categories
          </motion.span>
          
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Showcase Your Premium
            <span className="text-gradient block mt-2">Services</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Beautiful 3D cards that make your services irresistible to clients
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>

        {/* View all services CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <LuxuryButton variant="glass" size="lg">
            <span>View All Services</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </LuxuryButton>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
