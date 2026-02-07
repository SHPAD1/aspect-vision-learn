import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FileText,
  Clock,
  Check,
  X,
  User,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BranchInfo {
  id: string;
  name: string;
}

interface Request {
  id: string;
  user_id: string;
  request_type: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  rejection_reason: string | null;
  requester_name?: string;
  requester_department?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  branch_approved: "bg-info/10 text-info",
  admin_approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const BranchRequestSection = () => {
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
      const { data } = await supabase
        .from("employee_requests")
        .select("*")
        .eq("branch_id", branchInfo.id)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const userIds = data.map((r) => r.user_id);
        
        const [{ data: profiles }, { data: employees }] = await Promise.all([
          supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", userIds),
          supabase
            .from("employees")
            .select("user_id, department")
            .in("user_id", userIds),
        ]);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]));
        const deptMap = new Map(employees?.map((e) => [e.user_id, e.department]));
        
        const requestsWithDetails = data.map((r) => ({
          ...r,
          requester_name: profileMap.get(r.user_id),
          requester_department: deptMap.get(r.user_id),
        }));

        setRequests(requestsWithDetails);
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
  const approvedRequests = requests.filter((r) => r.status === "branch_approved" || r.status === "admin_approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

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
        <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Request Management
        </h2>
        <p className="text-muted-foreground">Review and manage employee requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <X className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedRequests.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Check className="w-12 h-12 mx-auto mb-4 text-success" />
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{request.requester_name}</span>
                          {request.requester_department && (
                            <Badge variant="outline" className="capitalize">{request.requester_department}</Badge>
                          )}
                          <Badge variant="outline" className="capitalize">{request.request_type}</Badge>
                        </div>
                        <h4 className="font-semibold text-lg">{request.subject}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted on {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          onClick={() => handleApprove(request)}
                          disabled={actionLoading}
                        >
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="text-destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsRejectDialogOpen(true);
                          }}
                        >
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No approved requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {approvedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[request.status]}>
                          {request.status.replace("_", " ")}
                        </Badge>
                        <div>
                          <p className="font-medium">{request.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            by {request.requester_name} • {format(new Date(request.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No rejected requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rejectedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[request.status]}>
                          Rejected
                        </Badge>
                        <div>
                          <p className="font-medium">{request.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            by {request.requester_name} • {format(new Date(request.created_at), "MMM d, yyyy")}
                          </p>
                          {request.rejection_reason && (
                            <p className="text-xs text-destructive mt-1">
                              Reason: {request.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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

export default BranchRequestSection;
