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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DashboardStats {
  totalStudents: number;
  todayEnrollments: number;
  totalPayments: number;
  todayCollection: number;
  totalEmployees: number;
  totalBranches: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    todayEnrollments: 0,
    totalPayments: 0,
    todayCollection: 0,
    totalEmployees: 0,
    totalBranches: 0,
  });
  const [loading, setLoading] = useState(true);

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
      ] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .gte("enrollment_date", today),
        supabase
          .from("payments")
          .select("amount")
          .eq("status", "completed"),
        supabase
          .from("payments")
          .select("amount")
          .eq("status", "completed")
          .gte("payment_date", today),
        supabase.from("employees").select("id", { count: "exact", head: true }),
        supabase.from("branches").select("id", { count: "exact", head: true }),
      ]);

      const totalPayments = paymentsRes.data?.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      ) || 0;
      const todayCollection = todayPaymentsRes.data?.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      ) || 0;

      setStats({
        totalStudents: studentsRes.count || 0,
        todayEnrollments: todayStudentsRes.count || 0,
        totalPayments,
        todayCollection,
        totalEmployees: employeesRes.count || 0,
        totalBranches: branchesRes.count || 0,
      });
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
      subLabel: `+${stats.todayEnrollments} today`,
    },
    {
      label: "Today's Collection",
      value: `₹${stats.todayCollection.toLocaleString()}`,
      icon: IndianRupee,
      color: "bg-success/10 text-success",
      subLabel: `Total: ₹${stats.totalPayments.toLocaleString()}`,
    },
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "bg-info/10 text-info",
      subLabel: "Active staff",
    },
    {
      label: "Branches",
      value: stats.totalBranches,
      icon: Building2,
      color: "bg-warning/10 text-warning",
      subLabel: "Locations",
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
          <div key={stat.label} className="card-elevated p-5">
            <div
              className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subLabel}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/admin/users"
              className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-center"
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Add User</p>
            </a>
            <a
              href="/admin/students"
              className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-center"
            >
              <GraduationCap className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-sm font-medium">New Student</p>
            </a>
            <a
              href="/admin/payments"
              className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-center"
            >
              <CreditCard className="w-6 h-6 mx-auto mb-2 text-warning" />
              <p className="text-sm font-medium">Record Payment</p>
            </a>
            <a
              href="/admin/reports"
              className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-center"
            >
              <Calendar className="w-6 h-6 mx-auto mb-2 text-info" />
              <p className="text-sm font-medium">View Reports</p>
            </a>
          </div>
        </div>

        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">Payment received</p>
                <p className="text-xs text-muted-foreground">₹15,000 - Full Stack Course</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">New enrollment</p>
                <p className="text-xs text-muted-foreground">Data Science - Noida</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium">Branch update</p>
                <p className="text-xs text-muted-foreground">Patna batch started</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
