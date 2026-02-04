import { useState, useEffect } from "react";
import {
  Calendar,
  Phone,
  PhoneCall,
  MessageSquare,
  CheckCircle,
  Clock,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Lead {
  id: string;
  student_name: string;
  email: string;
  phone: string;
  city: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const SalesFollowups = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    try {
      const { data, error } = await supabase
        .from("enrollment_leads")
        .select("*")
        .in("status", ["follow_up", "contacted", "new"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `Hi ${name}, I'm following up from Aspect Vision regarding your course inquiry. How can I assist you today?`
    );
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`, "_blank");
  };

  const handleMarkContacted = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from("enrollment_leads")
        .update({ status: "contacted" })
        .eq("id", leadId);

      if (error) throw error;
      toast({ title: "Success", description: "Lead marked as contacted" });
      fetchFollowups();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-info/10 text-info";
      case "contacted":
        return "bg-warning/10 text-warning";
      case "follow_up":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityLabel = (status: string) => {
    switch (status) {
      case "new":
        return "High Priority";
      case "follow_up":
        return "Needs Follow-up";
      case "contacted":
        return "Awaiting Response";
      default:
        return status;
    }
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
          <Calendar className="w-6 h-6 text-primary" />
          Follow-ups
        </h2>
        <p className="text-muted-foreground">
          Leads that need your attention
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4 border-l-4 border-l-info">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-info" />
            <div>
              <p className="text-2xl font-bold">
                {leads.filter((l) => l.status === "new").length}
              </p>
              <p className="text-sm text-muted-foreground">New (High Priority)</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {leads.filter((l) => l.status === "follow_up").length}
              </p>
              <p className="text-sm text-muted-foreground">Needs Follow-up</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4 border-l-4 border-l-warning">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-warning" />
            <div>
              <p className="text-2xl font-bold">
                {leads.filter((l) => l.status === "contacted").length}
              </p>
              <p className="text-sm text-muted-foreground">Awaiting Response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up List */}
      <div className="space-y-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className={`card-elevated p-5 border-l-4 ${
              lead.status === "new"
                ? "border-l-info"
                : lead.status === "follow_up"
                ? "border-l-primary"
                : "border-l-warning"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{lead.student_name}</h3>
                    <Badge className={getStatusColor(lead.status)}>
                      {getPriorityLabel(lead.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lead.phone} • {lead.email}
                  </p>
                  {lead.city && (
                    <p className="text-sm text-muted-foreground">{lead.city}</p>
                  )}
                  {lead.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{lead.notes}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Added {format(new Date(lead.created_at), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-success hover:bg-success/90"
                  onClick={() => handleCall(lead.phone)}
                >
                  <PhoneCall className="w-4 h-4 mr-1" />
                  Call Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-success border-success hover:bg-success/10"
                  onClick={() => handleWhatsApp(lead.phone, lead.student_name)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  WhatsApp
                </Button>
                {lead.status !== "contacted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkContacted(lead.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Contacted
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {leads.length === 0 && (
          <div className="card-elevated p-12 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              All Caught Up!
            </h3>
            <p className="text-muted-foreground">
              No pending follow-ups at the moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesFollowups;
