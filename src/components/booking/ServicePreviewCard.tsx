import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Scissors, Brush, Palette, Heart, Flower2, Star } from 'lucide-react';

interface ServicePreviewCardProps {
  name: string;
  category?: string;
  durationMinutes: number;
  price: number;
  originalPrice?: number;
  index: number;
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
}) => {
  const { Icon, gradient, accent } = getTheme(name, category);
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 120, damping: 14 }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 group cursor-default"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
        aria-hidden
      />

      {/* Floating sparkle accent */}
      <motion.div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-40"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex items-start gap-4">
        {/* 3D-style icon */}
        <motion.div
          className={`relative flex items-center justify-center w-14 h-14 rounded-xl bg-background/80 backdrop-blur-sm border border-border ${accent}`}
          whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.6 } }}
        >
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
          >
            <Icon className="w-7 h-7" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        <div className="flex-1 min-w-0">
          {category && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
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

      {/* Bottom shine line */}
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ delay: index * 0.08 + 0.3, duration: 0.6 }}
      />
    </motion.div>
  );
};
