import { useState, useEffect, useRef } from "react";
import {
  Ticket,
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  Loader2,
  Send,
  X,
  User,
  Building2,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TicketType {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  department: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    email: string;
  };
  user_role?: string;
}

interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_support_reply: boolean;
  created_at: string;
  profile?: {
    full_name: string;
  };
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
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket]);

  useEffect(() => {
    // Scroll to bottom when replies change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [replies]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .in("status", ["open", "in_progress"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each ticket
      const ticketsWithProfiles = await Promise.all(
        (data || []).map(async (ticket) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", ticket.user_id)
            .single();

          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", ticket.user_id)
            .single();

          return {
            ...ticket,
            profile: profile || undefined,
            user_role: roleData?.role || "Unknown",
          };
        })
      );

      setTickets(ticketsWithProfiles);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (ticketId: string) => {
    setRepliesLoading(true);
    try {
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for each reply
      const repliesWithProfiles = await Promise.all(
        (data || []).map(async (reply) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", reply.user_id)
            .single();

          return {
            ...reply,
            profile: profile || undefined,
          };
        })
      );

      setReplies(repliesWithProfiles);
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setRepliesLoading(false);
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
      const { error } = await supabase.from("ticket_replies").insert({
        ticket_id: selectedTicket.id,
        user_id: user?.id,
        message: replyText.trim(),
        is_support_reply: true,
      });

      if (error) throw error;

      toast({ title: "Reply Sent", description: "Your response has been sent." });
      setReplyText("");
      fetchReplies(selectedTicket.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.profile?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
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
            placeholder="Search by subject or name..."
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
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{ticket.profile?.full_name || "Unknown User"}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {ticket.user_role?.replace("_", " ").toUpperCase()}
                      </Badge>
                      {ticket.department && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {ticket.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

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
                    {format(new Date(ticket.created_at), "MMM dd, yyyy hh:mm a")}
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
                <Button size="sm" onClick={() => setSelectedTicket(ticket)}>
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Chat
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

      {/* Chat Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Support Chat
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Ticket Info */}
              <div className="p-3 rounded-lg bg-muted/50 mb-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={priorityColors[selectedTicket.priority]}>
                    {selectedTicket.priority}
                  </Badge>
                  <Badge className={statusColors[selectedTicket.status]}>
                    {selectedTicket.status.replace("_", " ")}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm">{selectedTicket.subject}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  From: {selectedTicket.profile?.full_name} ({selectedTicket.user_role})
                </p>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 px-1" ref={scrollRef}>
                <div className="space-y-4">
                  {/* Initial Ticket Description */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {selectedTicket.profile?.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(selectedTicket.created_at), "MMM dd, hh:mm a")}
                        </span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm">
                        {selectedTicket.description}
                      </div>
                    </div>
                  </div>

                  {repliesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`flex gap-3 ${reply.is_support_reply ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            reply.is_support_reply ? "bg-primary" : "bg-primary/10"
                          }`}
                        >
                          <User
                            className={`w-4 h-4 ${
                              reply.is_support_reply ? "text-primary-foreground" : "text-primary"
                            }`}
                          />
                        </div>
                        <div className={`flex-1 ${reply.is_support_reply ? "text-right" : ""}`}>
                          <div
                            className={`flex items-center gap-2 mb-1 ${
                              reply.is_support_reply ? "justify-end" : ""
                            }`}
                          >
                            <span className="font-medium text-sm">
                              {reply.profile?.full_name || "Support"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(reply.created_at), "MMM dd, hh:mm a")}
                            </span>
                          </div>
                          <div
                            className={`rounded-lg p-3 text-sm inline-block max-w-[80%] ${
                              reply.is_support_reply
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50"
                            }`}
                          >
                            {reply.message}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Reply Input */}
              <div className="flex gap-2 mt-4 flex-shrink-0">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <Button
                  onClick={handleSendReply}
                  disabled={actionLoading || !replyText.trim()}
                  className="self-end"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex-shrink-0 flex-col sm:flex-row gap-2">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTickets;
