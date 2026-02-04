import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import logo from "@/assets/logo.png";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RoleType = "student" | "sales" | "support" | "teacher" | "branch_admin";

const roleConfig: Record<RoleType, { label: string; description: string }> = {
  student: { label: "Student", description: "Access your courses and learning materials" },
  sales: { label: "Sales", description: "Manage leads and enrollments" },
  support: { label: "Support", description: "Handle student queries and tickets" },
  teacher: { label: "Teacher", description: "Teach courses and manage materials" },
  branch_admin: { label: "Branch Admin", description: "Manage your branch operations" },
};

const Auth = () => {
  const [selectedRole, setSelectedRole] = useState<RoleType>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check user role and redirect accordingly
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        
        const userRoles = roles?.map(r => r.role) || [];
        
        if (userRoles.includes("admin")) {
          navigate("/admin");
        } else if (userRoles.includes("branch_admin")) {
          navigate("/admin");
        } else if (userRoles.includes("sales")) {
          navigate("/sales");
        } else {
          navigate("/dashboard");
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password,
      });

      if (error) throw error;

      // Fetch user roles to determine redirect
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      const userRoles = roles?.map(r => r.role) || [];

      toast({ title: "Welcome back!", description: "Login successful." });
      
      // Redirect based on role
      if (userRoles.includes("admin")) {
        navigate("/admin");
      } else if (userRoles.includes("branch_admin")) {
        navigate("/admin");
      } else if (userRoles.includes("sales")) {
        navigate("/sales");
      } else if (userRoles.includes("teacher")) {
        navigate("/dashboard"); // Can extend to teacher dashboard later
      } else if (userRoles.includes("support")) {
        navigate("/dashboard"); // Can extend to support dashboard later
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <img src={logo} alt="Aspect Vision" className="h-16 w-auto" />
            <span className="font-heading text-3xl font-bold text-primary-foreground">
              Aspect Vision
            </span>
          </Link>
          
          <h1 className="font-heading text-4xl xl:text-5xl font-bold text-primary-foreground leading-tight mb-6">
            Transform Your Career with Industry-Ready Skills
          </h1>
          
          <p className="text-lg text-primary-foreground/80 max-w-lg">
            Join thousands of students who've launched successful careers through our expert-led programs.
          </p>
          
          <div className="mt-12 flex items-center gap-8">
            <div>
              <p className="font-heading text-3xl font-bold text-primary-foreground">10,000+</p>
              <p className="text-sm text-primary-foreground/70">Students Trained</p>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20" />
            <div>
              <p className="font-heading text-3xl font-bold text-primary-foreground">95%</p>
              <p className="text-sm text-primary-foreground/70">Placement Rate</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <img src={logo} alt="Aspect Vision" className="h-12 w-auto" />
            <span className="font-heading text-xl font-bold">
              Aspect<span className="text-primary">Vision</span>
            </span>
          </Link>

          <div className="mb-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Role Selector */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-3">Login as:</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(roleConfig) as RoleType[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedRole === role
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  <p className="font-medium text-sm">{roleConfig[role].label}</p>
                  <p className={`text-xs ${selectedRole === role ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {roleConfig[role].description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Contact admin for account registration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;