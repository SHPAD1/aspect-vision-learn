 import { useState, useEffect } from "react";
 import { useOutletContext } from "react-router-dom";
 import {
   Users,
   Search,
   Phone,
   Mail,
   Calendar,
   Loader2,
   GraduationCap,
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
 
 interface Student {
   id: string;
   student_id: string;
   user_id: string;
   enrollment_date: string;
   is_active: boolean;
   profile?: {
     full_name: string;
     email: string;
     phone: string | null;
   };
 }
 
 const BranchStudents = () => {
   const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
   const [students, setStudents] = useState<Student[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
 
   useEffect(() => {
     fetchStudents();
   }, [branchInfo]);
 
   const fetchStudents = async () => {
     if (!branchInfo?.id) return;
 
     try {
       // First fetch students
       const { data: studentsData, error } = await supabase
         .from("students")
         .select("*")
         .eq("branch_id", branchInfo.id)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
 
       // Fetch profiles for these students
       if (studentsData && studentsData.length > 0) {
         const userIds = studentsData.map((s) => s.user_id);
         const { data: profiles } = await supabase
           .from("profiles")
           .select("user_id, full_name, email, phone")
           .in("user_id", userIds);
 
         const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
         const studentsWithProfiles = studentsData.map((s) => ({
           ...s,
           profile: profileMap.get(s.user_id),
         }));
 
         setStudents(studentsWithProfiles);
       } else {
         setStudents([]);
       }
     } catch (error) {
       console.error("Error fetching students:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const filteredStudents = students.filter(
     (s) =>
       s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
       s.profile?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       s.profile?.email.toLowerCase().includes(searchQuery.toLowerCase())
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
           <Users className="w-6 h-6 text-primary" />
           Branch Students
         </h2>
         <p className="text-muted-foreground">
           Manage students enrolled at {branchInfo?.name}
         </p>
       </div>
 
       {/* Stats */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="card-elevated p-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
               <Users className="w-5 h-5 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold">{students.length}</p>
               <p className="text-sm text-muted-foreground">Total Students</p>
             </div>
           </div>
         </div>
         <div className="card-elevated p-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
               <GraduationCap className="w-5 h-5 text-success" />
             </div>
             <div>
               <p className="text-2xl font-bold">
                 {students.filter((s) => s.is_active).length}
               </p>
               <p className="text-sm text-muted-foreground">Active</p>
             </div>
           </div>
         </div>
         <div className="card-elevated p-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
               <Calendar className="w-5 h-5 text-warning" />
             </div>
             <div>
               <p className="text-2xl font-bold">
                 {students.filter((s) => {
                   const enrolled = new Date(s.enrollment_date);
                   const now = new Date();
                   return enrolled.getMonth() === now.getMonth();
                 }).length}
               </p>
               <p className="text-sm text-muted-foreground">This Month</p>
             </div>
           </div>
         </div>
       </div>
 
       {/* Search */}
       <div className="relative max-w-md">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
         <Input
           placeholder="Search by name, ID, or email..."
           className="pl-10"
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
         />
       </div>
 
       {/* Students Table */}
       <div className="card-elevated overflow-hidden">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Student</TableHead>
               <TableHead>Student ID</TableHead>
               <TableHead>Contact</TableHead>
               <TableHead>Enrolled</TableHead>
               <TableHead>Status</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {filteredStudents.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8">
                   <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                   <p className="text-muted-foreground">No students found</p>
                 </TableCell>
               </TableRow>
             ) : (
               filteredStudents.map((student) => (
                 <TableRow key={student.id}>
                   <TableCell>
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                         <span className="text-sm font-medium text-primary">
                           {student.profile?.full_name?.charAt(0) || "S"}
                         </span>
                       </div>
                       <div>
                         <p className="font-medium">{student.profile?.full_name || "Unknown"}</p>
                         <p className="text-xs text-muted-foreground">{student.profile?.email}</p>
                       </div>
                     </div>
                   </TableCell>
                   <TableCell>
                     <Badge variant="outline">{student.student_id}</Badge>
                   </TableCell>
                   <TableCell>
                     {student.profile?.phone ? (
                       <div className="flex items-center gap-1 text-sm text-muted-foreground">
                         <Phone className="w-3 h-3" />
                         {student.profile.phone}
                       </div>
                     ) : (
                       <span className="text-muted-foreground">-</span>
                     )}
                   </TableCell>
                   <TableCell>
                     <span className="text-sm text-muted-foreground">
                       {format(new Date(student.enrollment_date), "MMM d, yyyy")}
                     </span>
                   </TableCell>
                   <TableCell>
                     <Badge variant={student.is_active ? "default" : "secondary"}>
                       {student.is_active ? "Active" : "Inactive"}
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
 
 export default BranchStudents;