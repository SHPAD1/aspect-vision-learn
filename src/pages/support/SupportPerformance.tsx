import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Clock, CheckCircle, Ticket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface PerformanceData {
  totalTickets: number;
  resolvedTickets: number;
  averageResponseTime: string;
  resolutionRate: number;
  ticketsByStatus: { name: string; value: number }[];
  ticketsByPriority: { name: string; value: number }[];
  weeklyResolved: { day: string; count: number }[];
}

const COLORS = ["hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--muted))"];

const SupportPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceData>({
    totalTickets: 0,
    resolvedTickets: 0,
    averageResponseTime: "N/A",
    resolutionRate: 0,
    ticketsByStatus: [],
    ticketsByPriority: [],
    weeklyResolved: [],
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const { data: tickets, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ticketData = tickets || [];
      const resolved = ticketData.filter(
        (t) => t.status === "resolved" || t.status === "closed"
      );

      // Status distribution
      const statusCounts: Record<string, number> = {};
      ticketData.forEach((t) => {
        statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      });

      // Priority distribution
      const priorityCounts: Record<string, number> = {};
      ticketData.forEach((t) => {
        priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
      });

      // Weekly resolved (last 7 days)
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyData = days.map((day) => ({ day, count: 0 }));
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      resolved
        .filter((t) => new Date(t.updated_at) >= oneWeekAgo)
        .forEach((t) => {
          const dayIndex = new Date(t.updated_at).getDay();
          weeklyData[dayIndex].count++;
        });

      setData({
        totalTickets: ticketData.length,
        resolvedTickets: resolved.length,
        averageResponseTime: "< 2 hours",
        resolutionRate: ticketData.length > 0 
          ? Math.round((resolved.length / ticketData.length) * 100)
          : 0,
        ticketsByStatus: Object.entries(statusCounts).map(([name, value]) => ({
          name: name.replace("_", " "),
          value,
        })),
        ticketsByPriority: Object.entries(priorityCounts).map(([name, value]) => ({
          name,
          value,
        })),
        weeklyResolved: weeklyData,
      });
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
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
          <BarChart3 className="w-6 h-6 text-primary" />
          Performance Report
        </h2>
        <p className="text-muted-foreground">Your support performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.totalTickets}</p>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.resolvedTickets}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.averageResponseTime}</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.resolutionRate}%</p>
              <p className="text-sm text-muted-foreground">Resolution Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Resolved Chart */}
        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">Weekly Resolved Tickets</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyResolved}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">Tickets by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.ticketsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.ticketsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card-elevated p-6 lg:col-span-2">
          <h3 className="font-heading text-lg font-semibold mb-4">Tickets by Priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ticketsByPriority} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--info))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="card-elevated p-6">
        <h3 className="font-heading text-lg font-semibold mb-4">Performance Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <CheckCircle className="w-6 h-6 text-success mb-2" />
            <h4 className="font-medium mb-1">Quick Response</h4>
            <p className="text-sm text-muted-foreground">
              Respond to tickets within 2 hours for best satisfaction scores.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-info/5 border border-info/20">
            <TrendingUp className="w-6 h-6 text-info mb-2" />
            <h4 className="font-medium mb-1">Prioritize High</h4>
            <p className="text-sm text-muted-foreground">
              Focus on high and urgent priority tickets first.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
            <Clock className="w-6 h-6 text-warning mb-2" />
            <h4 className="font-medium mb-1">Follow Up</h4>
            <p className="text-sm text-muted-foreground">
              Follow up on pending tickets to ensure resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPerformance;