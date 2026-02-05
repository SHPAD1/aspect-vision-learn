 import { useState, useEffect } from "react";
 import { useOutletContext } from "react-router-dom";
 import {
   ClipboardCheck,
   Check,
   X,
   Clock,
   Loader2,
   FileText,
   User,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Textarea } from "@/components/ui/textarea";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from "@/components/ui/dialog";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { useToast } from "@/hooks/use-toast";
 import { format } from "date-fns";
 
 interface BranchInfo {
   id: string;
   name: string;
   code: string;
   city: string;
 }
 
 interface Request {
   id: string;
   user_id: string;
   request_type: string;
   subject: string;
   description: string;
   status: string;
   created_at: string;
   requester_name?: string;
 }
 
 const statusColors: Record<string, string> = {
   pending: "bg-warning/10 text-warning",
   branch_approved: "bg-info/10 text-info",
   admin_approved: "bg-success/10 text-success",
   rejected: "bg-destructive/10 text-destructive",
 };
 
 const BranchReports = () => {
   const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
   const { user } = useAuth();
   const { toast } = useToast();
   const [requests, setRequests] = useState<Request[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
   const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
   const [rejectionReason, setRejectionReason] = useState("");
   const [actionLoading, setActionLoading] = useState(false);
 
   useEffect(() => {
     fetchRequests();
   }, [branchInfo]);
 
   const fetchRequests = async () => {
     if (!branchInfo?.id) return;
 
     try {
       const { data, error } = await supabase
         .from("employee_requests")
         .select("*")
         .eq("branch_id", branchInfo.id)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
 
       // Fetch requester names
       if (data && data.length > 0) {
         const userIds = data.map((r) => r.user_id);
         const { data: profiles } = await supabase
           .from("profiles")
           .select("user_id, full_name")
           .in("user_id", userIds);
 
         const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]));
         const requestsWithNames = data.map((r) => ({
           ...r,
           requester_name: profileMap.get(r.user_id),
         }));
 
         setRequests(requestsWithNames);
       } else {
         setRequests([]);
       }
     } catch (error) {
       console.error("Error fetching requests:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const handleApprove = async (request: Request) => {
     if (!user) return;
     setActionLoading(true);
 
     try {
       const { error } = await supabase
         .from("employee_requests")
         .update({
           status: "branch_approved",
           branch_approved_by: user.id,
           branch_approved_at: new Date().toISOString(),
         })
         .eq("id", request.id);
 
       if (error) throw error;
 
       toast({
         title: "Request Approved",
         description: "Request forwarded to admin for final approval.",
       });
       fetchRequests();
     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message || "Failed to approve request",
         variant: "destructive",
       });
     } finally {
       setActionLoading(false);
     }
   };
 
   const handleReject = async () => {
     if (!user || !selectedRequest) return;
     setActionLoading(true);
 
     try {
       const { error } = await supabase
         .from("employee_requests")
         .update({
           status: "rejected",
           rejection_reason: rejectionReason,
           branch_approved_by: user.id,
           branch_approved_at: new Date().toISOString(),
         })
         .eq("id", selectedRequest.id);
 
       if (error) throw error;
 
       toast({
         title: "Request Rejected",
         description: "The request has been rejected.",
       });
       setIsRejectDialogOpen(false);
       setRejectionReason("");
       fetchRequests();
     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message || "Failed to reject request",
         variant: "destructive",
       });
     } finally {
       setActionLoading(false);
     }
   };
 
   const pendingRequests = requests.filter((r) => r.status === "pending");
   const processedRequests = requests.filter((r) => r.status !== "pending");
 
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
           <ClipboardCheck className="w-6 h-6 text-primary" />
           Report & Request Approval
         </h2>
         <p className="text-muted-foreground">
           Review and approve employee requests for {branchInfo?.name}
         </p>
       </div>
 
       {/* Stats */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="card-elevated p-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
               <Clock className="w-5 h-5 text-warning" />
             </div>
             <div>
               <p className="text-2xl font-bold">{pendingRequests.length}</p>
               <p className="text-sm text-muted-foreground">Pending Approval</p>
             </div>
           </div>
         </div>
         <div className="card-elevated p-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
               <Check className="w-5 h-5 text-success" />
             </div>
             <div>
               <p className="text-2xl font-bold">
                 {requests.filter((r) => r.status === "branch_approved" || r.status === "admin_approved").length}
               </p>
               <p className="text-sm text-muted-foreground">Approved</p>
             </div>
           </div>
         </div>
         <div className="card-elevated p-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
               <X className="w-5 h-5 text-destructive" />
             </div>
             <div>
               <p className="text-2xl font-bold">
                 {requests.filter((r) => r.status === "rejected").length}
               </p>
               <p className="text-sm text-muted-foreground">Rejected</p>
             </div>
           </div>
         </div>
       </div>
 
       {/* Pending Requests */}
       <div className="card-elevated p-6">
         <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
           <Clock className="w-5 h-5 text-warning" />
           Pending Requests ({pendingRequests.length})
         </h3>
 
         {pendingRequests.length === 0 ? (
           <div className="text-center py-8">
             <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
             <p className="text-muted-foreground">No pending requests</p>
           </div>
         ) : (
           <div className="space-y-4">
             {pendingRequests.map((request) => (
               <div
                 key={request.id}
                 className="p-4 rounded-xl border border-border bg-muted/30 space-y-3"
               >
                 <div className="flex justify-between items-start">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <User className="w-4 h-4 text-muted-foreground" />
                       <span className="font-medium">{request.requester_name}</span>
                       <Badge variant="outline" className="capitalize">
                         {request.request_type}
                       </Badge>
                     </div>
                     <h4 className="font-semibold">{request.subject}</h4>
                     <p className="text-sm text-muted-foreground mt-1">
                       {request.description}
                     </p>
                   </div>
                   <span className="text-xs text-muted-foreground">
                     {format(new Date(request.created_at), "MMM d, yyyy")}
                   </span>
                 </div>
 
                 <div className="flex gap-2 pt-2">
                   <Button
                     size="sm"
                     onClick={() => handleApprove(request)}
                     disabled={actionLoading}
                   >
                     <Check className="w-4 h-4 mr-1" />
                     Approve
                   </Button>
                   <Button
                     size="sm"
                     variant="outline"
                     className="text-destructive"
                     onClick={() => {
                       setSelectedRequest(request);
                       setIsRejectDialogOpen(true);
                     }}
                   >
                     <X className="w-4 h-4 mr-1" />
                     Reject
                   </Button>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
 
       {/* Processed Requests */}
       <div className="card-elevated p-6">
         <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
           <FileText className="w-5 h-5 text-primary" />
           Processed Requests
         </h3>
 
         {processedRequests.length === 0 ? (
           <p className="text-center py-4 text-muted-foreground">No processed requests</p>
         ) : (
           <div className="space-y-3">
             {processedRequests.slice(0, 10).map((request) => (
               <div
                 key={request.id}
                 className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
               >
                 <div className="flex items-center gap-3">
                   <Badge className={statusColors[request.status]}>
                     {request.status.replace("_", " ")}
                   </Badge>
                   <div>
                     <p className="font-medium text-sm">{request.subject}</p>
                     <p className="text-xs text-muted-foreground">
                       by {request.requester_name}
                     </p>
                   </div>
                 </div>
                 <span className="text-xs text-muted-foreground">
                   {format(new Date(request.created_at), "MMM d")}
                 </span>
               </div>
             ))}
           </div>
         )}
       </div>
 
       {/* Reject Dialog */}
       <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Reject Request</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <p className="text-sm text-muted-foreground">
               Please provide a reason for rejecting this request.
             </p>
             <Textarea
               placeholder="Reason for rejection..."
               value={rejectionReason}
               onChange={(e) => setRejectionReason(e.target.value)}
               rows={3}
             />
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
               Cancel
             </Button>
             <Button
               variant="destructive"
               onClick={handleReject}
               disabled={!rejectionReason.trim() || actionLoading}
             >
               {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject"}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default BranchReports;