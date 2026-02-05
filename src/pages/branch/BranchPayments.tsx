 import { useState, useEffect } from "react";
 import { useOutletContext } from "react-router-dom";
 import {
   CreditCard,
   Search,
   IndianRupee,
   Calendar,
   Loader2,
   TrendingUp,
   Download,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
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
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { supabase } from "@/integrations/supabase/client";
 import { format } from "date-fns";
 
 interface BranchInfo {
   id: string;
   name: string;
   code: string;
   city: string;
 }
 
 interface Payment {
   id: string;
   amount: number;
   payment_date: string;
   payment_method: string | null;
   status: string;
   transaction_id: string | null;
   student_id: string;
   student_name?: string;
   batch_name?: string;
 }
 
 const statusColors: Record<string, string> = {
   completed: "bg-success/10 text-success",
   pending: "bg-warning/10 text-warning",
   failed: "bg-destructive/10 text-destructive",
 };
 
 const BranchPayments = () => {
   const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
   const [payments, setPayments] = useState<Payment[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [statusFilter, setStatusFilter] = useState("all");
   const [totalRevenue, setTotalRevenue] = useState(0);
 
   useEffect(() => {
     fetchPayments();
   }, [branchInfo]);
 
   const fetchPayments = async () => {
     if (!branchInfo?.id) return;
 
     try {
       // Get students for this branch
       const { data: students } = await supabase
         .from("students")
         .select("id, user_id")
         .eq("branch_id", branchInfo.id);
 
       if (!students || students.length === 0) {
         setPayments([]);
         setLoading(false);
         return;
       }
 
       const studentIds = students.map((s) => s.id);
       const userIds = students.map((s) => s.user_id);
 
       // Fetch payments for these students
       const { data: paymentsData, error } = await supabase
         .from("payments")
         .select(`
           *,
           batches(name)
         `)
         .in("student_id", studentIds)
         .order("payment_date", { ascending: false });
 
       if (error) throw error;
 
       // Fetch profiles
       const { data: profiles } = await supabase
         .from("profiles")
         .select("user_id, full_name")
         .in("user_id", userIds);
 
       const studentUserMap = new Map(students.map((s) => [s.id, s.user_id]));
       const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]));
 
       const paymentsWithDetails = (paymentsData || []).map((p: any) => ({
         ...p,
         student_name: profileMap.get(studentUserMap.get(p.student_id)),
         batch_name: p.batches?.name,
       }));
 
       setPayments(paymentsWithDetails);
 
       // Calculate total revenue
       const total = paymentsWithDetails
         .filter((p: Payment) => p.status === "completed")
         .reduce((sum: number, p: Payment) => sum + p.amount, 0);
       setTotalRevenue(total);
     } catch (error) {
       console.error("Error fetching payments:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const filteredPayments = payments.filter((p) => {
     const matchesSearch =
       p.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesStatus = statusFilter === "all" || p.status === statusFilter;
     return matchesSearch && matchesStatus;
   });
 
   if (loading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between gap-4">
         <div>
           <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
             <CreditCard className="w-6 h-6 text-primary" />
             Fee & Payment Reports
           </h2>
           <p className="text-muted-foreground">
             Track payments for {branchInfo?.name}
           </p>
         </div>
         <Button variant="outline">
           <Download className="w-4 h-4 mr-2" />
           Export Report
         </Button>
       </div>
 
       {/* Stats */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="card-elevated p-5 bg-gradient-to-r from-success/10 to-success/5">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
               <IndianRupee className="w-6 h-6 text-success" />
             </div>
             <div>
               <p className="text-2xl font-bold text-foreground">
                 ₹{totalRevenue.toLocaleString()}
               </p>
               <p className="text-sm text-muted-foreground">Total Revenue</p>
             </div>
           </div>
         </div>
         <div className="card-elevated p-5">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
               <TrendingUp className="w-6 h-6 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold">{payments.length}</p>
               <p className="text-sm text-muted-foreground">Total Transactions</p>
             </div>
           </div>
         </div>
         <div className="card-elevated p-5">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
               <Calendar className="w-6 h-6 text-warning" />
             </div>
             <div>
               <p className="text-2xl font-bold">
                 {payments.filter((p) => p.status === "pending").length}
               </p>
               <p className="text-sm text-muted-foreground">Pending</p>
             </div>
           </div>
         </div>
       </div>
 
       {/* Filters */}
       <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Search by student or transaction ID..."
             className="pl-10"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
         </div>
         <Select value={statusFilter} onValueChange={setStatusFilter}>
           <SelectTrigger className="w-[150px]">
             <SelectValue placeholder="Status" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Status</SelectItem>
             <SelectItem value="completed">Completed</SelectItem>
             <SelectItem value="pending">Pending</SelectItem>
             <SelectItem value="failed">Failed</SelectItem>
           </SelectContent>
         </Select>
       </div>
 
       {/* Payments Table */}
       <div className="card-elevated overflow-hidden">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Student</TableHead>
               <TableHead>Batch</TableHead>
               <TableHead>Amount</TableHead>
               <TableHead>Date</TableHead>
               <TableHead>Method</TableHead>
               <TableHead>Status</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {filteredPayments.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-8">
                   <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                   <p className="text-muted-foreground">No payments found</p>
                 </TableCell>
               </TableRow>
             ) : (
               filteredPayments.map((payment) => (
                 <TableRow key={payment.id}>
                   <TableCell>
                     <p className="font-medium">{payment.student_name || "Unknown"}</p>
                   </TableCell>
                   <TableCell>
                     <span className="text-muted-foreground">
                       {payment.batch_name || "-"}
                     </span>
                   </TableCell>
                   <TableCell>
                     <span className="font-semibold text-foreground">
                       ₹{payment.amount.toLocaleString()}
                     </span>
                   </TableCell>
                   <TableCell>
                     <span className="text-sm text-muted-foreground">
                       {format(new Date(payment.payment_date), "MMM d, yyyy")}
                     </span>
                   </TableCell>
                   <TableCell>
                     <span className="text-sm capitalize">
                       {payment.payment_method || "Cash"}
                     </span>
                   </TableCell>
                   <TableCell>
                     <Badge className={statusColors[payment.status] || "bg-muted"}>
                       {payment.status}
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
 
 export default BranchPayments;