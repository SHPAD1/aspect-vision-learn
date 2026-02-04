import { useState, useEffect } from "react";
import { Ticket, Clock, CheckCircle, AlertCircle, TrendingUp, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
}

const SupportOverview = () => {
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
  });
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: tickets, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ticketData = tickets || [];
      
      setStats({
        total: ticketData.length,
        open: ticketData.filter((t) => t.status === "open").length,
        inProgress: ticketData.filter((t) => t.status === "in_progress").length,
        resolved: ticketData.filter((t) => t.status === "resolved" || t.status === "closed").length,
        highPriority: ticketData.filter((t) => t.priority === "high" || t.priority === "urgent").length,
      });

      setRecentTickets(ticketData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-warning/10 text-warning";
      case "in_progress":
        return "bg-info/10 text-info";
      case "resolved":
      case "closed":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive";
      case "high":
        return "bg-warning/10 text-warning";
      case "medium":
        return "bg-info/10 text-info";
      default:
        return "bg-muted text-muted-foreground";
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
        <h2 className="font-heading text-2xl font-bold text-foreground">Welcome Back!</h2>
        <p className="text-muted-foreground">Here's your support overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.open}</p>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.highPriority}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card-elevated p-6">
        <h3 className="font-heading text-lg font-semibold mb-4">Recent Tickets</h3>
        
        {recentTickets.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tickets yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{ticket.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold mb-2">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Respond to high-priority tickets first
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Update ticket status as you work on them
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Add detailed notes for future reference
            </li>
          </ul>
        </div>

        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold mb-2">Today's Goal</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Tickets Resolved</span>
                <span className="font-medium">{stats.resolved} / {stats.total}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportOverview;