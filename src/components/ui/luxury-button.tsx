import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const luxuryButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-luxury text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        rose:
          "bg-gradient-rose text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        gold:
          "bg-gradient-gold text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        ghost:
          "text-primary hover:bg-primary/10",
        champagne:
          "bg-champagne text-foreground hover:bg-blush shadow-md hover:shadow-lg",
        glass:
          "backdrop-blur-md bg-card/50 border border-border/50 text-foreground hover:bg-card/70",
      },
      size: {
        default: "h-11 px-6 py-2 rounded-full",
        sm: "h-9 px-4 rounded-full text-xs",
        lg: "h-14 px-10 rounded-full text-base",
        xl: "h-16 px-12 rounded-full text-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LuxuryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof luxuryButtonVariants> {
  asChild?: boolean;
  shimmer?: boolean;
}

const LuxuryButton = React.forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  ({ className, variant, size, asChild = false, shimmer = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(luxuryButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {shimmer && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
        )}
        {children}
      </Comp>
    );
  }
);
LuxuryButton.displayName = "LuxuryButton";

// Motion-enhanced version
const MotionLuxuryButton = motion(LuxuryButton);

export { LuxuryButton, MotionLuxuryButton, luxuryButtonVariants };
