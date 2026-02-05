 import { useState } from "react";
 import { motion } from "framer-motion";
 import { useNavigate, Link } from "react-router-dom";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { ScissorsIcon } from "@/components/icons/SalonIcons";
 import { 
   Shield, 
   UserCircle, 
   Scissors, 
   Heart,
   Mail,
   Lock,
   Eye,
   EyeOff,
   ArrowLeft
 } from "lucide-react";
 import loginImage from "@/assets/login-salon.jpg";
 
 type UserRole = "admin" | "receptionist" | "beautician" | "customer";
 
 const roles = [
   {
     id: "admin" as UserRole,
     icon: Shield,
     title: "Admin",
     description: "Full salon control",
   },
   {
     id: "receptionist" as UserRole,
     icon: UserCircle,
     title: "Receptionist",
     description: "Front desk access",
   },
   {
     id: "beautician" as UserRole,
     icon: Scissors,
     title: "Beautician",
     description: "Service provider",
   },
   {
     id: "customer" as UserRole,
     icon: Heart,
     title: "Customer",
     description: "Book & manage",
   },
 ];
 
 const Login = () => {
   const navigate = useNavigate();
   const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
   const [showPassword, setShowPassword] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
 
   const handleLogin = (e: React.FormEvent) => {
     e.preventDefault();
     if (selectedRole === "admin") {
       navigate("/admin");
     } else if (selectedRole === "receptionist") {
       navigate("/receptionist");
     } else if (selectedRole === "beautician") {
       navigate("/staff");
     } else {
       navigate("/customer");
     }
   };
 
   return (
     <div className="min-h-screen flex">
       {/* Left Section - Image */}
       <div className="hidden lg:flex lg:w-1/2 relative">
         <img 
           src={loginImage} 
           alt="Luxury Spa Treatment" 
           className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
         
         {/* Overlay content */}
         <div className="absolute bottom-12 left-12 right-12">
           <span className="font-script text-3xl text-primary mb-2 block">
             Experience Luxury
           </span>
           <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
             Your Beauty Journey Starts Here
           </h2>
           <p className="text-muted-foreground">
             Join the platform trusted by thousands of beauty professionals worldwide.
           </p>
         </div>
 
         {/* Floating orbs */}
         <div className="absolute top-20 right-20 w-64 h-64 floating-orb floating-orb-pink animate-pulse-soft" />
         <div className="absolute bottom-40 left-20 w-48 h-48 floating-orb floating-orb-purple animate-pulse-soft" style={{ animationDelay: '1s' }} />
       </div>
 
       {/* Right Section - Form */}
       <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
         {/* Background decorations */}
         <div className="absolute top-0 right-0 w-96 h-96 floating-orb floating-orb-purple opacity-30" />
         <div className="absolute bottom-0 left-0 w-80 h-80 floating-orb floating-orb-pink opacity-30" />
 
         <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.6 }}
           className="w-full max-w-md relative z-10"
         >
           {/* Back button */}
           <Link
             to="/"
             className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
           >
             <ArrowLeft className="w-4 h-4" />
             Back to Home
           </Link>
 
           {/* Logo */}
           <div className="flex items-center gap-3 mb-8">
             <div className="p-2 rounded-xl bg-gradient-luxury">
               <ScissorsIcon size={24} className="text-background" />
             </div>
             <span className="font-serif text-2xl font-bold text-foreground">
               Glam<span className="text-gradient">Flow</span>
             </span>
           </div>
 
           {/* Header */}
           <div className="mb-8">
             <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
               Welcome Back
             </h1>
             <p className="text-muted-foreground">
               Sign in to your GlamourFlow account
             </p>
           </div>
 
           {/* Role Selection */}
           <div className="mb-6">
             <Label className="text-sm font-medium text-foreground mb-3 block">
               Select Your Role
             </Label>
             <div className="grid grid-cols-2 gap-3">
               {roles.map((role) => (
                 <motion.button
                   key={role.id}
                   type="button"
                   onClick={() => setSelectedRole(role.id)}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                     selectedRole === role.id
                       ? "border-primary bg-primary/10 glow-pink"
                       : "border-border hover:border-primary/50 bg-card/50"
                   }`}
                 >
                   <div className={`inline-flex p-2 rounded-lg mb-2 ${
                     selectedRole === role.id 
                       ? "bg-gradient-luxury" 
                       : "bg-secondary"
                   }`}>
                     <role.icon className={`w-5 h-5 ${
                       selectedRole === role.id 
                         ? "text-background" 
                         : "text-primary"
                     }`} />
                   </div>
                   <h3 className="font-semibold text-foreground text-sm">{role.title}</h3>
                   <p className="text-xs text-muted-foreground">{role.description}</p>
                 </motion.button>
               ))}
             </div>
           </div>
 
           {/* Login Form */}
           <form onSubmit={handleLogin} className="space-y-5">
             <div>
               <Label htmlFor="email" className="text-sm font-medium text-foreground">
                 Email Address
               </Label>
               <div className="relative mt-1.5">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                 <Input
                   id="email"
                   type="email"
                   placeholder="hello@example.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="pl-10 h-12 rounded-xl border-border bg-card/50 focus:border-primary focus:ring-primary"
                 />
               </div>
             </div>
 
             <div>
               <Label htmlFor="password" className="text-sm font-medium text-foreground">
                 Password
               </Label>
               <div className="relative mt-1.5">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                 <Input
                   id="password"
                   type={showPassword ? "text" : "password"}
                   placeholder="Enter your password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="pl-10 pr-10 h-12 rounded-xl border-border bg-card/50 focus:border-primary focus:ring-primary"
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                 >
                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
               </div>
             </div>
 
             <div className="flex items-center justify-between text-sm">
               <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                 <input type="checkbox" className="rounded border-border accent-primary" />
                 Remember me
               </label>
               <a href="#" className="text-primary hover:underline">
                 Forgot password?
               </a>
             </div>
 
             <button
               type="submit"
               disabled={!selectedRole}
               className="btn-gradient w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Sign In {selectedRole ? `as ${roles.find(r => r.id === selectedRole)?.title}` : ""}
             </button>
           </form>
 
           {/* Footer */}
           <p className="text-center text-sm text-muted-foreground mt-6">
             Don't have an account?{" "}
             <a href="#" className="text-primary hover:underline font-medium">
               Get Started
             </a>
           </p>
         </motion.div>
       </div>
     </div>
   );
 };
 
 export default Login;