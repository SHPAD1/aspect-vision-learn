import { useState, useEffect } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import {
  LogOut,
  User,
  BookOpen,
  CreditCard,
  FileText,
  IdCard,
  MessageCircle,
  Menu,
  X,
  Home,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { HelpSupportDialog } from "@/components/shared/HelpSupportDialog";
import { NotificationBell } from "@/components/shared/NotificationBell";
import logo from "@/assets/logo.png";

const sidebarLinks = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: User, label: "My Profile", href: "/dashboard/profile" },
  { icon: BookOpen, label: "My Courses", href: "/dashboard/courses" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
  { icon: FileText, label: "Reports", href: "/dashboard/reports" },
  { icon: IdCard, label: "ID Card", href: "/dashboard/id-card" },
  { icon: MessageCircle, label: "AI Tutor", href: "/ai-tutor" },
];

const StudentDashboard = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    if (!loading && user && isAdmin) {
      navigate("/admin");
    }
  }, [loading, user, isAdmin, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "See you soon!" });
    navigate("/");
  };

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ease-in-out lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Aspect Vision" className="h-10 w-auto" />
              <span className="font-heading text-lg font-bold">
                Aspect<span className="text-primary">Vision</span>
              </span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActiveRoute(link.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="w-5 h-5 text-sidebar-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {user?.user_metadata?.full_name || "Student"}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-heading text-xl font-bold text-foreground">
                  {sidebarLinks.find(l => isActiveRoute(l.href))?.label || "Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HelpSupportDialog variant="student" />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
