 import { motion } from "framer-motion";
 import { ArrowRight, Play } from "lucide-react";
 import { Link } from "react-router-dom";
 import heroImage from "@/assets/hero-dark-salon.jpg";
 
 const HeroSection = () => {
   return (
     <section className="relative min-h-screen flex items-center overflow-hidden">
       {/* Background Image */}
       <div className="absolute inset-0">
         <img 
           src={heroImage} 
           alt="Luxury Salon Interior" 
           className="w-full h-full object-cover"
         />
         {/* Dark gradient overlay - left side heavy for text readability */}
         <div className="absolute inset-0 hero-overlay" />
         <div className="absolute inset-x-0 bottom-0 h-32 hero-overlay-bottom" />
       </div>
 
       {/* Floating orbs for ambiance */}
       <div className="absolute top-20 right-1/4 w-96 h-96 floating-orb floating-orb-pink animate-pulse-soft" />
       <div className="absolute bottom-20 left-1/4 w-80 h-80 floating-orb floating-orb-purple animate-pulse-soft" style={{ animationDelay: '1s' }} />
 
       {/* Content */}
       <div className="container mx-auto px-6 relative z-10">
         <div className="max-w-2xl">
           {/* Script accent text */}
           <motion.div
             initial={{ opacity: 0, y: 20, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             transition={{ duration: 0.6 }}
           >
             <span className="font-script text-3xl md:text-4xl text-primary mb-4 block">
               Welcome to Luxury
             </span>
           </motion.div>
 
           {/* Main heading */}
           <motion.h1
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-[1.1]"
           >
             <span className="text-foreground block">Transform Your</span>
             <span className="text-gradient block">Beauty Business</span>
           </motion.h1>
 
           {/* Subtitle */}
           <motion.p
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
           >
             The ultimate management platform for salons, spas, and beauty parlours. 
             Streamline operations, delight clients, and grow your empire with our 
             <span className="text-primary font-medium"> premium solution</span>.
           </motion.p>
 
           {/* CTA Buttons */}
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.6 }}
             className="flex flex-col sm:flex-row gap-4"
           >
             <Link
               to="/login"
               className="btn-gradient inline-flex items-center justify-center gap-2 text-lg font-semibold"
             >
               <span>Start Free Trial</span>
               <ArrowRight className="w-5 h-5" />
             </Link>
             
             <button className="btn-outline-glow inline-flex items-center justify-center gap-2 text-lg">
               <Play className="w-5 h-5 fill-current" />
               <span>Watch Demo</span>
             </button>
           </motion.div>
 
           {/* Stats row */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.8 }}
             className="mt-16 flex flex-wrap gap-8"
           >
             <div className="text-center">
               <p className="text-4xl font-bold text-gradient">2,500+</p>
               <p className="text-sm text-muted-foreground mt-1">Salons Worldwide</p>
             </div>
             <div className="text-center">
               <p className="text-4xl font-bold text-gradient">10M+</p>
               <p className="text-sm text-muted-foreground mt-1">Appointments</p>
             </div>
             <div className="text-center">
               <p className="text-4xl font-bold text-gradient">99%</p>
               <p className="text-sm text-muted-foreground mt-1">Satisfaction</p>
             </div>
           </motion.div>
         </div>
       </div>
 
       {/* Scroll indicator */}
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 1.5 }}
         className="absolute bottom-8 left-1/2 -translate-x-1/2"
       >
         <motion.div
           animate={{ y: [0, 15, 0] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="flex flex-col items-center gap-2"
         >
           <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
           <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-1.5">
             <motion.div
               animate={{ y: [0, 12, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-1.5 h-2.5 rounded-full bg-primary"
             />
           </div>
         </motion.div>
       </motion.div>
     </section>
   );
 };
 
 export default HeroSection;