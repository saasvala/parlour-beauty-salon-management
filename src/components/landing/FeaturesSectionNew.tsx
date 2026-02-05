 import { motion } from "framer-motion";
 import { 
   Calendar, 
   Users, 
   CreditCard, 
   BarChart3, 
   Bell, 
   Settings,
   Scissors,
   Package
 } from "lucide-react";
 
 const features = [
   {
     icon: Calendar,
     title: "Smart Scheduling",
     description: "Drag-and-drop calendar with automated reminders and color-coded bookings.",
   },
   {
     icon: Users,
     title: "Client Management",
     description: "Complete customer profiles with history, preferences, and loyalty tracking.",
   },
   {
     icon: Scissors,
     title: "Service Catalog",
     description: "Beautiful service menus with pricing, duration, and staff assignments.",
   },
   {
     icon: CreditCard,
     title: "Easy Payments",
     description: "Accept multiple payment methods with elegant invoicing and receipts.",
   },
   {
     icon: Package,
     title: "Inventory Control",
     description: "Track products with low-stock alerts and automated reorder suggestions.",
   },
   {
     icon: BarChart3,
     title: "Analytics Dashboard",
     description: "Real-time insights on revenue, bookings, and staff performance.",
   },
   {
     icon: Bell,
     title: "Smart Notifications",
     description: "Automated SMS and email reminders for appointments and promotions.",
   },
   {
     icon: Settings,
     title: "Full Customization",
     description: "Tailor the system to your salon's unique workflow and branding.",
   },
 ];
 
 const FeaturesSection = () => {
   return (
     <section id="features" className="py-24 relative overflow-hidden">
       {/* Background decorations */}
       <div className="absolute top-0 left-1/4 w-96 h-96 floating-orb floating-orb-purple opacity-30" />
       <div className="absolute bottom-0 right-1/4 w-80 h-80 floating-orb floating-orb-pink opacity-30" />
       
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
             Powerful Features
           </span>
           <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
             Everything You Need
           </h2>
           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
             Comprehensive tools designed specifically for beauty professionals 
             to streamline operations and enhance client experiences.
           </p>
         </motion.div>
 
         {/* Features grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {features.map((feature, index) => (
             <motion.div
               key={feature.title}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: index * 0.1 }}
               className="neon-border-card p-6 hover:-translate-y-1 transition-all duration-300"
             >
               <div className="icon-glow w-14 h-14 mb-4">
                 <feature.icon className="w-6 h-6 text-primary" />
               </div>
               <h3 className="text-lg font-semibold text-foreground mb-2">
                 {feature.title}
               </h3>
               <p className="text-sm text-muted-foreground leading-relaxed">
                 {feature.description}
               </p>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 };
 
 export default FeaturesSection;