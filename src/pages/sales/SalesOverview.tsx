import { useState, useEffect } from "react";
import {
  Users,
  Target,
  Phone,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const SalesOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    contacted: 0,
    converted: 0,
    todayFollowups: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: leads, error } = await supabase
        .from("enrollment_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const allLeads = leads || [];
      setStats({
        totalLeads: allLeads.length,
        newLeads: allLeads.filter((l) => l.status === "new").length,
        contacted: allLeads.filter((l) => l.status === "contacted").length,
        converted: allLeads.filter((l) => l.status === "enrolled").length,
        todayFollowups: allLeads.filter((l) => l.status === "follow_up").length,
      });

      setRecentLeads(allLeads.slice(0, 5));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
      case "enrolled":
        return "bg-success/10 text-success";
      case "not_interested":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Welcome Back! 👋
        </h2>
        <p className="text-muted-foreground">
          Here's your sales performance overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalLeads}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.newLeads}</p>
              <p className="text-sm text-muted-foreground">New Leads</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.contacted}</p>
              <p className="text-sm text-muted-foreground">Contacted</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.converted}</p>
              <p className="text-sm text-muted-foreground">Enrolled</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.todayFollowups}</p>
              <p className="text-sm text-muted-foreground">Follow-ups</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Conversion Rate
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-success">
              {stats.totalLeads > 0
                ? Math.round((stats.converted / stats.totalLeads) * 100)
                : 0}
              %
            </div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats.totalLeads > 0
                        ? (stats.converted / stats.totalLeads) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {stats.converted} enrolled out of {stats.totalLeads} leads
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/sales/leads">
                <Users className="w-4 h-4 mr-2" />
                View Leads
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/sales/entry">
                <Target className="w-4 h-4 mr-2" />
                Add Lead
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/sales/followups">
                <Calendar className="w-4 h-4 mr-2" />
                Follow-ups
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/sales/kpi">
                <TrendingUp className="w-4 h-4 mr-2" />
                View KPIs
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold">Recent Leads</h3>
          <Button variant="ghost" size="sm" asChild>
            <a href="/sales/leads">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </a>
          </Button>
        </div>
        <div className="space-y-3">
          {recentLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {lead.student_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{lead.student_name}</p>
                  <p className="text-sm text-muted-foreground">{lead.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    lead.status
                  )}`}
                >
                  {lead.status.replace("_", " ")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(lead.created_at), "dd MMM")}
                </span>
              </div>
            </div>
          ))}
          {recentLeads.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No leads yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesOverview;
