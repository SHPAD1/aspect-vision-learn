import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Headphones,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  ChevronRight,
  ArrowLeft,
  Target,
  Calendar,
  BarChart3,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isYesterday, startOfMonth, endOfMonth } from "date-fns";

interface BranchInfo {
  id: string;
  name: string;
}

interface SupportAgent {
  id: string;
  employee_id: string;
  user_id: string;
  designation: string | null;
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_at: string;
  user_id: string;
}

const BranchSupportSection = () => {
  const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
  const [view, setView] = useState<"overview" | "agents" | "agent-detail" | "tickets" | "performance">("overview");
  const [supportAgents, setSupportAgents] = useState<SupportAgent[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SupportAgent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [branchInfo]);

  const fetchData = async () => {
    if (!branchInfo?.id) return;

    try {
      // Fetch support employees
      const { data: employees } = await supabase
        .from("employees")
        .select("*")
        .eq("branch_id", branchInfo.id)
        .eq("department", "support")
        .eq("is_active", true);

      if (employees && employees.length > 0) {
        const userIds = employees.map((e) => e.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, phone")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
        const agentsWithProfiles = employees.map((e) => ({
          ...e,
          profile: profileMap.get(e.user_id),
        }));
        setSupportAgents(agentsWithProfiles);
      }

      // Fetch tickets
      const { data: ticketsData } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      setTickets(ticketsData || []);
    } catch (error) {
      console.error("Error fetching support data:", error);
    } finally {
      setLoading(false);
    }
  };

  const todayTickets = tickets.filter((t) => isToday(new Date(t.created_at)));
  const yesterdayTickets = tickets.filter((t) => isYesterday(new Date(t.created_at)));
  const monthlyTickets = tickets.filter((t) => {
    const date = new Date(t.created_at);
    return date >= startOfMonth(new Date()) && date <= endOfMonth(new Date());
  });

  const openTickets = tickets.filter((t) => t.status === "open");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved");
  const pendingTickets = tickets.filter((t) => t.status === "in_progress");

  const todayResolved = resolvedTickets.filter((t) => isToday(new Date(t.created_at)));
  const yesterdayResolved = resolvedTickets.filter((t) => isYesterday(new Date(t.created_at)));
  const monthlyResolved = resolvedTickets.filter((t) => new Date(t.created_at) >= startOfMonth(new Date()));

  const todayPending = pendingTickets.filter((t) => isToday(new Date(t.created_at)));
  const yesterdayPending = pendingTickets.filter((t) => isYesterday(new Date(t.created_at)));
  const monthlyPending = pendingTickets.filter((t) => new Date(t.created_at) >= startOfMonth(new Date()));

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setView("agents")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{supportAgents.length}</p>
                <p className="text-sm text-muted-foreground">Support Users</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-primary">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setView("tickets")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayTickets.length}</p>
                <p className="text-sm text-muted-foreground">Today's Tickets</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-primary">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedTickets.length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setView("performance")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openTickets.length}</p>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-primary">
              <span>Performance</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              Ticket Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Today's Tickets</span>
                <Badge variant="outline">{todayTickets.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Yesterday's Tickets</span>
                <Badge variant="outline">{yesterdayTickets.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Monthly Tickets</span>
                <Badge>{monthlyTickets.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Resolution Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-success/5">
                <span className="text-sm text-muted-foreground">Today Resolved</span>
                <Badge className="bg-success/10 text-success">{todayResolved.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-warning/5">
                <span className="text-sm text-muted-foreground">Today Pending</span>
                <Badge className="bg-warning/10 text-warning">{todayPending.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Monthly Resolved</span>
                <Badge>{monthlyResolved.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAgentsList = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setView("overview")} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Overview
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Support Agents ({supportAgents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Assigned Tickets</TableHead>
                <TableHead>Resolved</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supportAgents.map((agent) => {
                const agentTickets = tickets.filter((t) => t.assigned_to === agent.user_id);
                const agentResolved = agentTickets.filter((t) => t.status === "resolved");

                return (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {agent.profile?.full_name?.charAt(0) || "S"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{agent.profile?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{agent.designation || "Support Executive"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{agent.employee_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{agentTickets.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-success/10 text-success">{agentResolved.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setView("agent-detail");
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgentDetail = () => {
    if (!selectedAgent) return null;
    const agentTickets = tickets.filter((t) => t.assigned_to === selectedAgent.user_id);
    const agentTodayTickets = agentTickets.filter((t) => isToday(new Date(t.created_at)));
    const agentResolved = agentTickets.filter((t) => t.status === "resolved");
    const agentPending = agentTickets.filter((t) => t.status === "in_progress" || t.status === "open");

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setView("agents")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Agents
        </Button>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {selectedAgent.profile?.full_name?.charAt(0) || "S"}
                </span>
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold">{selectedAgent.profile?.full_name}</h3>
                <p className="text-muted-foreground">{selectedAgent.designation || "Support Executive"}</p>
                <Badge variant="outline" className="mt-1">{selectedAgent.employee_id}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Headphones className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{agentTickets.length}</p>
                <p className="text-xs text-muted-foreground">Total Tickets</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold">{agentTodayTickets.length}</p>
                <p className="text-xs text-muted-foreground">Today's Tickets</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10 text-center">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold">{agentResolved.length}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 text-center">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold">{agentPending.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentTickets.slice(0, 10).map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        ticket.status === "resolved" ? "bg-success/10 text-success" :
                        ticket.status === "open" ? "bg-warning/10 text-warning" :
                        "bg-info/10 text-info"
                      }>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(ticket.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTicketsView = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setView("overview")} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Overview
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{todayTickets.length}</p>
              <p className="text-sm text-muted-foreground">Today's Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
              <p className="text-3xl font-bold">{yesterdayTickets.length}</p>
              <p className="text-sm text-muted-foreground">Yesterday's Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="text-3xl font-bold">{monthlyTickets.length}</p>
              <p className="text-sm text-muted-foreground">Monthly Tickets</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.slice(0, 20).map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{ticket.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      ticket.status === "resolved" ? "bg-success/10 text-success" :
                      ticket.status === "open" ? "bg-warning/10 text-warning" :
                      "bg-info/10 text-info"
                    }>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ticket.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformance = () => {
    const resolutionRate = tickets.length > 0 ? ((resolvedTickets.length / tickets.length) * 100).toFixed(1) : 0;

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setView("overview")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{tickets.length}</p>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
                <p className="text-3xl font-bold">{resolvedTickets.length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-info" />
                <p className="text-3xl font-bold">{resolutionRate}%</p>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-warning" />
                <p className="text-3xl font-bold">{supportAgents.length}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Performance & Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Total Tickets</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead>Resolution Rate</TableHead>
                  <TableHead>Predicted Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportAgents.map((agent) => {
                  const agentTickets = tickets.filter((t) => t.assigned_to === agent.user_id);
                  const agentResolved = agentTickets.filter((t) => t.status === "resolved");
                  const rate = agentTickets.length > 0 ? ((agentResolved.length / agentTickets.length) * 100).toFixed(1) : 0;
                  const performance = Number(rate) >= 80 ? "Excellent" : Number(rate) >= 60 ? "Good" : Number(rate) >= 40 ? "Average" : "Needs Improvement";

                  return (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.profile?.full_name}</TableCell>
                      <TableCell>{agentTickets.length}</TableCell>
                      <TableCell>{agentResolved.length}</TableCell>
                      <TableCell>{rate}%</TableCell>
                      <TableCell>
                        <Badge className={
                          performance === "Excellent" ? "bg-success/10 text-success" :
                          performance === "Good" ? "bg-info/10 text-info" :
                          performance === "Average" ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        }>
                          {performance}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div>
      {view === "overview" && renderOverview()}
      {view === "agents" && renderAgentsList()}
      {view === "agent-detail" && renderAgentDetail()}
      {view === "tickets" && renderTicketsView()}
      {view === "performance" && renderPerformance()}
    </div>
  );
};

export default BranchSupportSection;
