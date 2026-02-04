import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Animated3DIconProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "rose" | "gold" | "purple" | "gradient" | "glass";
  glowColor?: string;
  floatDelay?: number;
  rotateOnHover?: boolean;
  pulseGlow?: boolean;
}

const sizeClasses = {
  sm: "p-2",
  md: "p-3",
  lg: "p-4",
  xl: "p-6",
};

const variantClasses = {
  rose: "bg-gradient-to-br from-rose-gold to-rose-gold-light text-primary-foreground",
  gold: "bg-gradient-to-br from-gold to-gold-light text-primary-foreground",
  purple: "bg-gradient-to-br from-plum to-burgundy text-primary-foreground",
  gradient: "bg-gradient-luxury text-primary-foreground",
  glass: "backdrop-blur-xl bg-card/60 border border-border/30 text-foreground",
};

export const Animated3DIcon = React.forwardRef<HTMLDivElement, Animated3DIconProps>(
  ({ 
    children, 
    className, 
    size = "md", 
    variant = "gradient",
    floatDelay = 0,
    rotateOnHover = true,
    pulseGlow = false,
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-2xl",
          "shadow-lg transition-all duration-500",
          sizeClasses[size],
          variantClasses[variant],
          pulseGlow && "animate-glow-pulse",
          className
        )}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: floatDelay,
          ease: "easeInOut",
        }}
        whileHover={rotateOnHover ? { 
          scale: 1.15, 
          rotate: 10,
          boxShadow: "0 0 40px hsl(var(--rose-gold) / 0.5), 0 20px 40px hsl(var(--rose-gold) / 0.3)"
        } : { scale: 1.1 }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
        
        {/* Icon content */}
        <motion.div
          animate={{ rotateY: [0, 5, 0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </motion.div>
    );
  }
);
Animated3DIcon.displayName = "Animated3DIcon";

// Sparkle particle effect component
export const SparkleEffect = ({ 
  className,
  count = 5,
}: { 
  className?: string;
  count?: number;
}) => {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, Math.random() * 40 - 20],
            y: [0, Math.random() * -40],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut",
          }}
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${50 + Math.random() * 30}%`,
          }}
        />
      ))}
    </div>
  );
};

// Glowing orb background decoration
export const GlowingOrb = ({
  className,
  color = "pink",
  size = "md",
}: {
  className?: string;
  color?: "pink" | "gold" | "purple" | "cyan";
  size?: "sm" | "md" | "lg";
}) => {
  const colorClasses = {
    pink: "floating-orb-pink",
    gold: "floating-orb-gold",
    purple: "floating-orb-purple",
    cyan: "bg-gradient-radial from-cyan-400/30 to-transparent",
  };

  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
  };

  return (
    <motion.div
      className={cn(
        "floating-orb",
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Animated gradient border wrapper
export const AnimatedBorderCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { borderWidth?: number }
>(({ className, children, borderWidth = 2, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl p-[2px] overflow-hidden",
        className
      )}
      style={{ padding: borderWidth }}
      {...props}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, hsl(var(--rose-gold)), hsl(var(--gold)), hsl(var(--neon-purple)), hsl(var(--rose-gold)))",
          backgroundSize: "300% 300%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Inner content */}
      <div className="relative rounded-2xl bg-card h-full">
        {children}
      </div>
    </div>
  );
});
AnimatedBorderCard.displayName = "AnimatedBorderCard";

// Floating particles background
export const FloatingParticles = ({ 
  count = 20,
  className,
}: { 
  count?: number;
  className?: string;
}) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-rose-gold/30"
          initial={{
            x: Math.random() * 100 + "%",
            y: "110%",
            opacity: 0,
          }}
          animate={{
            y: "-10%",
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};
