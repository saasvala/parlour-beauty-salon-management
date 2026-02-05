 import { useState, useEffect } from "react";
 import { Link } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Menu, X, Sparkles } from "lucide-react";
 import { ScissorsIcon } from "@/components/icons/SalonIcons";
 
 const Navbar = () => {
   const [isScrolled, setIsScrolled] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
   useEffect(() => {
     const handleScroll = () => {
       setIsScrolled(window.scrollY > 50);
     };
     window.addEventListener("scroll", handleScroll);
     return () => window.removeEventListener("scroll", handleScroll);
   }, []);
 
   const navLinks = [
     { name: "Features", href: "#features" },
     { name: "Services", href: "#services" },
     { name: "Pricing", href: "#pricing" },
     { name: "About", href: "#about" },
   ];
 
   return (
     <motion.nav
       initial={{ y: -100 }}
       animate={{ y: 0 }}
       className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
         isScrolled
           ? "bg-background/90 backdrop-blur-xl border-b border-border/50"
           : "bg-transparent"
       }`}
     >
       <div className="container mx-auto px-6">
         <div className="flex items-center justify-between h-20">
           {/* Logo */}
           <Link to="/" className="flex items-center gap-3 group">
             <div className="p-2 rounded-xl bg-gradient-luxury group-hover:glow-pink transition-all duration-300">
               <ScissorsIcon size={24} className="text-background" />
             </div>
             <span className="font-serif text-2xl font-bold text-foreground">
               Glam<span className="text-gradient">Flow</span>
             </span>
           </Link>
 
           {/* Desktop Navigation */}
           <div className="hidden md:flex items-center gap-8">
             {navLinks.map((link) => (
               <a
                 key={link.name}
                 href={link.href}
                 className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
               >
                 {link.name}
               </a>
             ))}
           </div>
 
           {/* CTA Buttons */}
           <div className="hidden md:flex items-center gap-4">
             <Link
               to="/login"
               className="text-muted-foreground hover:text-foreground transition-colors font-medium"
             >
               Sign In
             </Link>
             <Link
               to="/login"
               className="btn-gradient px-6 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
             >
               <Sparkles className="w-4 h-4" />
               Get Started
             </Link>
           </div>
 
           {/* Mobile Menu Button */}
           <button
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
           >
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
         </div>
 
         {/* Mobile Menu */}
         {isMobileMenuOpen && (
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="md:hidden py-6 border-t border-border/50"
           >
             <div className="flex flex-col gap-4">
               {navLinks.map((link) => (
                 <a
                   key={link.name}
                   href={link.href}
                   className="text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                   onClick={() => setIsMobileMenuOpen(false)}
                 >
                   {link.name}
                 </a>
               ))}
               <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
                 <Link
                   to="/login"
                   className="text-center py-2.5 text-muted-foreground hover:text-foreground transition-colors font-medium"
                   onClick={() => setIsMobileMenuOpen(false)}
                 >
                   Sign In
                 </Link>
                 <Link
                   to="/login"
                   className="btn-gradient text-center py-2.5 font-semibold"
                   onClick={() => setIsMobileMenuOpen(false)}
                 >
                   Get Started
                 </Link>
               </div>
             </div>
           </motion.div>
         )}
       </div>
     </motion.nav>
   );
 };
 
 export default Navbar;