 import { Link } from "react-router-dom";
 import { ScissorsIcon } from "@/components/icons/SalonIcons";
 import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
 
 const Footer = () => {
   return (
     <footer className="py-16 border-t border-border/50 bg-card/30">
       <div className="container mx-auto px-6">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
           {/* Brand */}
           <div className="md:col-span-1">
             <Link to="/" className="flex items-center gap-3 mb-4">
               <div className="p-2 rounded-xl bg-gradient-luxury">
                 <ScissorsIcon size={20} className="text-background" />
               </div>
               <span className="font-serif text-xl font-bold text-foreground">
                 GlamourFlow
               </span>
             </Link>
             <p className="text-sm text-muted-foreground mb-6">
               The ultimate luxury salon management platform for beauty professionals.
             </p>
             <div className="flex gap-4">
               <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                 <Instagram className="w-5 h-5" />
               </a>
               <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                 <Twitter className="w-5 h-5" />
               </a>
               <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                 <Facebook className="w-5 h-5" />
               </a>
               <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                 <Linkedin className="w-5 h-5" />
               </a>
             </div>
           </div>
 
           {/* Product */}
           <div>
             <h4 className="font-semibold text-foreground mb-4">Product</h4>
             <ul className="space-y-3">
               <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a></li>
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Integrations</a></li>
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Updates</a></li>
             </ul>
           </div>
 
           {/* Company */}
           <div>
             <h4 className="font-semibold text-foreground mb-4">Company</h4>
             <ul className="space-y-3">
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</a></li>
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
             </ul>
           </div>
 
           {/* Support */}
           <div>
             <h4 className="font-semibold text-foreground mb-4">Support</h4>
             <ul className="space-y-3">
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
               <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
             </ul>
           </div>
         </div>
 
         {/* Bottom bar */}
         <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-sm text-muted-foreground">
             © 2025 GlamourFlow. All rights reserved.
           </p>
           <p className="text-sm text-muted-foreground">
             Made with <span className="text-primary">♥</span> for beauty professionals
           </p>
         </div>
       </div>
     </footer>
   );
 };
 
 export default Footer;