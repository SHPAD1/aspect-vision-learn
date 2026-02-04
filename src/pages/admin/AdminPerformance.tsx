import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Star,
  Award,
  Loader2,
  Building2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface EmployeePerformance {
  id: string;
  name: string;
  department: string;
  designation: string | null;
  branch: string | null;
  performance: number;
  tasks: number;
  rating: number;
}

const AdminPerformance = () => {
  const [employees, setEmployees] = useState<EmployeePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("*, branches(name)")
        .eq("is_active", true);

      if (employeesError) throw employeesError;

      // Get user profiles
      const userIds = employeesData?.map((e) => e.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      // Mock performance data (in real app, this would come from a performance table)
      const performanceData = (employeesData || []).map((emp) => {
        const profile = profilesData?.find((p) => p.user_id === emp.user_id);
        return {
          id: emp.id,
          name: profile?.full_name || "Unknown",
          department: emp.department,
          designation: emp.designation,
          branch: emp.branches?.name || null,
          performance: Math.floor(Math.random() * 40) + 60, // Mock 60-100%
          tasks: Math.floor(Math.random() * 20) + 5, // Mock 5-25 tasks
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Mock 3.0-5.0
        };
      });

      setEmployees(performanceData);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) => departmentFilter === "all" || emp.department === departmentFilter
  );

  const getPerformanceColor = (perf: number) => {
    if (perf >= 80) return "text-success";
    if (perf >= 60) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = (perf: number) => {
    if (perf >= 80) return "bg-success";
    if (perf >= 60) return "bg-warning";
    return "bg-destructive";
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
            <TrendingUp className="w-6 h-6 text-primary" />
            Employee Performance
          </h2>
          <p className="text-muted-foreground">
            Track and monitor employee performance
          </p>
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="teaching">Teaching</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{employees.length}</p>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {employees.filter((e) => e.performance >= 80).length}
              </p>
              <p className="text-sm text-muted-foreground">Top Performers</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(
                  employees.reduce((sum, e) => sum + e.rating, 0) /
                  employees.length
                ).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="grid gap-4">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="card-elevated p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {employee.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold">{employee.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="capitalize">
                      {employee.department}
                    </Badge>
                    {employee.designation && (
                      <span>{employee.designation}</span>
                    )}
                  </div>
                  {employee.branch && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Building2 className="w-3 h-3" />
                      {employee.branch}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-semibold">{employee.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{employee.tasks}</p>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      Performance
                    </span>
                    <span
                      className={`text-sm font-semibold ${getPerformanceColor(
                        employee.performance
                      )}`}
                    >
                      {employee.performance}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getProgressColor(
                        employee.performance
                      )}`}
                      style={{ width: `${employee.performance}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPerformance;
