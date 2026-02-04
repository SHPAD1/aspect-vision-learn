import { useState, useEffect } from "react";
import { CheckCircle, Search, Clock, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface TicketType {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

const SupportResolved = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .in("status", ["resolved", "closed"])
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())
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
          <CheckCircle className="w-6 h-6 text-success" />
          Resolved Tickets
        </h2>
        <p className="text-muted-foreground">View all resolved and closed tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "resolved").length}
              </p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "closed").length}
              </p>
              <p className="text-sm text-muted-foreground">Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search resolved tickets..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="card-elevated p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                  <Badge className="bg-success/10 text-success">{ticket.status}</Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{ticket.subject}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Resolved: {new Date(ticket.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedTicket(ticket)}>
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </div>
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No resolved tickets found</p>
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={priorityColors[selectedTicket.priority]}>
                  {selectedTicket.priority}
                </Badge>
                <Badge className="bg-success/10 text-success">{selectedTicket.status}</Badge>
              </div>
              <h4 className="font-semibold text-lg">{selectedTicket.subject}</h4>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm whitespace-pre-wrap">{selectedTicket.description}</div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Created: {new Date(selectedTicket.created_at).toLocaleString()}</span>
                <span>Resolved: {new Date(selectedTicket.updated_at).toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportResolved;