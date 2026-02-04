import { useState, useEffect } from "react";
import {
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  Phone,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
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
  LineChart,
  Line,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

const SalesKPI = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    converted: 0,
    contacted: 0,
    newLeads: 0,
    conversionRate: 0,
    dailyTarget: 10,
    todayContacted: 0,
  });
  const [statusData, setStatusData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      const { data: leads, error } = await supabase
        .from("enrollment_leads")
        .select("*");

      if (error) throw error;

      const allLeads = leads || [];
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);

      const todayLeads = allLeads.filter((l) => {
        const created = new Date(l.created_at);
        return created >= todayStart && created <= todayEnd;
      });

      const converted = allLeads.filter((l) => l.status === "enrolled").length;
      const conversionRate =
        allLeads.length > 0 ? (converted / allLeads.length) * 100 : 0;

      setStats({
        totalLeads: allLeads.length,
        converted,
        contacted: allLeads.filter((l) => l.status === "contacted").length,
        newLeads: allLeads.filter((l) => l.status === "new").length,
        conversionRate: Math.round(conversionRate),
        dailyTarget: 10,
        todayContacted: todayLeads.filter(
          (l) => l.status === "contacted" || l.status === "enrolled"
        ).length,
      });

      // Status breakdown for pie chart
      const statusCounts = [
        { name: "New", value: allLeads.filter((l) => l.status === "new").length },
        {
          name: "Contacted",
          value: allLeads.filter((l) => l.status === "contacted").length,
        },
        {
          name: "Follow Up",
          value: allLeads.filter((l) => l.status === "follow_up").length,
        },
        {
          name: "Enrolled",
          value: allLeads.filter((l) => l.status === "enrolled").length,
        },
        {
          name: "Not Interested",
          value: allLeads.filter((l) => l.status === "not_interested").length,
        },
      ].filter((s) => s.value > 0);

      setStatusData(statusCounts);

      // Weekly data for bar chart
      const weekly = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        const dayLeads = allLeads.filter((l) => {
          const created = new Date(l.created_at);
          return created >= dayStart && created <= dayEnd;
        });
        weekly.push({
          day: format(date, "EEE"),
          leads: dayLeads.length,
          enrolled: dayLeads.filter((l) => l.status === "enrolled").length,
        });
      }
      setWeeklyData(weekly);
    } catch (error) {
      console.error("Error fetching KPI data:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e", "#ef4444"];

  const dailyProgress = Math.min(
    (stats.todayContacted / stats.dailyTarget) * 100,
    100
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          KPI Dashboard
        </h2>
        <p className="text-muted-foreground">Track your sales performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-3xl font-bold">{stats.totalLeads}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl font-bold text-success">
                {stats.conversionRate}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Enrolled</p>
              <p className="text-3xl font-bold text-success">
                {stats.converted}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-warning">
                {stats.newLeads + stats.contacted}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Phone className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Target */}
      <div className="card-elevated p-6">
        <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Today's Progress
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Leads Contacted Today
            </span>
            <span className="font-bold">
              {stats.todayContacted} / {stats.dailyTarget}
            </span>
          </div>
          <Progress value={dailyProgress} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {dailyProgress >= 100
              ? "🎉 Daily target achieved!"
              : `${stats.dailyTarget - stats.todayContacted} more to reach your target`}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">
            Weekly Leads
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="leads" fill="hsl(var(--primary))" name="Total Leads" />
              <Bar dataKey="enrolled" fill="hsl(var(--success))" name="Enrolled" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">
            Lead Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesKPI;
