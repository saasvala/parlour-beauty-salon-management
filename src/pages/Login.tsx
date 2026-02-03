import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { SalonCard } from "@/components/ui/salon-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ScissorsIcon, 
  FlowerIcon, 
  SpaStoneIcon,
  FloatingIcon 
} from "@/components/icons/SalonIcons";
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
import { Link } from "react-router-dom";

type UserRole = "admin" | "receptionist" | "beautician" | "customer";

const roles = [
  {
    id: "admin" as UserRole,
    icon: <Shield className="w-6 h-6" />,
    title: "Admin",
    description: "Full salon control",
    gradient: "from-burgundy to-plum",
  },
  {
    id: "receptionist" as UserRole,
    icon: <UserCircle className="w-6 h-6" />,
    title: "Receptionist",
    description: "Front desk access",
    gradient: "from-rose-gold to-rose-gold-light",
  },
  {
    id: "beautician" as UserRole,
    icon: <Scissors className="w-6 h-6" />,
    title: "Beautician",
    description: "Service provider",
    gradient: "from-gold to-gold-light",
  },
  {
    id: "customer" as UserRole,
    icon: <Heart className="w-6 h-6" />,
    title: "Customer",
    description: "Book & manage",
    gradient: "from-rose-gold-light to-gold-light",
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
    // For demo, navigate based on role
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
    <div className="min-h-screen bg-gradient-to-br from-background via-champagne/20 to-blush/20 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Floating background icons */}
      <FloatingIcon className="absolute top-20 left-[10%] text-rose-gold/20" delay={0}>
        <ScissorsIcon size={60} />
      </FloatingIcon>
      <FloatingIcon className="absolute bottom-20 right-[10%] text-gold/20" delay={1}>
        <FlowerIcon size={50} />
      </FloatingIcon>
      <FloatingIcon className="absolute top-1/3 right-[5%] text-rose-gold/15" delay={2}>
        <SpaStoneIcon size={70} />
      </FloatingIcon>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <SalonCard variant="glass" padding="lg" className="backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex p-3 rounded-2xl bg-gradient-luxury mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <ScissorsIcon size={32} className="text-primary-foreground" />
            </motion.div>
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
                  onClick={() => setSelectedRole(role.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedRole === role.id
                      ? "border-rose-gold bg-blush/50"
                      : "border-border hover:border-rose-gold/50 bg-card/50"
                  }`}
                >
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${role.gradient} text-primary-foreground mb-2`}>
                    {role.icon}
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
                  className="pl-10 h-12 rounded-xl border-border bg-card/50 focus:border-rose-gold focus:ring-rose-gold"
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
                  className="pl-10 pr-10 h-12 rounded-xl border-border bg-card/50 focus:border-rose-gold focus:ring-rose-gold"
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
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>
              <a href="#" className="text-rose-gold hover:underline">
                Forgot password?
              </a>
            </div>

            <LuxuryButton
              type="submit"
              size="lg"
              className="w-full"
              disabled={!selectedRole}
            >
              Sign In as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : "..."}
            </LuxuryButton>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-rose-gold hover:underline font-medium">
              Get Started
            </a>
          </p>
        </SalonCard>
      </motion.div>
    </div>
  );
};

export default Login;
