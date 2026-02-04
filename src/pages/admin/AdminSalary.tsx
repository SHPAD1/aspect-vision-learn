import { useState, useEffect } from "react";
import {
  Wallet,
  Search,
  IndianRupee,
  Calendar,
  TrendingUp,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface EmployeeSalary {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  designation: string | null;
  salary: number;
  performance: number;
  bonus: number;
  totalSalary: number;
}

const AdminSalary = () => {
  const [employees, setEmployees] = useState<EmployeeSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data: employeesData, error } = await supabase
        .from("employees")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      // Get profiles
      const userIds = employeesData?.map((e) => e.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      // Calculate salary with performance-based bonus
      const salaryData = (employeesData || []).map((emp) => {
        const profile = profilesData?.find((p) => p.user_id === emp.user_id);
        const baseSalary = Number(emp.salary) || 0;
        const performance = Math.floor(Math.random() * 40) + 60; // Mock 60-100%
        const bonus = performance >= 80 ? baseSalary * 0.1 : 0; // 10% bonus for high performers

        return {
          id: emp.id,
          employee_id: emp.employee_id,
          name: profile?.full_name || "Unknown",
          department: emp.department,
          designation: emp.designation,
          salary: baseSalary,
          performance,
          bonus,
          totalSalary: baseSalary + bonus,
        };
      });

      setEmployees(salaryData);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMonthlyPayroll = filteredEmployees.reduce(
    (sum, emp) => sum + emp.totalSalary,
    0
  );
  const totalBonuses = filteredEmployees.reduce(
    (sum, emp) => sum + emp.bonus,
    0
  );

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
            <Wallet className="w-6 h-6 text-primary" />
            Salary Management
          </h2>
          <p className="text-muted-foreground">
            Performance-based salary calculation and reports
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-[180px]"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{totalMonthlyPayroll.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Payroll</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{totalBonuses.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Bonuses</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{employees.length}</p>
              <p className="text-sm text-muted-foreground">Employees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or ID..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Salary Table */}
      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Base Salary</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No employees found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-mono text-sm">
                    {emp.employee_id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.designation || "-"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {emp.department}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{emp.salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        emp.performance >= 80
                          ? "bg-success/10 text-success"
                          : emp.performance >= 60
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }
                    >
                      {emp.performance}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {emp.bonus > 0 ? (
                      <span className="text-success font-medium">
                        +₹{emp.bonus.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      ₹{emp.totalSalary.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSalary;
