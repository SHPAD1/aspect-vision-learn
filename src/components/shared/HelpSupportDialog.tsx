import { useState } from "react";
import { HelpCircle, Send, Loader2, Phone, MessageCircle, AlertCircle, CreditCard } from "lucide-react";
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

interface HelpSupportDialogProps {
  variant?: "student" | "sales";
}

const issueTypes = {
  student: [
    { value: "course_access", label: "Course Access Issues" },
    { value: "payment", label: "Payment Related" },
    { value: "technical", label: "Technical Issues" },
    { value: "general", label: "General Query" },
  ],
  sales: [
    { value: "technical", label: "Technical Issues" },
    { value: "payment", label: "Course Payment Issues" },
    { value: "leads", label: "Lead Management" },
    { value: "system", label: "System Problems" },
    { value: "other", label: "Other" },
  ],
};

export function HelpSupportDialog({ variant = "student" }: HelpSupportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    issueType: "",
    subject: "",
    description: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.issueType || !formData.subject || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        subject: `[${formData.issueType.toUpperCase()}] ${formData.subject}`,
        description: formData.description,
        priority: formData.issueType === "payment" ? "high" : "medium",
      });

      if (error) throw error;

      toast({
        title: "Ticket Submitted",
        description: "Our support team will get back to you soon.",
      });
      setFormData({ issueType: "", subject: "", description: "" });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit ticket",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const types = issueTypes[variant];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          Help & Support
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Help & Support
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <a
            href="tel:+919876543210"
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
          >
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Call Us</p>
              <p className="text-xs text-muted-foreground">+91 98765 43210</p>
            </div>
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium">WhatsApp</p>
              <p className="text-xs text-muted-foreground">Quick Support</p>
            </div>
          </a>
        </div>

        {variant === "sales" && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 mb-4">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">For Payment Issues</p>
              <p className="text-xs text-muted-foreground">
                Select "Course Payment Issues" type and provide transaction details for faster resolution.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Issue Type</Label>
            <Select
              value={formData.issueType}
              onValueChange={(value) => setFormData({ ...formData, issueType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
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
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Provide detailed information about your issue..."
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
                Submit Ticket
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}