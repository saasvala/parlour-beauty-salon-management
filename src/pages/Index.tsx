 import Navbar from "@/components/landing/NavbarNew";
 import HeroSection from "@/components/landing/HeroSectionNew";
 import FeaturesSection from "@/components/landing/FeaturesSectionNew";
 import ServicesSection from "@/components/landing/ServicesSectionNew";
 import RolesSection from "@/components/landing/RolesSectionNew";
 import Footer from "@/components/landing/FooterNew";
 
 const Index = () => {
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
       <HeroSection />
       <FeaturesSection />
       <ServicesSection />
       <RolesSection />
       {/* CTA Section */}
       <section className="py-24 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
         <div className="container mx-auto px-6 relative z-10">
           <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
             Ready to <span className="text-gradient">Transform</span> Your Salon?
           </h2>
           <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
             Join thousands of beauty professionals who trust GlamourFlow to run their business.
           </p>
           <a href="/login" className="btn-gradient inline-flex items-center gap-2 text-lg font-semibold">
             Start Your Free Trial
           </a>
         </div>
       </section>
       <Footer />
     </div>
   );
 };
 
 export default Index;