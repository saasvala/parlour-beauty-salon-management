import { motion } from "framer-motion";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { FloatingIcon, ScissorsIcon, CombIcon, NailPolishIcon, SpaStoneIcon, FlowerIcon, MakeupBrushIcon } from "@/components/icons/SalonIcons";
import { Sparkles, Star } from "lucide-react";
import heroSalonImage from "@/assets/hero-salon.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroSalonImage} 
          alt="Luxury Salon Interior" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating salon icons */}
        <FloatingIcon className="absolute top-20 left-[10%] text-rose-gold/30" delay={0}>
          <ScissorsIcon size={48} />
        </FloatingIcon>
        <FloatingIcon className="absolute top-40 right-[15%] text-gold/30" delay={1}>
          <CombIcon size={40} />
        </FloatingIcon>
        <FloatingIcon className="absolute bottom-40 left-[20%] text-rose-gold/20" delay={2}>
          <NailPolishIcon size={44} />
        </FloatingIcon>
        <FloatingIcon className="absolute top-60 left-[5%] text-gold/25" delay={0.5}>
          <SpaStoneIcon size={36} />
        </FloatingIcon>
        <FloatingIcon className="absolute bottom-32 right-[10%] text-rose-gold/25" delay={1.5}>
          <FlowerIcon size={52} />
        </FloatingIcon>
        <FloatingIcon className="absolute top-32 right-[30%] text-gold/20" delay={2.5}>
          <MakeupBrushIcon size={38} />
        </FloatingIcon>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-gold/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        
        {/* Sparkle effects */}
        <motion.div
          className="absolute top-1/3 left-1/3"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-6 h-6 text-gold" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-1/3"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        >
          <Star className="w-4 h-4 text-rose-gold fill-rose-gold" />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-champagne/80 backdrop-blur-sm border border-gold/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-foreground">Premium Salon Management</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight"
          >
            <span className="text-foreground">Elevate Your</span>
            <br />
            <span className="text-gradient">Beauty Business</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            The ultimate luxury management platform for salons, spas, and beauty parlours. 
            Streamline appointments, delight clients, and grow your empire.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <LuxuryButton size="xl" className="group">
              <span>Start Free Trial</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </LuxuryButton>
            <LuxuryButton variant="glass" size="xl">
              Watch Demo
            </LuxuryButton>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-luxury border-2 border-background"
                  />
                ))}
              </div>
              <span className="text-sm">2,500+ Salons Trust Us</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-gold text-gold" />
              ))}
              <span className="text-sm ml-2">4.9/5 Rating</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-rose-gold/50 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-3 rounded-full bg-rose-gold"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
