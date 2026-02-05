 import { useState, useEffect } from "react";
 import { useOutletContext } from "react-router-dom";
 import {
   UserCog,
   Search,
   Phone,
   Briefcase,
   Calendar,
   Loader2,
 } from "lucide-react";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { supabase } from "@/integrations/supabase/client";
 import { format } from "date-fns";
 
 interface BranchInfo {
   id: string;
   name: string;
   code: string;
   city: string;
 }
 
 interface Employee {
   id: string;
   employee_id: string;
   user_id: string;
   department: string;
   designation: string | null;
   joining_date: string;
   is_active: boolean;
   profile?: {
     full_name: string;
     email: string;
     phone: string | null;
   };
 }
 
 const departmentColors: Record<string, string> = {
   sales: "bg-success/10 text-success",
   support: "bg-primary/10 text-primary",
   teaching: "bg-info/10 text-info",
   management: "bg-warning/10 text-warning",
   operations: "bg-accent/10 text-accent-foreground",
 };
 
 const BranchEmployees = () => {
   const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
   const [employees, setEmployees] = useState<Employee[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
 
   useEffect(() => {
     fetchEmployees();
   }, [branchInfo]);
 
   const fetchEmployees = async () => {
     if (!branchInfo?.id) return;
 
     try {
       const { data: employeesData, error } = await supabase
         .from("employees")
         .select("*")
         .eq("branch_id", branchInfo.id)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
 
       if (employeesData && employeesData.length > 0) {
         const userIds = employeesData.map((e) => e.user_id);
         const { data: profiles } = await supabase
           .from("profiles")
           .select("user_id, full_name, email, phone")
           .in("user_id", userIds);
 
         const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
         const employeesWithProfiles = employeesData.map((e) => ({
           ...e,
           profile: profileMap.get(e.user_id),
         }));
 
         setEmployees(employeesWithProfiles);
       } else {
         setEmployees([]);
       }
     } catch (error) {
       console.error("Error fetching employees:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const filteredEmployees = employees.filter(
     (e) =>
       e.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
       e.profile?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       e.department.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
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
           <UserCog className="w-6 h-6 text-primary" />
           Branch Employees
         </h2>
         <p className="text-muted-foreground">
           View employees working at {branchInfo?.name}
         </p>
       </div>
 
       {/* Stats by Department */}
       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
         {["sales", "support", "teaching", "management"].map((dept) => (
           <div key={dept} className="card-elevated p-4">
             <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${departmentColors[dept] || "bg-muted"}`}>
                 <Briefcase className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-xl font-bold">
                   {employees.filter((e) => e.department.toLowerCase() === dept).length}
                 </p>
                 <p className="text-xs text-muted-foreground capitalize">{dept}</p>
               </div>
             </div>
           </div>
         ))}
       </div>
 
       {/* Search */}
       <div className="relative max-w-md">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
         <Input
           placeholder="Search by name, ID, or department..."
           className="pl-10"
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
         />
       </div>
 
       {/* Employees Table */}
       <div className="card-elevated overflow-hidden">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Employee</TableHead>
               <TableHead>Employee ID</TableHead>
               <TableHead>Department</TableHead>
               <TableHead>Contact</TableHead>
               <TableHead>Joined</TableHead>
               <TableHead>Status</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {filteredEmployees.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-8">
                   <UserCog className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                   <p className="text-muted-foreground">No employees found</p>
                 </TableCell>
               </TableRow>
             ) : (
               filteredEmployees.map((employee) => (
                 <TableRow key={employee.id}>
                   <TableCell>
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                         <span className="text-sm font-medium text-primary">
                           {employee.profile?.full_name?.charAt(0) || "E"}
                         </span>
                       </div>
                       <div>
                         <p className="font-medium">{employee.profile?.full_name || "Unknown"}</p>
                         <p className="text-xs text-muted-foreground">
                           {employee.designation || "Staff"}
                         </p>
                       </div>
                     </div>
                   </TableCell>
                   <TableCell>
                     <Badge variant="outline">{employee.employee_id}</Badge>
                   </TableCell>
                   <TableCell>
                     <Badge className={departmentColors[employee.department.toLowerCase()] || "bg-muted"}>
                       {employee.department}
                     </Badge>
                   </TableCell>
                   <TableCell>
                     {employee.profile?.phone ? (
                       <div className="flex items-center gap-1 text-sm text-muted-foreground">
                         <Phone className="w-3 h-3" />
                         {employee.profile.phone}
                       </div>
                     ) : (
                       <span className="text-muted-foreground">-</span>
                     )}
                   </TableCell>
                   <TableCell>
                     <div className="flex items-center gap-1 text-sm text-muted-foreground">
                       <Calendar className="w-3 h-3" />
                       {format(new Date(employee.joining_date), "MMM d, yyyy")}
                     </div>
                   </TableCell>
                   <TableCell>
                     <Badge variant={employee.is_active ? "default" : "secondary"}>
                       {employee.is_active ? "Active" : "Inactive"}
                     </Badge>
                   </TableCell>
                 </TableRow>
               ))
             )}
           </TableBody>
         </Table>
       </div>
     </div>
   );
 };
 
 export default BranchEmployees;