import { useState, useEffect } from "react";
import {
  Users,
  CreditCard,
  TrendingUp,
  Building2,
  UserPlus,
  IndianRupee,
  GraduationCap,
  Calendar,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalStudents: number;
  todayEnrollments: number;
  totalPayments: number;
  todayCollection: number;
  totalEmployees: number;
  totalBranches: number;
  totalBatches: number;
  activeBatches: number;
}

interface RecentActivity {
  type: "payment" | "enrollment" | "lead";
  message: string;
  subMessage: string;
  time: string;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    todayEnrollments: 0,
    totalPayments: 0,
    todayCollection: 0,
    totalEmployees: 0,
    totalBranches: 0,
    totalBatches: 0,
    activeBatches: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // Fetch all stats in parallel
      const [
        studentsRes,
        todayStudentsRes,
        paymentsRes,
        todayPaymentsRes,
        employeesRes,
        branchesRes,
        batchesRes,
        activeBatchesRes,
        recentLeadsRes,
      ] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .gte("enrollment_date", today),
        supabase.from("payments").select("amount").eq("status", "completed"),
        supabase
          .from("payments")
          .select("amount")
          .eq("status", "completed")
          .gte("payment_date", today),
        supabase.from("employees").select("id", { count: "exact", head: true }),
        supabase.from("branches").select("id", { count: "exact", head: true }),
        supabase.from("batches").select("id", { count: "exact", head: true }),
        supabase
          .from("batches")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("enrollment_leads")
          .select("student_name, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const totalPayments =
        paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const todayCollection =
        todayPaymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) ||
        0;

      setStats({
        totalStudents: studentsRes.count || 0,
        todayEnrollments: todayStudentsRes.count || 0,
        totalPayments,
        todayCollection,
        totalEmployees: employeesRes.count || 0,
        totalBranches: branchesRes.count || 0,
        totalBatches: batchesRes.count || 0,
        activeBatches: activeBatchesRes.count || 0,
      });

      // Create recent activities from leads
      const activities: RecentActivity[] = (recentLeadsRes.data || []).map(
        (lead) => ({
          type: "lead" as const,
          message: `New inquiry from ${lead.student_name}`,
          subMessage: "Enrollment lead",
          time: format(new Date(lead.created_at), "HH:mm"),
        })
      );
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      color: "bg-primary/10 text-primary",
      subValue: `+${stats.todayEnrollments}`,
      subLabel: "today",
      trend: stats.todayEnrollments > 0 ? "up" : "neutral",
      href: "/admin/students",
    },
    {
      label: "Today's Collection",
      value: `₹${stats.todayCollection.toLocaleString()}`,
      icon: IndianRupee,
      color: "bg-success/10 text-success",
      subValue: `₹${(stats.totalPayments / 1000).toFixed(0)}K`,
      subLabel: "total",
      trend: "up",
      href: "/admin/payments",
    },
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "bg-info/10 text-info",
      subValue: "",
      subLabel: "active staff",
      trend: "neutral",
      href: "/admin/users",
    },
    {
      label: "Active Batches",
      value: stats.activeBatches,
      icon: BookOpen,
      color: "bg-warning/10 text-warning",
      subValue: `/${stats.totalBatches}`,
      subLabel: "total",
      trend: "neutral",
      href: "/admin/batches",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-elevated p-5 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-muted mb-3" />
            <div className="h-8 w-20 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="card-elevated p-5 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.trend === "up" && (
                <div className="flex items-center text-success text-xs">
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-heading font-bold text-foreground">
                {stat.value}
                {stat.subValue && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {stat.subValue}
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/admin/users"
              className="card-elevated p-4 hover:bg-muted/50 transition-colors text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Manage Users</p>
            </Link>
            <Link
              to="/admin/students"
              className="card-elevated p-4 hover:bg-muted/50 transition-colors text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm font-medium">View Students</p>
            </Link>
            <Link
              to="/admin/payments"
              className="card-elevated p-4 hover:bg-muted/50 transition-colors text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-warning" />
              </div>
              <p className="text-sm font-medium">Payments</p>
            </Link>
            <Link
              to="/admin/batches"
              className="card-elevated p-4 hover:bg-muted/50 transition-colors text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-info/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-info" />
              </div>
              <p className="text-sm font-medium">Batches</p>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <Link
              to="/admin/performance"
              className="card-elevated p-3 hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm">Performance</span>
            </Link>
            <Link
              to="/admin/salary"
              className="card-elevated p-3 hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <IndianRupee className="w-4 h-4 text-success" />
              <span className="text-sm">Salary</span>
            </Link>
            <Link
              to="/admin/reports"
              className="card-elevated p-3 hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-warning" />
              <span className="text-sm">Reports</span>
            </Link>
            <Link
              to="/admin/branches"
              className="card-elevated p-3 hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-info" />
              <span className="text-sm">Branches</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Recent Activity
          </h3>
          <div className="card-elevated p-4 space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.subMessage}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Branches Overview</h4>
            <Building2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.totalBranches}</span>
            <span className="text-muted-foreground">active locations</span>
          </div>
          <Link
            to="/admin/branches"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            Manage branches →
          </Link>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Total Revenue</h4>
            <CreditCard className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-success">
              ₹{(stats.totalPayments / 1000).toFixed(0)}K
            </span>
            <span className="text-muted-foreground">collected</span>
          </div>
          <Link
            to="/admin/payments"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            View details →
          </Link>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Team Size</h4>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.totalEmployees}</span>
            <span className="text-muted-foreground">employees</span>
          </div>
          <Link
            to="/admin/performance"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            View performance →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
