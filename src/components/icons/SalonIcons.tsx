import { motion } from "framer-motion";

interface IconProps {
  className?: string;
  size?: number;
}

export const ScissorsIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

export const CombIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="8" width="18" height="8" rx="2" />
    <line x1="6" y1="8" x2="6" y2="4" />
    <line x1="9" y1="8" x2="9" y2="4" />
    <line x1="12" y1="8" x2="12" y2="4" />
    <line x1="15" y1="8" x2="15" y2="4" />
    <line x1="18" y1="8" x2="18" y2="4" />
  </svg>
);

export const HairDryerIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <ellipse cx="8" cy="10" rx="5" ry="6" />
    <path d="M13 8 L20 4 L20 8 L13 10" />
    <line x1="8" y1="16" x2="8" y2="22" />
    <line x1="5" y1="22" x2="11" y2="22" />
    <circle cx="8" cy="10" r="2" />
  </svg>
);

export const NailPolishIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="7" y="10" width="10" height="12" rx="2" />
    <rect x="9" y="4" width="6" height="6" rx="1" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <path d="M9 14 L9 18" />
  </svg>
);

export const SpaStoneIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <ellipse cx="12" cy="18" rx="8" ry="3" />
    <ellipse cx="12" cy="13" rx="6" ry="2.5" />
    <ellipse cx="12" cy="9" rx="4" ry="2" />
    <path d="M16 6 C16 3 14 2 12 2 C10 2 8 3 8 6" />
  </svg>
);

export const MakeupBrushIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2 L12 8" />
    <ellipse cx="12" cy="11" rx="4" ry="3" />
    <rect x="10" y="14" width="4" height="8" rx="1" />
  </svg>
);

export const MassageBedIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 16 L2 18 M22 16 L22 18" />
    <rect x="2" y="12" width="20" height="4" rx="1" />
    <ellipse cx="5" cy="10" rx="3" ry="2" />
    <path d="M8 12 L8 8 C8 7 9 6 12 6 L20 6 C21 6 22 7 22 8 L22 12" />
  </svg>
);

export const LotionBottleIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="6" y="8" width="12" height="14" rx="3" />
    <rect x="9" y="4" width="6" height="4" rx="1" />
    <path d="M12 2 L12 4" />
    <path d="M15 2 L15 3 L9 3 L9 2" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);

export const MirrorIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="10" r="8" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
    <path d="M8 7 C8 7 9 6 12 6" />
  </svg>
);

export const FlowerIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2 C12 2 14 6 12 9 C10 6 12 2 12 2" />
    <path d="M12 22 C12 22 10 18 12 15 C14 18 12 22 12 22" />
    <path d="M2 12 C2 12 6 10 9 12 C6 14 2 12 2 12" />
    <path d="M22 12 C22 12 18 14 15 12 C18 10 22 12 22 12" />
    <path d="M4.93 4.93 C4.93 4.93 8.1 6.17 9.17 9.17 C6.17 8.1 4.93 4.93 4.93 4.93" />
    <path d="M19.07 19.07 C19.07 19.07 15.9 17.83 14.83 14.83 C17.83 15.9 19.07 19.07 19.07 19.07" />
    <path d="M19.07 4.93 C19.07 4.93 17.83 8.1 14.83 9.17 C15.9 6.17 19.07 4.93 19.07 4.93" />
    <path d="M4.93 19.07 C4.93 19.07 6.17 15.9 9.17 14.83 C8.1 17.83 4.93 19.07 4.93 19.07" />
  </svg>
);

// Animated floating icon wrapper
export const FloatingIcon = ({ 
  children, 
  delay = 0,
  className = "" 
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -15, 0],
      rotate: [0, 3, 0, -3, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);

// Sparkle effect
export const Sparkle = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={`absolute w-2 h-2 bg-gold rounded-full ${className}`}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);
