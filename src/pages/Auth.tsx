import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password is too long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RoleType = "student" | "employee" | "branch" | "admin";

const roleConfig: Record<RoleType, { label: string; description: string }> = {
  student: { label: "Student", description: "Access your courses and learning materials" },
  employee: { label: "Employee", description: "Sales, Support, or Teaching staff" },
  branch: { label: "Branch", description: "Manage your branch operations" },
  admin: { label: "Admin", description: "Full system administration" },
};

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [selectedRole, setSelectedRole] = useState<RoleType>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

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

      toast({ title: "Welcome back!", description: "Login successful." });
      
      // Redirect based on role (we'll check roles in the dashboard)
      navigate("/dashboard");
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(signupData);
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
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email.trim().toLowerCase(),
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.name.trim(),
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
      
      setActiveTab("login");
    } catch (error: any) {
      const message = error.message.includes("already registered")
        ? "This email is already registered. Try logging in."
        : error.message || "Something went wrong.";
      toast({ title: "Signup Failed", description: message, variant: "destructive" });
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
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
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

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-heading text-xl font-bold">
              Aspect<span className="text-primary">Vision</span>
            </span>
          </Link>

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

          {/* Auth Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
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
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      placeholder="John Doe"
                      className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="signup-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
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

                <div>
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-8">
            <Link to="/" className="text-primary hover:underline">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;