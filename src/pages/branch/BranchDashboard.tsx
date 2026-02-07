import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import {
  LogOut,
  Users,
  CreditCard,
  Home,
  Building2,
  BookOpen,
  BarChart3,
  UserCog,
  ClipboardCheck,
  Newspaper,
  TrendingUp,
  Headphones,
  GraduationCap,
  FileText,
  Settings,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
import { RequestDialog } from "@/components/shared/RequestDialog";
import { NotificationBell } from "@/components/shared/NotificationBell";
import logo from "@/assets/logo.png";
 
interface BranchInfo {
  id: string;
  name: string;
  code: string;
  city: string;
}
 
const mainNavItems = [
  { icon: Home, label: "Dashboard", href: "/branch" },
  { icon: Building2, label: "Branch Profile", href: "/branch/profile" },
  { icon: BookOpen, label: "Batch Management", href: "/branch/batches" },
];

const departmentItems = [
  { icon: TrendingUp, label: "Sales", href: "/branch/sales" },
  { icon: Headphones, label: "Support", href: "/branch/support" },
  { icon: GraduationCap, label: "Teachers", href: "/branch/teachers" },
  { icon: Users, label: "Students", href: "/branch/students" },
];
 
const managementItems = [
  { icon: CreditCard, label: "Financial", href: "/branch/payments" },
  { icon: UserCog, label: "User Management", href: "/branch/users" },
  { icon: ClipboardCheck, label: "Requests", href: "/branch/requests" },
];

const reportsItems = [
  { icon: FileText, label: "Report Generation", href: "/branch/reports" },
  { icon: Target, label: "Performance", href: "/branch/performance" },
  { icon: BarChart3, label: "Analytics", href: "/branch/analytics" },
  { icon: Newspaper, label: "Blog & Stories", href: "/branch/blog" },
];
 
 function BranchSidebar({ branchInfo }: { branchInfo: BranchInfo | null }) {
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
     if (href === "/branch") {
       return location.pathname === "/branch";
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
                 Branch Admin
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

        {/* Departments */}
        <SidebarGroup>
          <SidebarGroupLabel>Departments</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {departmentItems.map((item) => (
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

        {/* Reports */}
        <SidebarGroup>
          <SidebarGroupLabel>Reports & Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsItems.map((item) => (
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
                 <Building2 className="w-4 h-4 text-primary" />
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-xs font-medium truncate">
                   {branchInfo?.name || "Branch Admin"}
                 </p>
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
 
 const BranchDashboard = () => {
   const { user, loading, isBranchAdmin } = useAuth();
   const navigate = useNavigate();
   const { toast } = useToast();
   const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
 
   useEffect(() => {
     if (!loading && !user) {
       navigate("/auth");
     } else if (!loading && user && !isBranchAdmin) {
       toast({
         title: "Access Denied",
         description: "You don't have branch admin privileges.",
         variant: "destructive",
       });
       navigate("/dashboard");
     }
   }, [loading, user, isBranchAdmin, navigate, toast]);
 
  useEffect(() => {
    const fetchBranchInfo = async () => {
      if (!user) return;

      // First try to find branch through employee record
      const { data: employee } = await supabase
        .from("employees")
        .select("branch_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (employee?.branch_id) {
        const { data: branch } = await supabase
          .from("branches")
          .select("id, name, code, city")
          .eq("id", employee.branch_id)
          .maybeSingle();

        if (branch) {
          setBranchInfo(branch);
          return;
        }
      }

      // Fallback: If no employee record, get first available branch for branch admin
      // This handles cases where branch admin isn't in employees table yet
      const { data: branches } = await supabase
        .from("branches")
        .select("id, name, code, city")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1);

      if (branches && branches.length > 0) {
        setBranchInfo(branches[0]);
      }
    };

    if (user) {
      fetchBranchInfo();
    }
  }, [user]);
 
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
 
   if (!isBranchAdmin) {
     return null;
   }
 
   return (
     <SidebarProvider>
       <div className="min-h-screen flex w-full">
         <BranchSidebar branchInfo={branchInfo} />
 
         <main className="flex-1 flex flex-col min-h-screen">
           {/* Top Bar */}
           <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 lg:px-6 py-3">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <SidebarTrigger />
                 <Separator orientation="vertical" className="h-6" />
                 <div>
                   <h1 className="font-heading text-lg font-bold text-foreground">
                     {branchInfo?.name || "Branch Dashboard"}
                   </h1>
                   <p className="text-xs text-muted-foreground">
                     {branchInfo?.city || "Manage your branch operations"}
                   </p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                  <RequestDialog />
                  <NotificationBell canSend={true} branchOnly={true} userBranchId={branchInfo?.id} />
               </div>
             </div>
           </header>
 
           {/* Dashboard Content */}
           <div className="flex-1 p-4 lg:p-6 overflow-auto">
             <Outlet context={{ branchInfo }} />
           </div>
         </main>
       </div>
     </SidebarProvider>
   );
 };
 
 export default BranchDashboard;