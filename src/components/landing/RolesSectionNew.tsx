 import { motion } from "framer-motion";
 import { Shield, UserCircle, Scissors, Heart, ArrowRight } from "lucide-react";
 import { Link } from "react-router-dom";
 
 const roles = [
   {
     icon: Shield,
     title: "Admin",
     description: "Full control over your salon empire. Manage staff, finances, reports, and settings.",
     features: ["Staff Management", "Financial Reports", "System Settings", "Multi-Branch Control"],
   },
   {
     icon: UserCircle,
     title: "Receptionist",
     description: "Front desk powerhouse. Handle appointments, billing, and customer relations.",
     features: ["Appointment Booking", "Customer Check-in", "Payment Processing", "Notifications"],
   },
   {
     icon: Scissors,
     title: "Beautician",
     description: "Focus on your craft. View schedules, update service status, track performance.",
     features: ["Daily Schedule", "Service Updates", "Client Notes", "Performance Stats"],
   },
   {
     icon: Heart,
     title: "Customer",
     description: "VIP treatment online. Book appointments, view history, earn loyalty rewards.",
     features: ["Online Booking", "Appointment History", "Loyalty Points", "Exclusive Offers"],
   },
 ];
 
 const RolesSection = () => {
   return (
     <section className="py-24 relative overflow-hidden">
       {/* Background */}
       <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
       <div className="absolute top-1/2 left-0 w-96 h-96 floating-orb floating-orb-magenta opacity-20" />
       
       <div className="container mx-auto px-6 relative z-10">
         {/* Section header */}
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center mb-16"
         >
           <span className="font-script text-2xl text-primary mb-2 block">
             Role-Based Access
           </span>
           <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
             Tailored For Everyone
           </h2>
           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
             Different roles, different needs. GlamourFlow provides customized 
             experiences for every member of your team.
           </p>
         </motion.div>
 
         {/* Roles grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {roles.map((role, index) => (
             <motion.div
               key={role.title}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: index * 0.1 }}
               className="neon-border-card p-8 hover:-translate-y-1 transition-all duration-300"
             >
               <div className="flex items-start gap-6">
                 <div className="icon-glow w-16 h-16 shrink-0">
                   <role.icon className="w-8 h-8 text-primary" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                     {role.title}
                   </h3>
                   <p className="text-muted-foreground mb-4">
                     {role.description}
                   </p>
                   <div className="flex flex-wrap gap-2 mb-4">
                     {role.features.map((feature) => (
                       <span
                         key={feature}
                         className="px-3 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground border border-border/50"
                       >
                         {feature}
                       </span>
                     ))}
                   </div>
                   <Link
                     to="/login"
                     className="text-primary text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                   >
                     Login as {role.title} <ArrowRight className="w-4 h-4" />
                   </Link>
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 };
 
 export default RolesSection;