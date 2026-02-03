import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const salonCardVariants = cva(
  "relative overflow-hidden rounded-2xl transition-all duration-500",
  {
    variants: {
      variant: {
        default:
          "bg-card border border-border/50 shadow-lg hover:shadow-xl hover:-translate-y-1",
        glass:
          "backdrop-blur-md bg-card/60 border border-border/30 shadow-lg hover:shadow-xl hover:-translate-y-1",
        luxury:
          "bg-gradient-to-br from-card to-champagne border border-gold/20 shadow-lg hover:shadow-xl hover:-translate-y-2",
        glow:
          "bg-card border border-rose-gold/30 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-rose-gold/50",
        champagne:
          "bg-champagne border border-gold/20 shadow-md hover:shadow-lg",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface SalonCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof salonCardVariants> {
  glowOnHover?: boolean;
}

const SalonCard = React.forwardRef<HTMLDivElement, SalonCardProps>(
  ({ className, variant, padding, glowOnHover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          salonCardVariants({ variant, padding, className }),
          glowOnHover && "hover:glow-effect"
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SalonCard.displayName = "SalonCard";

// Motion-enhanced version
const MotionSalonCard = motion(SalonCard);

// Specialized cards
const ServiceCard = React.forwardRef<
  HTMLDivElement,
  SalonCardProps & {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    price?: string;
  }
>(({ className, icon, title, description, price, children, ...props }, ref) => {
  return (
    <SalonCard
      ref={ref}
      variant="glow"
      className={cn("group cursor-pointer", className)}
      {...props}
    >
      <div className="flex flex-col items-center text-center">
        {icon && (
          <div className="mb-4 p-4 rounded-full bg-gradient-champagne text-rose-gold group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        )}
        {price && (
          <span className="text-gradient font-semibold text-lg">{price}</span>
        )}
        {children}
      </div>
    </SalonCard>
  );
});
ServiceCard.displayName = "ServiceCard";

const StatsCard = React.forwardRef<
  HTMLDivElement,
  SalonCardProps & {
    icon?: React.ReactNode;
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
  }
>(({ className, icon, title, value, trend, trendUp = true, ...props }, ref) => {
  return (
    <SalonCard
      ref={ref}
      variant="glass"
      className={cn("", className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-serif font-bold text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm mt-2 flex items-center gap-1",
              trendUp ? "text-emerald-600" : "text-destructive"
            )}>
              <span>{trendUp ? "↑" : "↓"}</span>
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-gradient-luxury text-primary-foreground">
            {icon}
          </div>
        )}
      </div>
    </SalonCard>
  );
});
StatsCard.displayName = "StatsCard";

export { SalonCard, MotionSalonCard, ServiceCard, StatsCard, salonCardVariants };
