import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  UserCog,
  Building2,
  Calendar,
  ClipboardCheck,
  Headphones,
  GraduationCap,
  FileText,
  BarChart3,
  ChevronRight,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface BranchInfo {
  id: string;
  name: string;
  code: string;
  city: string;
}

interface Stats {
  totalStudents: number;
  totalEmployees: number;
  activeBatches: number;
  pendingPayments: number;
  pendingRequests: number;
  totalRevenue: number;
  salesCount: number;
  supportCount: number;
  teacherCount: number;
}

const BranchOverview = () => {
  const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalEmployees: 0,
    activeBatches: 0,
    pendingPayments: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    salesCount: 0,
    supportCount: 0,
    teacherCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!branchInfo?.id) return;

      try {
        // Fetch students count
        const { count: studentsCount } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("branch_id", branchInfo.id)
          .eq("is_active", true);

        // Fetch employees by department
        const { data: employees } = await supabase
          .from("employees")
          .select("department")
          .eq("branch_id", branchInfo.id)
          .eq("is_active", true);

        const salesCount = employees?.filter((e) => e.department === "sales").length || 0;
        const supportCount = employees?.filter((e) => e.department === "support").length || 0;
        const teacherCount = employees?.filter((e) => e.department === "teaching").length || 0;

        // Fetch active batches count
        const { count: batchesCount } = await supabase
          .from("batches")
          .select("*", { count: "exact", head: true })
          .eq("branch_id", branchInfo.id)
          .eq("is_active", true);

        // Fetch pending requests for this branch
        const { count: requestsCount } = await supabase
          .from("employee_requests")
          .select("*", { count: "exact", head: true })
          .eq("branch_id", branchInfo.id)
          .eq("status", "pending");

        setStats({
          totalStudents: studentsCount || 0,
          totalEmployees: employees?.length || 0,
          activeBatches: batchesCount || 0,
          pendingPayments: 0,
          pendingRequests: requestsCount || 0,
          totalRevenue: 0,
          salesCount,
          supportCount,
          teacherCount,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [branchInfo]);

  const sections = [
    {
      title: "Sales Department",
      description: "Manage sales team, leads & performance",
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      href: "/branch/sales",
      stats: `${stats.salesCount} agents`,
    },
    {
      title: "Support Department",
      description: "View tickets, agents & resolution stats",
      icon: Headphones,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/branch/support",
      stats: `${stats.supportCount} agents`,
    },
    {
      title: "Teachers",
      description: "Faculty management & schedules",
      icon: GraduationCap,
      color: "text-info",
      bg: "bg-info/10",
      href: "/branch/teachers",
      stats: `${stats.teacherCount} faculty`,
    },
    {
      title: "Students",
      description: "Student profiles, enrollments & reports",
      icon: Users,
      color: "text-warning",
      bg: "bg-warning/10",
      href: "/branch/students",
      stats: `${stats.totalStudents} students`,
    },
    {
      title: "Financial Dashboard",
      description: "Payments, revenue & fee reports",
      icon: CreditCard,
      color: "text-success",
      bg: "bg-success/10",
      href: "/branch/payments",
      stats: "View reports",
    },
    {
      title: "User Management",
      description: "Manage branch employees & roles",
      icon: UserCog,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/branch/users",
      stats: `${stats.totalEmployees} users`,
    },
    {
      title: "Requests",
      description: "Employee requests & approvals",
      icon: ClipboardCheck,
      color: "text-warning",
      bg: "bg-warning/10",
      href: "/branch/requests",
      stats: `${stats.pendingRequests} pending`,
    },
    {
      title: "Report Generation",
      description: "Generate & export branch reports",
      icon: FileText,
      color: "text-info",
      bg: "bg-info/10",
      href: "/branch/reports",
      stats: "Generate",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card-elevated p-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Welcome, Branch Admin
            </h1>
            <p className="text-muted-foreground">
              {branchInfo?.name} • {branchInfo?.city}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <UserCog className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeBatches}</p>
                <p className="text-sm text-muted-foreground">Active Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pendingRequests}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 8 Section Cards */}
      <div>
        <h2 className="font-heading text-lg font-semibold mb-4">Branch Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((section) => (
            <Card
              key={section.href}
              className="cursor-pointer hover:border-primary transition-all hover:shadow-lg group"
              onClick={() => navigate(section.href)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl ${section.bg} flex items-center justify-center`}>
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold mt-4">{section.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                <Badge variant="outline" className="mt-3">{section.stats}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance & Analytics Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => navigate("/branch/performance")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Performance Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              View overall branch performance metrics, KPIs, and predictive analytics.
            </p>
            <div className="flex items-center gap-2 mt-4 text-primary text-sm">
              <span>View Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => navigate("/branch/analytics")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-info" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              View detailed analytics, charts, and data visualizations for your branch.
            </p>
            <div className="flex items-center gap-2 mt-4 text-primary text-sm">
              <span>View Analytics</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-success" />
              <p className="text-sm text-muted-foreground">
                New student enrolled in Web Development batch
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <p className="text-sm text-muted-foreground">
                {stats.pendingRequests} leave requests pending approval
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <p className="text-sm text-muted-foreground">
                Payment received from Student
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BranchOverview;
