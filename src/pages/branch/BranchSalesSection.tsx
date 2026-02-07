import { useState, useEffect } from "react";
import {
  Users,
  Phone,
  TrendingUp,
  Calendar,
  Eye,
  ChevronRight,
  BarChart3,
  Target,
  MessageSquare,
  ArrowLeft,
  Globe,
  Clock,
  IndianRupee,
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
import { format, subDays, startOfMonth, endOfMonth, subMonths, isToday, isYesterday } from "date-fns";

interface BranchInfo {
  id: string;
  name: string;
}

interface SalesAgent {
  id: string;
  employee_id: string;
  user_id: string;
  designation: string | null;
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  };
}

interface Lead {
  id: string;
  student_name: string;
  email: string;
  phone: string;
  source: string | null;
  status: string;
  created_at: string;
  assigned_to: string | null;
}

interface BranchSalesSectionProps {
  branchInfo: BranchInfo | null;
}

const BranchSalesSection = ({ branchInfo }: BranchSalesSectionProps) => {
  const [view, setView] = useState<"overview" | "agents" | "agent-detail" | "leads" | "followups" | "kpi">("overview");
  const [salesAgents, setSalesAgents] = useState<SalesAgent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SalesAgent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [branchInfo]);

  const fetchData = async () => {
    if (!branchInfo?.id) return;

    try {
      // Fetch sales employees
      const { data: employees } = await supabase
        .from("employees")
        .select("*")
        .eq("branch_id", branchInfo.id)
        .eq("department", "sales")
        .eq("is_active", true);

      if (employees && employees.length > 0) {
        const userIds = employees.map((e) => e.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, phone, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
        const agentsWithProfiles = employees.map((e) => ({
          ...e,
          profile: profileMap.get(e.user_id),
        }));
        setSalesAgents(agentsWithProfiles);
      }

      // Fetch leads
      const { data: leadsData } = await supabase
        .from("enrollment_leads")
        .select("*")
        .order("created_at", { ascending: false });

      setLeads(leadsData || []);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const todayLeads = leads.filter((l) => isToday(new Date(l.created_at)));
  const yesterdayLeads = leads.filter((l) => isYesterday(new Date(l.created_at)));
  const thisMonthLeads = leads.filter((l) => {
    const date = new Date(l.created_at);
    return date >= startOfMonth(new Date()) && date <= endOfMonth(new Date());
  });

  const todayFollowups = leads.filter((l) => l.status === "follow_up" && isToday(new Date(l.created_at)));
  const yesterdayFollowups = leads.filter((l) => l.status === "follow_up" && isYesterday(new Date(l.created_at)));
  const monthlyFollowups = leads.filter((l) => {
    const date = new Date(l.created_at);
    return l.status === "follow_up" && date >= startOfMonth(new Date()) && date <= endOfMonth(new Date());
  });

  const convertedLeads = leads.filter((l) => l.status === "converted");
  const todaySales = convertedLeads.filter((l) => isToday(new Date(l.created_at)));
  const yesterdaySales = convertedLeads.filter((l) => isYesterday(new Date(l.created_at)));
  const monthlySales = convertedLeads.filter((l) => {
    const date = new Date(l.created_at);
    return date >= startOfMonth(new Date()) && date <= endOfMonth(new Date());
  });

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
                <p className="text-2xl font-bold">{salesAgents.length}</p>
                <p className="text-sm text-muted-foreground">Total Sales Agents</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-primary">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setView("leads")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayLeads.length}</p>
                <p className="text-sm text-muted-foreground">Today's Leads</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-primary">
              <span>View Data</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setView("followups")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayFollowups.length}</p>
                <p className="text-sm text-muted-foreground">Today's Follow-ups</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-primary">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setView("kpi")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{monthlySales.length}</p>
                <p className="text-sm text-muted-foreground">Monthly Conversions</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-primary">
              <span>KPI Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-success" />
              Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Today's Sales</span>
                <Badge variant="outline">{todaySales.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Yesterday's Sales</span>
                <Badge variant="outline">{yesterdaySales.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Monthly Sales</span>
                <Badge>{monthlySales.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Website Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Today from Website</span>
                <Badge variant="outline">{leads.filter((l) => l.source === "website" && isToday(new Date(l.created_at))).length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Yesterday from Website</span>
                <Badge variant="outline">{leads.filter((l) => l.source === "website" && isYesterday(new Date(l.created_at))).length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Monthly from Website</span>
                <Badge>{leads.filter((l) => l.source === "website" && new Date(l.created_at) >= startOfMonth(new Date())).length}</Badge>
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
            Sales Agents ({salesAgents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Leads Assigned</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesAgents.map((agent) => (
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
                        <p className="text-xs text-muted-foreground">{agent.designation || "Sales Executive"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{agent.employee_id}</Badge>
                  </TableCell>
                  <TableCell>
                    {agent.profile?.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3" />
                        {agent.profile.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge>{leads.filter((l) => l.assigned_to === agent.user_id).length}</Badge>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgentDetail = () => {
    if (!selectedAgent) return null;
    const agentLeads = leads.filter((l) => l.assigned_to === selectedAgent.user_id);
    const agentTodayLeads = agentLeads.filter((l) => isToday(new Date(l.created_at)));
    const agentYesterdayLeads = agentLeads.filter((l) => isYesterday(new Date(l.created_at)));
    const agentMonthlyLeads = agentLeads.filter((l) => new Date(l.created_at) >= startOfMonth(new Date()));
    const websiteLeads = agentLeads.filter((l) => l.source === "website");

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
                <p className="text-muted-foreground">{selectedAgent.designation || "Sales Executive"}</p>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="outline">{selectedAgent.employee_id}</Badge>
                  {selectedAgent.profile?.phone && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {selectedAgent.profile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Globe className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{websiteLeads.length}</p>
                <p className="text-xs text-muted-foreground">Website Leads</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold">{agentTodayLeads.length}</p>
                <p className="text-xs text-muted-foreground">Today's Leads</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold">{agentYesterdayLeads.length}</p>
                <p className="text-xs text-muted-foreground">Yesterday's Leads</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-info" />
                <p className="text-2xl font-bold">{agentMonthlyLeads.length}</p>
                <p className="text-xs text-muted-foreground">Monthly Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentLeads.slice(0, 10).map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.student_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{lead.source || "unknown"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={lead.status === "converted" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(lead.created_at), "MMM d, yyyy")}
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

  const renderLeadsView = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setView("overview")} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Overview
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="text-3xl font-bold">{todayLeads.length}</p>
              <p className="text-sm text-muted-foreground">Today's Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
              <p className="text-3xl font-bold">{yesterdayLeads.length}</p>
              <p className="text-sm text-muted-foreground">Yesterday's Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{thisMonthLeads.length}</p>
              <p className="text-sm text-muted-foreground">Monthly Leads</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.slice(0, 20).map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.student_name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{lead.email}</p>
                      <p className="text-muted-foreground">{lead.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{lead.source || "unknown"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={lead.status === "converted" ? "bg-success/10 text-success" : lead.status === "new" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(lead.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderFollowups = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setView("overview")} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Overview
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="text-3xl font-bold">{todayFollowups.length}</p>
              <p className="text-sm text-muted-foreground">Today's Follow-ups</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
              <p className="text-3xl font-bold">{yesterdayFollowups.length}</p>
              <p className="text-sm text-muted-foreground">Yesterday's Follow-ups</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{monthlyFollowups.length}</p>
              <p className="text-sm text-muted-foreground">Monthly Follow-ups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Follow-up Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.filter((l) => l.status === "follow_up").slice(0, 20).map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.student_name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{lead.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{lead.source || "unknown"}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(lead.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${lead.phone}`}>
                        <Phone className="w-3 h-3 mr-1" /> Call
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderKPIDashboard = () => {
    const conversionRate = leads.length > 0 ? ((convertedLeads.length / leads.length) * 100).toFixed(1) : 0;

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
                <p className="text-3xl font-bold">{leads.length}</p>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
                <p className="text-3xl font-bold">{convertedLeads.length}</p>
                <p className="text-sm text-muted-foreground">Converted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-info" />
                <p className="text-3xl font-bold">{conversionRate}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-warning" />
                <p className="text-3xl font-bold">{salesAgents.length}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Total Leads</TableHead>
                  <TableHead>Converted</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                  <TableHead>Predicted Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesAgents.map((agent) => {
                  const agentLeads = leads.filter((l) => l.assigned_to === agent.user_id);
                  const agentConverted = agentLeads.filter((l) => l.status === "converted");
                  const rate = agentLeads.length > 0 ? ((agentConverted.length / agentLeads.length) * 100).toFixed(1) : 0;
                  const performance = Number(rate) >= 30 ? "Excellent" : Number(rate) >= 20 ? "Good" : Number(rate) >= 10 ? "Average" : "Needs Improvement";

                  return (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.profile?.full_name}</TableCell>
                      <TableCell>{agentLeads.length}</TableCell>
                      <TableCell>{agentConverted.length}</TableCell>
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
      {view === "leads" && renderLeadsView()}
      {view === "followups" && renderFollowups()}
      {view === "kpi" && renderKPIDashboard()}
    </div>
  );
};

export default BranchSalesSection;
