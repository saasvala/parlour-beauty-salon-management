import { motion } from "framer-motion";
import { ScissorsIcon, FlowerIcon, SpaStoneIcon, NailPolishIcon } from "@/components/icons/SalonIcons";
import { Animated3DIcon, GlowingOrb, FloatingParticles } from "@/components/ui/animated-3d-icon";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Demo", href: "#demo" },
      { name: "Updates", href: "#updates" },
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Press", href: "#press" },
      { name: "Blog", href: "#blog" },
    ],
    support: [
      { name: "Help Center", href: "#help" },
      { name: "Documentation", href: "#docs" },
      { name: "Contact", href: "#contact" },
      { name: "Status", href: "#status" },
    ],
    legal: [
      { name: "Privacy", href: "#privacy" },
      { name: "Terms", href: "#terms" },
      { name: "Cookies", href: "#cookies" },
      { name: "Licenses", href: "#licenses" },
    ],
  };

  return (
    <footer className="relative bg-gradient-to-b from-background via-champagne/10 to-background overflow-hidden">
      {/* Decorative elements */}
      <GlowingOrb color="pink" size="md" className="-top-32 left-1/4" />
      <GlowingOrb color="gold" size="sm" className="bottom-20 right-1/4" />
      <FloatingParticles count={10} className="opacity-30" />

      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-gold/40 to-transparent" />

      {/* Main footer content */}
      <div className="container mx-auto px-6 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <motion.div
                className="p-3 rounded-xl bg-gradient-luxury shadow-lg"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <ScissorsIcon size={24} className="text-primary-foreground" />
              </motion.div>
              <span className="font-serif text-2xl font-bold text-gradient">
                GlamourFlow
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The ultimate luxury management platform for salons, spas, and beauty parlours. 
              Elevate your business with premium tools.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="p-3 rounded-xl bg-card border border-border/30 text-muted-foreground hover:text-rose-gold hover:border-rose-gold/30 transition-all"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([title, links], columnIndex) => (
            <div key={title}>
              <h3 className="font-serif font-semibold text-foreground mb-4 capitalize">{title}</h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: columnIndex * 0.1 + index * 0.05 }}
                  >
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-rose-gold transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-rose-gold/50 group-hover:bg-rose-gold transition-colors" />
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 py-8 mb-8 border-y border-border/30"
        >
          {[
            { icon: <Mail className="w-5 h-5" />, text: "hello@glamourflow.com" },
            { icon: <Phone className="w-5 h-5" />, text: "+1 (555) 123-4567" },
            { icon: <MapPin className="w-5 h-5" />, text: "Los Angeles, CA" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 text-muted-foreground hover:text-rose-gold transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <Animated3DIcon variant="glass" size="sm" floatDelay={index * 0.3}>
                {item.icon}
              </Animated3DIcon>
              <span>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            © {currentYear} GlamourFlow. Made with 
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-rose-gold fill-rose-gold" />
            </motion.span>
            for beauty professionals.
          </p>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <FlowerIcon size={20} className="text-rose-gold/50" />
            </motion.div>
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
              <SpaStoneIcon size={20} className="text-gold/50" />
            </motion.div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            >
              <NailPolishIcon size={20} className="text-plum/50" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-gold via-gold to-rose-gold" />
    </footer>
  );
};

export default Footer;
