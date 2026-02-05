 import { useState, useEffect } from "react";
 import { useOutletContext } from "react-router-dom";
 import {
   Users,
   BookOpen,
   CreditCard,
   TrendingUp,
   UserCog,
   Building2,
   Calendar,
   ClipboardCheck,
 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 
 interface BranchInfo {
   id: string;
   name: string;
   code: string;
   city: string;
 }
 
 interface Stats {
   totalStudents: number;
   totalEmployees: number;
   activeBatches: number;
   pendingPayments: number;
   pendingRequests: number;
   totalRevenue: number;
 }
 
 const BranchOverview = () => {
   const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
   const [stats, setStats] = useState<Stats>({
     totalStudents: 0,
     totalEmployees: 0,
     activeBatches: 0,
     pendingPayments: 0,
     pendingRequests: 0,
     totalRevenue: 0,
   });
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const fetchStats = async () => {
       if (!branchInfo?.id) return;
 
       try {
         // Fetch students count
         const { count: studentsCount } = await supabase
           .from("students")
           .select("*", { count: "exact", head: true })
           .eq("branch_id", branchInfo.id)
           .eq("is_active", true);
 
         // Fetch employees count
         const { count: employeesCount } = await supabase
           .from("employees")
           .select("*", { count: "exact", head: true })
           .eq("branch_id", branchInfo.id)
           .eq("is_active", true);
 
         // Fetch active batches count
         const { count: batchesCount } = await supabase
           .from("batches")
           .select("*", { count: "exact", head: true })
           .eq("branch_id", branchInfo.id)
           .eq("is_active", true);
 
         // Fetch pending requests for this branch
         const { count: requestsCount } = await supabase
           .from("employee_requests")
           .select("*", { count: "exact", head: true })
           .eq("branch_id", branchInfo.id)
           .eq("status", "pending");
 
         setStats({
           totalStudents: studentsCount || 0,
           totalEmployees: employeesCount || 0,
           activeBatches: batchesCount || 0,
           pendingPayments: 0, // Would need to join with students
           pendingRequests: requestsCount || 0,
           totalRevenue: 0, // Would need payments aggregation
         });
       } catch (error) {
         console.error("Error fetching stats:", error);
       } finally {
         setLoading(false);
       }
     };
 
     fetchStats();
   }, [branchInfo]);
 
   const statCards = [
     {
       icon: Users,
       label: "Total Students",
       value: stats.totalStudents,
       color: "text-primary",
       bg: "bg-primary/10",
     },
     {
       icon: UserCog,
       label: "Employees",
       value: stats.totalEmployees,
       color: "text-info",
       bg: "bg-info/10",
     },
     {
       icon: BookOpen,
       label: "Active Batches",
       value: stats.activeBatches,
       color: "text-success",
       bg: "bg-success/10",
     },
     {
       icon: ClipboardCheck,
       label: "Pending Requests",
       value: stats.pendingRequests,
       color: "text-warning",
       bg: "bg-warning/10",
     },
   ];
 
   if (loading) {
     return (
       <div className="flex items-center justify-center py-12">
         <div className="animate-pulse text-muted-foreground">Loading...</div>
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Welcome Section */}
       <div className="card-elevated p-6 bg-gradient-to-r from-primary/10 to-accent/10">
         <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
             <Building2 className="w-8 h-8 text-primary" />
           </div>
           <div>
             <h1 className="font-heading text-2xl font-bold text-foreground">
               Welcome, Branch Admin
             </h1>
             <p className="text-muted-foreground">
               {branchInfo?.name} • {branchInfo?.city}
             </p>
           </div>
         </div>
       </div>
 
       {/* Stats Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {statCards.map((stat) => (
           <div key={stat.label} className="card-elevated p-5">
             <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                 <stat.icon className={`w-6 h-6 ${stat.color}`} />
               </div>
               <div>
                 <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                 <p className="text-sm text-muted-foreground">{stat.label}</p>
               </div>
             </div>
           </div>
         ))}
       </div>
 
       {/* Quick Actions */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Recent Activity */}
         <div className="card-elevated p-6">
           <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
             <Calendar className="w-5 h-5 text-primary" />
             Recent Activity
           </h3>
           <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
               <div className="w-2 h-2 rounded-full bg-success" />
               <p className="text-sm text-muted-foreground">
                 New student enrolled in Web Development batch
               </p>
             </div>
             <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
               <div className="w-2 h-2 rounded-full bg-warning" />
               <p className="text-sm text-muted-foreground">
                 Leave request pending approval
               </p>
             </div>
             <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
               <div className="w-2 h-2 rounded-full bg-primary" />
               <p className="text-sm text-muted-foreground">
                 Payment received from Student #1234
               </p>
             </div>
           </div>
         </div>
 
         {/* Branch Info */}
         <div className="card-elevated p-6">
           <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
             <Building2 className="w-5 h-5 text-primary" />
             Branch Information
           </h3>
           <div className="space-y-3">
             <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
               <span className="text-sm text-muted-foreground">Branch Code</span>
               <span className="font-medium">{branchInfo?.code || "-"}</span>
             </div>
             <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
               <span className="text-sm text-muted-foreground">City</span>
               <span className="font-medium">{branchInfo?.city || "-"}</span>
             </div>
             <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
               <span className="text-sm text-muted-foreground">Status</span>
               <span className="font-medium text-success">Active</span>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 };
 
 export default BranchOverview;