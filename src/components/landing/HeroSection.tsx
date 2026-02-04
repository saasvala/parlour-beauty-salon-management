import { motion, useScroll, useTransform } from "framer-motion";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { 
  FloatingIcon, 
  ScissorsIcon, 
  CombIcon, 
  NailPolishIcon, 
  SpaStoneIcon, 
  FlowerIcon, 
  MakeupBrushIcon,
  HairDryerIcon,
  LotionBottleIcon
} from "@/components/icons/SalonIcons";
import { Animated3DIcon, GlowingOrb, FloatingParticles, SparkleEffect } from "@/components/ui/animated-3d-icon";
import { Sparkles, Star, Play, ArrowRight } from "lucide-react";
import heroSalonImage from "@/assets/hero-salon.jpg";
import { useRef } from "react";

const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y }}
      >
        <img 
          src={heroSalonImage} 
          alt="Luxury Salon Interior" 
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/85 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-gold/5 via-transparent to-gold/5" />
      </motion.div>

      {/* Floating particles */}
      <FloatingParticles count={30} />

      {/* Glowing orbs */}
      <GlowingOrb color="pink" size="lg" className="top-20 left-10" />
      <GlowingOrb color="gold" size="md" className="bottom-20 right-20" />
      <GlowingOrb color="purple" size="sm" className="top-1/2 right-1/3" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 3D Floating salon icons */}
        <FloatingIcon className="absolute top-24 left-[8%]" delay={0}>
          <Animated3DIcon variant="rose" size="lg" floatDelay={0}>
            <ScissorsIcon size={32} className="text-primary-foreground" />
          </Animated3DIcon>
        </FloatingIcon>
        
        <FloatingIcon className="absolute top-36 right-[12%]" delay={1}>
          <Animated3DIcon variant="gold" size="md" floatDelay={0.5}>
            <CombIcon size={28} className="text-primary-foreground" />
          </Animated3DIcon>
        </FloatingIcon>
        
        <FloatingIcon className="absolute bottom-36 left-[15%]" delay={2}>
          <Animated3DIcon variant="purple" size="lg" floatDelay={1} pulseGlow>
            <NailPolishIcon size={32} className="text-primary-foreground" />
          </Animated3DIcon>
        </FloatingIcon>
        
        <FloatingIcon className="absolute top-52 left-[5%]" delay={0.5}>
          <Animated3DIcon variant="glass" size="sm" floatDelay={1.5}>
            <SpaStoneIcon size={24} className="text-rose-gold" />
          </Animated3DIcon>
        </FloatingIcon>
        
        <FloatingIcon className="absolute bottom-40 right-[8%]" delay={1.5}>
          <Animated3DIcon variant="gradient" size="lg" floatDelay={2}>
            <FlowerIcon size={36} className="text-primary-foreground" />
          </Animated3DIcon>
        </FloatingIcon>
        
        <FloatingIcon className="absolute top-28 right-[28%]" delay={2.5}>
          <Animated3DIcon variant="rose" size="sm" floatDelay={2.5}>
            <MakeupBrushIcon size={24} className="text-primary-foreground" />
          </Animated3DIcon>
        </FloatingIcon>

        <FloatingIcon className="absolute bottom-52 right-[25%]" delay={3}>
          <Animated3DIcon variant="gold" size="md" floatDelay={3}>
            <HairDryerIcon size={28} className="text-primary-foreground" />
          </Animated3DIcon>
        </FloatingIcon>

        <FloatingIcon className="absolute top-72 left-[25%]" delay={3.5}>
          <Animated3DIcon variant="glass" size="sm" floatDelay={3.5}>
            <LotionBottleIcon size={22} className="text-gold" />
          </Animated3DIcon>
        </FloatingIcon>
      </div>

      <motion.div 
        className="container mx-auto px-6 relative z-10"
        style={{ opacity }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge with glow */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-champagne/90 backdrop-blur-md border border-gold/30 mb-10 shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-gold" />
            </motion.div>
            <span className="text-sm font-semibold text-foreground tracking-wide">
              Ultra-Premium Salon Management
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gradient-luxury text-primary-foreground text-xs font-bold">
              NEW
            </span>
          </motion.div>

          {/* Main heading with enhanced typography */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-[1.1]"
          >
            <span className="text-foreground block">Elevate Your</span>
            <span className="relative">
              <span className="text-gradient text-6xl md:text-8xl lg:text-9xl">Beauty Empire</span>
              <SparkleEffect count={8} />
            </span>
          </motion.h1>

          {/* Subtitle with animation */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            The <span className="text-gradient font-medium">ultimate luxury platform</span> for salons, spas, and beauty parlours. 
            Streamline operations, delight clients, and grow your empire.
          </motion.p>

          {/* CTA Buttons with enhanced styles */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <LuxuryButton size="xl" className="group min-w-[200px] relative">
              <span>Start Free Trial</span>
              <motion.span
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
              <SparkleEffect count={3} />
            </LuxuryButton>
            
            <LuxuryButton variant="glass" size="xl" className="group min-w-[200px]">
              <motion.div
                className="mr-2 w-8 h-8 rounded-full bg-gradient-luxury flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
              </motion.div>
              <span>Watch Demo</span>
            </LuxuryButton>
          </motion.div>

          {/* Trust badges with premium styling */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20 flex flex-wrap justify-center items-center gap-10"
          >
            <motion.div 
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/30"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-luxury border-2 border-background shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + i * 0.1 }}
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">2,500+</p>
                <p className="text-sm text-muted-foreground">Salons Trust Us</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/30"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.2 + i * 0.1, type: "spring" }}
                  >
                    <Star className="w-5 h-5 fill-gold text-gold" />
                  </motion.div>
                ))}
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">4.9/5</p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/30"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="p-2 rounded-xl bg-gradient-luxury">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">10M+</p>
                <p className="text-sm text-muted-foreground">Appointments</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-7 h-12 rounded-full border-2 border-rose-gold/50 flex items-start justify-center p-2 bg-card/20 backdrop-blur-sm">
            <motion.div
              animate={{ y: [0, 16, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-3 rounded-full bg-gradient-luxury"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
