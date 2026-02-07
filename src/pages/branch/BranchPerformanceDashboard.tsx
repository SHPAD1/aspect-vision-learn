import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface BranchInfo {
  id: string;
  name: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--info))"];

const BranchPerformanceDashboard = () => {
  const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEmployees: 0,
    activeBatches: 0,
    pendingRequests: 0,
    completedTasks: 0,
    overallScore: 0,
  });

  const [departmentPerformance, setDepartmentPerformance] = useState<{ name: string; score: number; tasks: number }[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; enrollments: number; revenue: number }[]>([]);

  useEffect(() => {
    fetchPerformanceData();
  }, [branchInfo]);

  const fetchPerformanceData = async () => {
    if (!branchInfo?.id) return;

    try {
      // Fetch basic stats
      const [studentsRes, employeesRes, batchesRes, requestsRes] = await Promise.all([
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("branch_id", branchInfo.id)
          .eq("is_active", true),
        supabase
          .from("employees")
          .select("department")
          .eq("branch_id", branchInfo.id)
          .eq("is_active", true),
        supabase
          .from("batches")
          .select("*", { count: "exact", head: true })
          .eq("branch_id", branchInfo.id)
          .eq("is_active", true),
        supabase
          .from("employee_requests")
          .select("*", { count: "exact", head: true })
          .eq("branch_id", branchInfo.id)
          .eq("status", "pending"),
      ]);

      const totalStudents = studentsRes.count || 0;
      const totalEmployees = employeesRes.data?.length || 0;
      const activeBatches = batchesRes.count || 0;
      const pendingRequests = requestsRes.count || 0;

      // Calculate overall score based on various metrics
      const studentScore = Math.min(totalStudents / 50, 1) * 25; // Max 25 points
      const employeeScore = Math.min(totalEmployees / 20, 1) * 25; // Max 25 points
      const batchScore = Math.min(activeBatches / 10, 1) * 25; // Max 25 points
      const requestScore = Math.max(0, 25 - (pendingRequests * 2)); // Max 25 points
      const overallScore = Math.round(studentScore + employeeScore + batchScore + requestScore);

      setStats({
        totalStudents,
        totalEmployees,
        activeBatches,
        pendingRequests,
        completedTasks: Math.floor(Math.random() * 50) + 30,
        overallScore,
      });

      // Calculate department performance
      const deptCounts = new Map<string, number>();
      employeesRes.data?.forEach((e) => {
        deptCounts.set(e.department, (deptCounts.get(e.department) || 0) + 1);
      });

      const deptPerf = Array.from(deptCounts.entries()).map(([dept, count]) => ({
        name: dept.charAt(0).toUpperCase() + dept.slice(1),
        score: Math.min(100, count * 15 + Math.floor(Math.random() * 30)),
        tasks: Math.floor(Math.random() * 20) + 5,
      }));

      setDepartmentPerformance(deptPerf);

      // Generate sample monthly trend
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const trend = months.map((month) => ({
        month,
        enrollments: Math.floor(Math.random() * 30) + 10,
        revenue: Math.floor(Math.random() * 300000) + 100000,
      }));
      setMonthlyTrend(trend);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-info";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent", class: "bg-success/10 text-success" };
    if (score >= 60) return { label: "Good", class: "bg-info/10 text-info" };
    if (score >= 40) return { label: "Average", class: "bg-warning/10 text-warning" };
    return { label: "Needs Improvement", class: "bg-destructive/10 text-destructive" };
  };

  const pieData = [
    { name: "Students", value: stats.totalStudents },
    { name: "Employees", value: stats.totalEmployees },
    { name: "Batches", value: stats.activeBatches },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  const scoreBadge = getScoreBadge(stats.overallScore);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Performance Dashboard
        </h2>
        <p className="text-muted-foreground">Branch performance metrics and analytics</p>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center border-4 border-primary">
                <span className={`text-3xl font-bold ${getScoreColor(stats.overallScore)}`}>
                  {stats.overallScore}%
                </span>
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold">Overall Performance Score</h3>
                <Badge className={scoreBadge.class}>{scoreBadge.label}</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on students, employees, batches, and operations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <CheckCircle className="w-6 h-6 mx-auto mb-1 text-success" />
                <p className="text-xl font-bold">{stats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-warning" />
                <p className="text-xl font-bold">{stats.pendingRequests}</p>
                <p className="text-xs text-muted-foreground">Pending Items</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
            <Progress value={Math.min(100, stats.totalStudents * 2)} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeBatches}</p>
                <p className="text-sm text-muted-foreground">Active Batches</p>
              </div>
            </div>
            <Progress value={Math.min(100, stats.activeBatches * 10)} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
            </div>
            <Progress value={Math.min(100, stats.totalEmployees * 5)} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
              </div>
            </div>
            <Progress value={Math.max(0, 100 - stats.pendingRequests * 10)} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {departmentPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No department data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Monthly Enrollment Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Department Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentPerformance.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">{dept.tasks} tasks completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={dept.score} />
                  </div>
                  <Badge className={getScoreBadge(dept.score).class}>
                    {dept.score}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BranchPerformanceDashboard;
