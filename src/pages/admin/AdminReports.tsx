import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

interface WeeklyReport {
  department: string;
  totalMembers: number;
  newEnrollments: number;
  paymentsCollected: number;
  activeLeads: number;
}

interface BranchReport {
  branchName: string;
  city: string;
  totalStudents: number;
  weeklyEnrollments: number;
  weeklyPayments: number;
}

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [branchReports, setBranchReports] = useState<BranchReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("this_week");

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const weekStart = format(startOfWeek(now), "yyyy-MM-dd");
      const weekEnd = format(endOfWeek(now), "yyyy-MM-dd");

      // Fetch departments data
      const [
        salesRes,
        supportRes,
        teachersRes,
        studentsRes,
        paymentsRes,
        leadsRes,
        branchesRes,
      ] = await Promise.all([
        supabase
          .from("employees")
          .select("id", { count: "exact", head: true })
          .eq("department", "sales"),
        supabase
          .from("employees")
          .select("id", { count: "exact", head: true })
          .eq("department", "support"),
        supabase
          .from("employees")
          .select("id", { count: "exact", head: true })
          .eq("department", "teaching"),
        supabase
          .from("students")
          .select("id, enrollment_date, branch_id")
          .gte("enrollment_date", weekStart)
          .lte("enrollment_date", weekEnd),
        supabase
          .from("payments")
          .select("amount, student_id")
          .gte("payment_date", weekStart)
          .lte("payment_date", weekEnd)
          .eq("status", "completed"),
        supabase
          .from("enrollment_leads")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
        supabase.from("branches").select("id, name, city").eq("is_active", true),
      ]);

      const weeklyPayments = paymentsRes.data?.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      ) || 0;

      // Set department reports
      setWeeklyReports([
        {
          department: "Sales",
          totalMembers: salesRes.count || 0,
          newEnrollments: studentsRes.data?.length || 0,
          paymentsCollected: weeklyPayments,
          activeLeads: leadsRes.count || 0,
        },
        {
          department: "Support",
          totalMembers: supportRes.count || 0,
          newEnrollments: 0,
          paymentsCollected: 0,
          activeLeads: 0,
        },
        {
          department: "Teaching",
          totalMembers: teachersRes.count || 0,
          newEnrollments: 0,
          paymentsCollected: 0,
          activeLeads: 0,
        },
      ]);

      // Calculate branch-wise reports
      const branchData =
        branchesRes.data?.map((branch) => {
          const branchStudents =
            studentsRes.data?.filter((s) => s.branch_id === branch.id) || [];
          const branchPayments =
            paymentsRes.data?.filter((p) =>
              branchStudents.some((s) => s.id === p.student_id)
            ) || [];

          return {
            branchName: branch.name,
            city: branch.city,
            totalStudents: branchStudents.length,
            weeklyEnrollments: branchStudents.length,
            weeklyPayments: branchPayments.reduce(
              (sum, p) => sum + Number(p.amount),
              0
            ),
          };
        }) || [];

      setBranchReports(branchData);
    } catch (error) {
      console.error("Error fetching reports:", error);
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Weekly Reports
          </h2>
          <p className="text-muted-foreground">
            Department and branch performance overview
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Department Reports */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Department Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weeklyReports.map((report) => (
            <div key={report.department} className="card-elevated p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">{report.department}</h4>
                <span className="text-2xl font-bold text-primary">
                  {report.totalMembers}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team Members</span>
                  <span>{report.totalMembers}</span>
                </div>
                {report.department === "Sales" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        New Enrollments
                      </span>
                      <span className="text-success">{report.newEnrollments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Payments Collected
                      </span>
                      <span className="text-success">
                        ₹{report.paymentsCollected.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Leads</span>
                      <span>{report.activeLeads}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Reports */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Branch Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branchReports.map((report) => (
            <div key={report.branchName} className="card-elevated p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{report.branchName}</h4>
                  <p className="text-sm text-muted-foreground">{report.city}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">
                    {report.weeklyEnrollments}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Weekly Enrollments
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-success">
                    ₹{report.weeklyPayments.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Weekly Payments</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
