import { useState, useEffect } from "react";
import { FileText, Search, Check, X, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Request {
  id: string;
  user_id: string;
  request_type: string;
  subject: string;
  description: string;
  status: string;
  branch_id: string | null;
  branch_approved_by: string | null;
  branch_approved_at: string | null;
  admin_approved_by: string | null;
  admin_approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  branch_approved: "bg-info/10 text-info",
  admin_approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  branch_approved: "Branch Approved",
  admin_approved: "Approved",
  rejected: "Rejected",
};

const AdminRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { user, isAdmin, isBranchAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: Request) => {
    setActionLoading(true);
    try {
      let updateData: Partial<Request> = {};

      if (isBranchAdmin && request.status === "pending") {
        updateData = {
          status: "branch_approved",
          branch_approved_by: user?.id,
          branch_approved_at: new Date().toISOString(),
        };
      } else if (isAdmin && (request.status === "pending" || request.status === "branch_approved")) {
        updateData = {
          status: "admin_approved",
          admin_approved_by: user?.id,
          admin_approved_at: new Date().toISOString(),
        };
      }

      const { error } = await supabase
        .from("employee_requests")
        .update(updateData)
        .eq("id", request.id);

      if (error) throw error;

      toast({ title: "Request Approved", description: "The request has been approved." });
      fetchRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("employee_requests")
        .update({
          status: "rejected",
          rejection_reason: rejectReason,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({ title: "Request Rejected", description: "The request has been rejected." });
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesSearch =
      req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.request_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const canApprove = (request: Request) => {
    if (isBranchAdmin && request.status === "pending") return true;
    if (isAdmin && (request.status === "pending" || request.status === "branch_approved")) return true;
    return false;
  };

  const canReject = (request: Request) => {
    return request.status !== "rejected" && request.status !== "admin_approved";
  };

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
          <FileText className="w-6 h-6 text-primary" />
          Employee Requests
        </h2>
        <p className="text-muted-foreground">
          Review and approve employee leave requests and other requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-warning" />
            <div>
              <p className="text-2xl font-bold">{requests.filter((r) => r.status === "pending").length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-info" />
            <div>
              <p className="text-2xl font-bold">{requests.filter((r) => r.status === "branch_approved").length}</p>
              <p className="text-sm text-muted-foreground">Branch Approved</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-success" />
            <div>
              <p className="text-2xl font-bold">{requests.filter((r) => r.status === "admin_approved").length}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{requests.filter((r) => r.status === "rejected").length}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="branch_approved">Branch Approved</SelectItem>
            <SelectItem value="admin_approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="card-elevated p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize">
                    {request.request_type}
                  </Badge>
                  <Badge className={statusColors[request.status]}>
                    {statusLabels[request.status]}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{request.subject}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Submitted: {new Date(request.created_at).toLocaleDateString()}
                </p>
                {request.rejection_reason && (
                  <p className="text-sm text-destructive mt-2">
                    Rejection reason: {request.rejection_reason}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {canApprove(request) && (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(request)}
                    disabled={actionLoading}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                )}
                {canReject(request) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRejectDialog(true);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No requests found</p>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting this request.
            </p>
            <Textarea
              placeholder="Rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequests;