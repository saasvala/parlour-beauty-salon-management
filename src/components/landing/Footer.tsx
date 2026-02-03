import { motion } from "framer-motion";
import { ScissorsIcon, FlowerIcon } from "@/components/icons/SalonIcons";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-background to-champagne/30 pt-20 pb-8 relative overflow-hidden">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-gold/30 to-transparent" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="p-2 rounded-xl bg-gradient-luxury"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <ScissorsIcon size={24} className="text-white" />
              </motion.div>
              <span className="font-serif text-2xl font-bold text-gradient">
                GlamourFlow
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The ultimate luxury salon management platform. Elevate your beauty business with our premium tools.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="p-2 rounded-full bg-blush text-rose-gold hover:bg-rose-gold hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-foreground">Quick Links</h4>
            <ul className="space-y-3">
              {["Features", "Pricing", "Demo", "About Us", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-rose-gold transition-colors flex items-center gap-2 group"
                  >
                    <FlowerIcon size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-foreground">For Salons</h4>
            <ul className="space-y-3">
              {["Appointment Booking", "Staff Management", "Inventory Control", "Analytics", "Multi-Branch"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-rose-gold transition-colors flex items-center gap-2 group"
                  >
                    <FlowerIcon size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-foreground">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 rounded-full bg-blush text-rose-gold">
                  <Mail className="w-4 h-4" />
                </div>
                hello@glamourflow.com
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 rounded-full bg-blush text-rose-gold">
                  <Phone className="w-4 h-4" />
                </div>
                +1 (555) 123-4567
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <div className="p-2 rounded-full bg-blush text-rose-gold">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>123 Beauty Boulevard<br />New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 GlamourFlow. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-rose-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-rose-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-rose-gold transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
