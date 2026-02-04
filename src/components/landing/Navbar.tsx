import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { ScissorsIcon, FlowerIcon } from "@/components/icons/SalonIcons";
import { Menu, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Services", href: "#services" },
    { name: "Pricing", href: "#pricing" },
    { name: "About", href: "#about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="backdrop-blur-xl bg-card/70 border border-border/30 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Animated top border */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-gold via-gold to-rose-gold"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            style={{ backgroundSize: "200% 100%" }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                  className="p-2.5 rounded-xl bg-gradient-luxury shadow-lg relative overflow-hidden"
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <ScissorsIcon size={22} className="text-primary-foreground relative z-10" />
                  <motion.div 
                    className="absolute inset-0 bg-white/20"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-serif text-xl font-bold text-gradient">
                    GlamourFlow
                  </span>
                  <span className="text-[10px] text-muted-foreground -mt-1">Premium Salon Suite</span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors relative group py-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {link.name}
                    <motion.span 
                      className="absolute -bottom-0 left-0 h-0.5 bg-gradient-luxury"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-gold/50"
                >
                  <FlowerIcon size={18} />
                </motion.div>
                <Link to="/login">
                  <LuxuryButton variant="ghost" size="sm">
                    Sign In
                  </LuxuryButton>
                </Link>
                <Link to="/login">
                  <LuxuryButton size="sm" className="shadow-lg">
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Get Started
                  </LuxuryButton>
                </Link>
              </div>

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2.5 rounded-xl text-foreground hover:bg-blush transition-colors border border-border/30"
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden border-t border-border/30 overflow-hidden"
              >
                <div className="container mx-auto px-6 py-6 space-y-4">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-3 text-muted-foreground hover:text-foreground transition-colors border-b border-border/30"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {link.name}
                    </motion.a>
                  ))}
                  <div className="pt-4 space-y-3">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <LuxuryButton variant="ghost" className="w-full">
                        Sign In
                      </LuxuryButton>
                    </Link>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <LuxuryButton className="w-full shadow-lg">
                        <Sparkles className="w-4 h-4 mr-1.5" />
                        Get Started
                      </LuxuryButton>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
