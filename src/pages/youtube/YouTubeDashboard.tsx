import { useEffect } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import {
  LogOut, Home, Video, BarChart3, DollarSign, UserCircle, TrendingUp, Upload, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationBell } from "@/components/shared/NotificationBell";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: Home, label: "Overview", href: "/youtube" },
  { icon: UserCircle, label: "Profile", href: "/youtube/profile" },
  { icon: Video, label: "All Videos", href: "/youtube/videos" },
  { icon: Upload, label: "Add Video", href: "/youtube/add" },
  { icon: BarChart3, label: "Analytics", href: "/youtube/analytics" },
  { icon: DollarSign, label: "Revenue", href: "/youtube/revenue" },
  { icon: TrendingUp, label: "Performance", href: "/youtube/performance" },
];

function YouTubeSidebar() {
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
    if (href === "/youtube") return location.pathname === "/youtube";
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-2 py-2">
          <img src={logo} alt="Aspect Vision" className="h-8 w-auto shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-sm font-bold leading-none">
                Aspect<span className="text-destructive">Vision</span>
              </span>
              <span className="text-[10px] text-sidebar-foreground/60">YouTube Manager</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>YouTube Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={isCollapsed ? item.label : undefined}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2">
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-destructive">YT</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">YouTube Manager</p>
                <p className="text-[10px] text-sidebar-foreground/60 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size={isCollapsed ? "icon" : "sm"} className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

const YouTubeDashboard = () => {
  const { user, loading, hasRole, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isYoutubeManager = hasRole("youtube_manager");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
    else if (!loading && user && !isYoutubeManager && !isAdmin) {
      toast({ title: "Access Denied", description: "You don't have YouTube Manager privileges.", variant: "destructive" });
      navigate("/auth");
    }
  }, [loading, user, isYoutubeManager, isAdmin, navigate, toast]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-destructive/20" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );

  if (!isYoutubeManager && !isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <YouTubeSidebar />
        <main className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 lg:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <h1 className="font-heading text-lg font-bold text-foreground">YouTube Dashboard</h1>
                  <p className="text-xs text-muted-foreground">Manage videos, analytics & revenue</p>
                </div>
              </div>
              <NotificationBell />
            </div>
          </header>
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default YouTubeDashboard;
