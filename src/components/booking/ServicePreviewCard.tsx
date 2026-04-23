import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, Sparkles, Scissors, Brush, Palette, Heart, Flower2, Star, ImageOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ServicePreviewCardProps {
  name: string;
  category?: string;
  durationMinutes: number;
  price: number;
  originalPrice?: number;
  index: number;
  /** Disables expensive animations (sparkles, floating icon) — used when many cards render */
  reduceMotion?: boolean;
}

// Pick a themed icon + gradient based on category/name
const getTheme = (name: string, category?: string) => {
  const key = `${category || ''} ${name}`.toLowerCase();
  if (/(hair|cut|color|style)/.test(key))
    return { Icon: Scissors, gradient: 'from-pink-500/30 via-fuchsia-500/20 to-purple-500/30', accent: 'text-pink-400' };
  if (/(nail|mani|pedi|polish)/.test(key))
    return { Icon: Palette, gradient: 'from-rose-500/30 via-pink-500/20 to-red-500/30', accent: 'text-rose-400' };
  if (/(facial|skin|glow|clean)/.test(key))
    return { Icon: Sparkles, gradient: 'from-amber-500/30 via-yellow-500/20 to-orange-500/30', accent: 'text-amber-400' };
  if (/(massage|spa|relax|body)/.test(key))
    return { Icon: Flower2, gradient: 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30', accent: 'text-emerald-400' };
  if (/(makeup|brow|lash)/.test(key))
    return { Icon: Brush, gradient: 'from-purple-500/30 via-violet-500/20 to-indigo-500/30', accent: 'text-purple-400' };
  if (/(bridal|wedding|premium)/.test(key))
    return { Icon: Heart, gradient: 'from-pink-500/30 via-rose-500/20 to-fuchsia-500/30', accent: 'text-pink-400' };
  return { Icon: Star, gradient: 'from-primary/30 via-primary/10 to-secondary/30', accent: 'text-primary' };
};

export const ServicePreviewCard: React.FC<ServicePreviewCardProps> = ({
  name,
  category,
  durationMinutes,
  price,
  originalPrice,
  index,
  reduceMotion = false,
}) => {
  const { Icon, gradient, accent } = getTheme(name, category);
  const hasDiscount = originalPrice && originalPrice > price;
  const prefersReducedMotion = useReducedMotion();
  const animationsOff = reduceMotion || prefersReducedMotion;

  // Cap entrance stagger so 20+ cards don't feel slow
  const entranceDelay = Math.min(index, 6) * 0.06;

  return (
    <motion.div
      initial={animationsOff ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: entranceDelay, duration: 0.35, ease: 'easeOut' }}
      whileHover={animationsOff ? undefined : { y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 group cursor-default will-change-transform"
    >
      {/* Static gradient background — cheap, no animation */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-90 transition-opacity duration-500`}
        aria-hidden
      />

      {/* Floating accent — only when motion enabled */}
      {!animationsOff && (
        <motion.div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.45, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative z-10 flex items-start gap-4">
        {/* Themed icon */}
        <motion.div
          className={`relative flex items-center justify-center w-14 h-14 rounded-xl bg-background/80 backdrop-blur-sm border border-border ${accent} shrink-0`}
          whileHover={animationsOff ? undefined : { rotate: [0, -6, 6, 0], transition: { duration: 0.5 } }}
        >
          {animationsOff ? (
            <Icon className="w-7 h-7" strokeWidth={1.5} />
          ) : (
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.15 }}
            >
              <Icon className="w-7 h-7" strokeWidth={1.5} />
            </motion.div>
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          {category && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 truncate">
              {category}
            </p>
          )}
          <h4 className="font-serif text-lg font-semibold text-foreground leading-tight truncate">
            {name}
          </h4>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{durationMinutes} min</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          {hasDiscount && (
            <p className="text-xs line-through text-muted-foreground">₹{originalPrice}</p>
          )}
          <p className={`text-xl font-bold ${accent}`}>₹{price}</p>
        </div>
      </div>
    </motion.div>
  );
};

/** Skeleton placeholder shown while preview cards mount */
export const ServicePreviewSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <div className="flex items-start gap-4">
      <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-7 w-16" />
    </div>
  </div>
);

/** Salon-themed empty state when no services are selected */
export const ServicePreviewEmpty: React.FC = () => (
  <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
    <div className="relative z-10 flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground">
        <ImageOff className="w-6 h-6" />
      </div>
      <div>
        <p className="font-serif text-base font-semibold text-foreground">No services selected</p>
        <p className="text-xs text-muted-foreground mt-1">
          Go back to step 1 and pick at least one service to see your curated experience here.
        </p>
      </div>
    </div>
  </div>
);
