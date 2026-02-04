import { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

const statusColors: Record<string, string> = {
  open: "bg-warning/10 text-warning",
  in_progress: "bg-info/10 text-info",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

const SupportTickets = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .in("status", ["open", "in_progress"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToMe = async (ticket: TicketType) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({
          assigned_to: user?.id,
          status: "in_progress",
        })
        .eq("id", ticket.id);

      if (error) throw error;

      toast({ title: "Ticket Assigned", description: "You've been assigned to this ticket." });
      fetchTickets();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;

      toast({ title: "Status Updated", description: `Ticket marked as ${newStatus.replace("_", " ")}` });
      
      if (newStatus === "resolved" || newStatus === "closed") {
        setSelectedTicket(null);
      }
      
      fetchTickets();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    setActionLoading(true);
    try {
      // In a real app, you'd save this to a ticket_replies table
      // For now, we'll update the ticket description with the reply
      const updatedDescription = `${selectedTicket.description}\n\n---\n**Support Reply (${new Date().toLocaleString()}):**\n${replyText}`;

      const { error } = await supabase
        .from("support_tickets")
        .update({ description: updatedDescription })
        .eq("id", selectedTicket.id);

      if (error) throw error;

      toast({ title: "Reply Sent", description: "Your response has been sent to the user." });
      setReplyText("");
      setSelectedTicket(null);
      fetchTickets();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
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
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <Ticket className="w-6 h-6 text-primary" />
          Support Tickets
        </h2>
        <p className="text-muted-foreground">View and manage all open tickets</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="card-elevated p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                  <Badge className={statusColors[ticket.status]}>
                    {ticket.status.replace("_", " ")}
                  </Badge>
                  {ticket.assigned_to === user?.id && (
                    <Badge variant="outline">Assigned to you</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{ticket.subject}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {!ticket.assigned_to && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAssignToMe(ticket)}
                    disabled={actionLoading}
                  >
                    Assign to Me
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tickets found</p>
          </div>
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Ticket</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={priorityColors[selectedTicket.priority]}>
                    {selectedTicket.priority}
                  </Badge>
                  <Badge className={statusColors[selectedTicket.status]}>
                    {selectedTicket.status.replace("_", " ")}
                  </Badge>
                </div>
                <h4 className="font-semibold mb-2">{selectedTicket.subject}</h4>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedTicket.description}
                </div>
              </div>

              <div>
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleUpdateStatus(selectedTicket!.id, "resolved")}
                disabled={actionLoading}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Resolved
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleUpdateStatus(selectedTicket!.id, "closed")}
                disabled={actionLoading}
              >
                <X className="w-4 h-4 mr-1" />
                Close Ticket
              </Button>
            </div>
            <Button
              onClick={handleSendReply}
              disabled={actionLoading || !replyText.trim()}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTickets;