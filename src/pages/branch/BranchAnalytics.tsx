 import { useState, useEffect } from "react";
 import { useOutletContext } from "react-router-dom";
 import {
   BarChart3,
   Users,
   TrendingUp,
   IndianRupee,
   BookOpen,
   Loader2,
 } from "lucide-react";
 import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   PieChart,
   Pie,
   Cell,
   LineChart,
   Line,
 } from "recharts";
 import { supabase } from "@/integrations/supabase/client";
 
 interface BranchInfo {
   id: string;
   name: string;
   code: string;
   city: string;
 }
 
 const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--info))"];
 
 const BranchAnalytics = () => {
   const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState({
     totalStudents: 0,
     totalEmployees: 0,
     activeBatches: 0,
     totalRevenue: 0,
   });
   const [batchData, setBatchData] = useState<{ name: string; students: number }[]>([]);
   const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number; enrollments: number }[]>([]);
 
   useEffect(() => {
     fetchAnalytics();
   }, [branchInfo]);
 
   const fetchAnalytics = async () => {
     if (!branchInfo?.id) return;
 
     try {
       // Fetch basic stats
       const [studentsRes, employeesRes, batchesRes] = await Promise.all([
         supabase
           .from("students")
           .select("*", { count: "exact", head: true })
           .eq("branch_id", branchInfo.id)
           .eq("is_active", true),
         supabase
           .from("employees")
           .select("*", { count: "exact", head: true })
           .eq("branch_id", branchInfo.id)
           .eq("is_active", true),
         supabase
           .from("batches")
           .select("id, name")
           .eq("branch_id", branchInfo.id)
           .eq("is_active", true),
       ]);
 
       setStats({
         totalStudents: studentsRes.count || 0,
         totalEmployees: employeesRes.count || 0,
         activeBatches: batchesRes.data?.length || 0,
         totalRevenue: 0,
       });
 
       // Fetch enrollment data per batch
       if (batchesRes.data && batchesRes.data.length > 0) {
         const batchIds = batchesRes.data.map((b) => b.id);
         const { data: enrollments } = await supabase
           .from("student_enrollments")
           .select("batch_id")
           .in("batch_id", batchIds);
 
         const batchEnrollmentCounts = new Map<string, number>();
         enrollments?.forEach((e) => {
           batchEnrollmentCounts.set(
             e.batch_id,
             (batchEnrollmentCounts.get(e.batch_id) || 0) + 1
           );
         });
 
         const chartData = batchesRes.data.map((b) => ({
           name: b.name.length > 15 ? b.name.substring(0, 15) + "..." : b.name,
           students: batchEnrollmentCounts.get(b.id) || 0,
         }));
 
         setBatchData(chartData);
       }
 
       // Generate sample monthly data
       const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
       const sampleMonthlyData = months.map((month) => ({
         month,
         revenue: Math.floor(Math.random() * 200000) + 50000,
         enrollments: Math.floor(Math.random() * 20) + 5,
       }));
       setMonthlyData(sampleMonthlyData);
     } catch (error) {
       console.error("Error fetching analytics:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const pieData = [
     { name: "Students", value: stats.totalStudents },
     { name: "Employees", value: stats.totalEmployees },
     { name: "Batches", value: stats.activeBatches },
   ];
 
   if (loading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div>
         <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
           <BarChart3 className="w-6 h-6 text-primary" />
           Branch Analytics
         </h2>
         <p className="text-muted-foreground">
           Performance metrics for {branchInfo?.name}
         </p>
       </div>
 
       {/* Key Metrics */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="card-elevated p-5">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
               <Users className="w-6 h-6 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold">{stats.totalStudents}</p>
               <p className="text-sm text-muted-foreground">Total Students</p>
             </div>
           </div>
         </div>
         <div className="card-elevated p-5">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
               <TrendingUp className="w-6 h-6 text-success" />
             </div>
             <div>
               <p className="text-2xl font-bold">{stats.totalEmployees}</p>
               <p className="text-sm text-muted-foreground">Employees</p>
             </div>
           </div>
         </div>
         <div className="card-elevated p-5">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
               <BookOpen className="w-6 h-6 text-warning" />
             </div>
             <div>
               <p className="text-2xl font-bold">{stats.activeBatches}</p>
               <p className="text-sm text-muted-foreground">Active Batches</p>
             </div>
           </div>
         </div>
         <div className="card-elevated p-5">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
               <IndianRupee className="w-6 h-6 text-info" />
             </div>
             <div>
               <p className="text-2xl font-bold">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
               <p className="text-sm text-muted-foreground">Revenue</p>
             </div>
           </div>
         </div>
       </div>
 
       {/* Charts Row */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Students per Batch */}
         <div className="card-elevated p-6">
           <h3 className="font-heading text-lg font-semibold mb-4">
             Students per Batch
           </h3>
           <div className="h-[300px]">
             {batchData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={batchData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                   <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                   <YAxis />
                   <Tooltip
                     contentStyle={{
                       backgroundColor: "hsl(var(--card))",
                       border: "1px solid hsl(var(--border))",
                       borderRadius: "8px",
                     }}
                   />
                   <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground">
                 No batch data available
               </div>
             )}
           </div>
         </div>
 
         {/* Distribution Pie Chart */}
         <div className="card-elevated p-6">
           <h3 className="font-heading text-lg font-semibold mb-4">
             Branch Overview
           </h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                   label={({ name, value }) => `${name}: ${value}`}
                 >
                   {pieData.map((_, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
         </div>
       </div>
 
       {/* Monthly Trend */}
       <div className="card-elevated p-6">
         <h3 className="font-heading text-lg font-semibold mb-4">
           Monthly Enrollment Trend
         </h3>
         <div className="h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={monthlyData}>
               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
               <XAxis dataKey="month" />
               <YAxis />
               <Tooltip
                 contentStyle={{
                   backgroundColor: "hsl(var(--card))",
                   border: "1px solid hsl(var(--border))",
                   borderRadius: "8px",
                 }}
               />
               <Line
                 type="monotone"
                 dataKey="enrollments"
                 stroke="hsl(var(--primary))"
                 strokeWidth={2}
                 dot={{ fill: "hsl(var(--primary))" }}
               />
             </LineChart>
           </ResponsiveContainer>
         </div>
       </div>
     </div>
   );
 };
 
 export default BranchAnalytics;