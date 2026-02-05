 import { motion } from "framer-motion";
 import { ArrowRight } from "lucide-react";
 
 const services = [
   {
     title: "Hair Styling",
     description: "From cuts to colors, manage all hair services effortlessly.",
     image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
   },
   {
     title: "Nail Art",
     description: "Track nail appointments with style and product preferences.",
     image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
   },
   {
     title: "Spa & Wellness",
     description: "Manage massage, facial, and body treatment bookings.",
     image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
   },
   {
     title: "Makeup Services",
     description: "Bridal, party, and everyday makeup appointment management.",
     image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop",
   },
 ];
 
 const ServicesSection = () => {
   return (
     <section id="services" className="py-24 relative overflow-hidden bg-card/50">
       <div className="container mx-auto px-6">
         {/* Section header */}
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center mb-16"
         >
           <span className="font-script text-2xl text-primary mb-2 block">
             Our Expertise
           </span>
           <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
             Services We Support
           </h2>
           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
             GlamourFlow is designed to handle every type of beauty service 
             with specialized features for each.
           </p>
         </motion.div>
 
         {/* Services grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {services.map((service, index) => (
             <motion.div
               key={service.title}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: index * 0.1 }}
               className="group relative overflow-hidden rounded-2xl neon-border-card"
             >
               {/* Image */}
               <div className="aspect-[4/3] overflow-hidden">
                 <img
                   src={service.image}
                   alt={service.title}
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
               </div>
               
               {/* Content */}
               <div className="absolute bottom-0 left-0 right-0 p-6">
                 <h3 className="text-xl font-semibold text-foreground mb-2">
                   {service.title}
                 </h3>
                 <p className="text-sm text-muted-foreground mb-4">
                   {service.description}
                 </p>
                 <button className="text-primary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                   Learn More <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 };
 
 export default ServicesSection;