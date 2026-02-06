import { useEffect } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import {
  LogOut,
  Users,
  CreditCard,
  Settings,
  Home,
  Bell,
  UserPlus,
  Building2,
  Youtube,
  Wallet,
  TrendingUp,
  Calendar,
  BookOpen,
  FileText,
  Image,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logo.png";

const mainNavItems = [
  { icon: Home, label: "Overview", href: "/admin" },
  { icon: Users, label: "Students", href: "/admin/students" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: BookOpen, label: "Batches", href: "/admin/batches" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Ticket, label: "Coupons", href: "/admin/coupons" },
  { icon: FileText, label: "Requests", href: "/admin/requests" },
  { icon: Image, label: "Banners", href: "/admin/banners" },
];

const managementItems = [
  { icon: TrendingUp, label: "Employee Performance", href: "/admin/performance" },
  { icon: Wallet, label: "Salary Management", href: "/admin/salary" },
  { icon: Calendar, label: "Weekly Reports", href: "/admin/reports" },
  { icon: Youtube, label: "YouTube Analytics", href: "/admin/youtube" },
];

const systemItems = [
  { icon: UserPlus, label: "User Management", href: "/admin/users" },
  { icon: Building2, label: "Branches", href: "/admin/branches" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "See you soon!" });
    navigate("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive(item.href)}
        tooltip={isCollapsed ? item.label : undefined}
      >
        <Link to={item.href}>
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-2 py-2">
          <img src={logo} alt="Aspect Vision" className="h-8 w-auto shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-sm font-bold leading-none">
                Aspect<span className="text-primary">Vision</span>
              </span>
              <span className="text-[10px] text-sidebar-foreground/60">
                Admin Panel
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2">
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Administrator</p>
                <p className="text-[10px] text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

const AdminDashboard = () => {
  const { user, loading, isAdmin, isBranchAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !isAdmin && !isBranchAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [loading, user, isAdmin, isBranchAdmin, navigate, toast]);

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

  if (!isAdmin && !isBranchAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 lg:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <h1 className="font-heading text-lg font-bold text-foreground">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Manage your entire system
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
