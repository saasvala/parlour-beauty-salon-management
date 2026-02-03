import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { ScissorsIcon } from "@/components/icons/SalonIcons";
import { Menu, X } from "lucide-react";
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
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-md bg-card/80 border border-border/50 rounded-2xl shadow-lg"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                  className="p-2 rounded-xl bg-gradient-luxury"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <ScissorsIcon size={24} className="text-white" />
                </motion.div>
                <span className="font-serif text-xl font-bold text-gradient">
                  GlamourFlow
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-luxury group-hover:w-full transition-all duration-300" />
                  </a>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login">
                  <LuxuryButton variant="ghost" size="sm">
                    Sign In
                  </LuxuryButton>
                </Link>
                <Link to="/login">
                  <LuxuryButton size="sm">
                    Get Started
                  </LuxuryButton>
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-xl text-foreground hover:bg-blush transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
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
                className="md:hidden border-t border-border/50 overflow-hidden"
              >
                <div className="container mx-auto px-6 py-4 space-y-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  ))}
                  <div className="pt-4 space-y-3 border-t border-border/50">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <LuxuryButton variant="ghost" className="w-full">
                        Sign In
                      </LuxuryButton>
                    </Link>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <LuxuryButton className="w-full">
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
