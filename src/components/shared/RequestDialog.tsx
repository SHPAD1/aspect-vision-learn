import { useState, useEffect } from "react";
import { FileText, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const requestTypes = [
  { value: "leave", label: "Leave Request" },
  { value: "problem", label: "Report Problem" },
  { value: "resource", label: "Resource Request" },
  { value: "other", label: "Other" },
];

export function RequestDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    requestType: "",
    subject: "",
    description: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch employee's branch_id
  useEffect(() => {
    const fetchBranch = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("employees")
        .select("branch_id")
        .eq("user_id", user.id)
        .single();
      if (data?.branch_id) {
        setBranchId(data.branch_id);
      }
    };
    fetchBranch();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.requestType || !formData.subject || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("employee_requests").insert({
        user_id: user.id,
        request_type: formData.requestType,
        subject: formData.subject,
        description: formData.description,
        branch_id: branchId,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your request has been sent to the Branch Admin for approval.",
      });
      setFormData({ requestType: "", subject: "", description: "" });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Submit Request
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Submit leave requests, report problems, or request resources. Your request will be reviewed by the Branch Admin first, then forwarded to Admin for final approval.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Request Type</Label>
            <Select
              value={formData.requestType}
              onValueChange={(value) => setFormData({ ...formData, requestType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subject</Label>
            <Input
              placeholder="Brief title for your request"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Provide detailed information about your request..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}