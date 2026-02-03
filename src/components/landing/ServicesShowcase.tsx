import { motion } from "framer-motion";
import { SalonCard } from "@/components/ui/salon-card";
import { 
  ScissorsIcon, 
  NailPolishIcon, 
  SpaStoneIcon, 
  MakeupBrushIcon,
  HairDryerIcon,
  FlowerIcon
} from "@/components/icons/SalonIcons";
import { Clock, Star } from "lucide-react";

const services = [
  {
    icon: <ScissorsIcon size={40} />,
    name: "Hair Styling",
    description: "Expert cuts, colors, and treatments",
    duration: "45-90 min",
    price: "From $45",
    rating: 4.9,
    popular: true,
    bgColor: "bg-blush",
    iconColor: "text-rose-gold",
  },
  {
    icon: <NailPolishIcon size={40} />,
    name: "Nail Art",
    description: "Manicure, pedicure & nail art",
    duration: "30-60 min",
    price: "From $35",
    rating: 4.8,
    popular: false,
    bgColor: "bg-lavender",
    iconColor: "text-plum",
  },
  {
    icon: <SpaStoneIcon size={40} />,
    name: "Spa & Wellness",
    description: "Relaxing massages & treatments",
    duration: "60-120 min",
    price: "From $80",
    rating: 5.0,
    popular: true,
    bgColor: "bg-mint",
    iconColor: "text-green-600",
  },
  {
    icon: <MakeupBrushIcon size={40} />,
    name: "Makeup",
    description: "Bridal, party & everyday looks",
    duration: "30-90 min",
    price: "From $55",
    rating: 4.9,
    popular: false,
    bgColor: "bg-champagne",
    iconColor: "text-gold",
  },
  {
    icon: <HairDryerIcon size={40} />,
    name: "Hair Treatment",
    description: "Keratin, botox & deep conditioning",
    duration: "60-180 min",
    price: "From $120",
    rating: 4.7,
    popular: false,
    bgColor: "bg-rose-gold/10",
    iconColor: "text-rose-gold",
  },
  {
    icon: <FlowerIcon size={40} />,
    name: "Facials",
    description: "Cleansing, hydrating & anti-aging",
    duration: "45-75 min",
    price: "From $65",
    rating: 4.8,
    popular: true,
    bgColor: "bg-gold/10",
    iconColor: "text-gold",
  },
];

const ServicesShowcase = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-blush/10 to-background relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--rose-gold)) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-mint text-green-700 text-sm font-medium mb-4">
            💆‍♀️ Service Categories
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Showcase Your
            <span className="text-gradient"> Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Beautiful 3D cards that make your services irresistible to clients
          </p>
        </motion.div>

        {/* Services carousel/grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="perspective-1000"
            >
              <SalonCard
                variant="glass"
                padding="none"
                className="overflow-hidden group cursor-pointer"
              >
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-gradient-luxury text-white text-xs font-medium shadow-lg">
                      ✨ Popular
                    </span>
                  </div>
                )}

                {/* Icon section with background */}
                <div className={`${service.bgColor} p-8 relative overflow-hidden`}>
                  <motion.div
                    className={`${service.iconColor} relative z-10`}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  >
                    {service.icon}
                  </motion.div>
                  
                  {/* Decorative circles */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20" />
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
                </div>

                {/* Content section */}
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-rose-gold transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {service.description}
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {service.duration}
                      </span>
                      <span className="flex items-center gap-1 text-gold">
                        <Star className="w-4 h-4 fill-gold" />
                        {service.rating}
                      </span>
                    </div>
                    <span className="font-semibold text-gradient">
                      {service.price}
                    </span>
                  </div>

                  {/* Hover reveal button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button className="w-full py-2 rounded-full bg-gradient-luxury text-primary-foreground text-sm font-medium">
                      Book Now
                    </button>
                  </motion.div>
                </div>
              </SalonCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
