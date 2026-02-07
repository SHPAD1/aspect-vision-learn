import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  Users,
  CreditCard,
  Target,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

interface BranchInfo {
  id: string;
  name: string;
  code: string;
}

interface BranchReportGenerationProps {
  branchInfo: BranchInfo | null;
}

const BranchReportGeneration = ({ branchInfo }: BranchReportGenerationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dateFilter, setDateFilter] = useState("this_month");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEmployees: 0,
    totalPayments: 0,
    totalRevenue: 0,
    newEnrollments: 0,
    pendingRequests: 0,
    resolvedTickets: 0,
    convertedLeads: 0,
  });

  const [departmentStats, setDepartmentStats] = useState<{ department: string; count: number; performance: string }[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [branchInfo, dateFilter, departmentFilter]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case "today":
        return { start: format(now, "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") };
      case "yesterday":
        return { start: format(subDays(now, 1), "yyyy-MM-dd"), end: format(subDays(now, 1), "yyyy-MM-dd") };
      case "this_week":
        return { start: format(startOfWeek(now), "yyyy-MM-dd"), end: format(endOfWeek(now), "yyyy-MM-dd") };
      case "this_month":
        return { start: format(startOfMonth(now), "yyyy-MM-dd"), end: format(endOfMonth(now), "yyyy-MM-dd") };
      case "custom":
        return { start: customStartDate, end: customEndDate };
      default:
        return { start: format(startOfMonth(now), "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") };
    }
  };

  const fetchReportData = async () => {
    if (!branchInfo?.id) return;
    setLoading(true);

    try {
      const { start, end } = getDateRange();

      // Fetch students
      const { count: studentsCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", branchInfo.id)
        .eq("is_active", true);

      // Fetch employees
      const { data: employees } = await supabase
        .from("employees")
        .select("department")
        .eq("branch_id", branchInfo.id)
        .eq("is_active", true);

      // Fetch new enrollments
      const { count: enrollmentsCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", branchInfo.id)
        .gte("enrollment_date", start)
        .lte("enrollment_date", end);

      // Fetch pending requests
      const { count: requestsCount } = await supabase
        .from("employee_requests")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", branchInfo.id)
        .eq("status", "pending");

      // Calculate department stats
      const deptCounts = new Map<string, number>();
      employees?.forEach((e) => {
        deptCounts.set(e.department, (deptCounts.get(e.department) || 0) + 1);
      });

      const deptStats = Array.from(deptCounts.entries()).map(([dept, count]) => ({
        department: dept,
        count,
        performance: count >= 5 ? "Good" : count >= 3 ? "Average" : "Low",
      }));

      setStats({
        totalStudents: studentsCount || 0,
        totalEmployees: employees?.length || 0,
        totalPayments: 0,
        totalRevenue: 0,
        newEnrollments: enrollmentsCount || 0,
        pendingRequests: requestsCount || 0,
        resolvedTickets: 0,
        convertedLeads: 0,
      });

      setDepartmentStats(deptStats);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully. Download will start shortly.",
      });
      setGenerating(false);
    }, 2000);
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Report Generation
          </h2>
          <p className="text-muted-foreground">Generate and export branch reports</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="teaching">Teaching</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateFilter === "custom" && (
              <>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.newEnrollments}</p>
                <p className="text-sm text-muted-foreground">New Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overall Report</TabsTrigger>
          <TabsTrigger value="department">Department Report</TabsTrigger>
          <TabsTrigger value="manual">Manual Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Overall Branch Report</CardTitle>
              <Button onClick={handleGenerateReport} disabled={generating}>
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Generate Report
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Students</TableCell>
                    <TableCell className="font-bold">{stats.totalStudents}</TableCell>
                    <TableCell><Badge className="bg-success/10 text-success">Active</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Employees</TableCell>
                    <TableCell className="font-bold">{stats.totalEmployees}</TableCell>
                    <TableCell><Badge className="bg-success/10 text-success">Active</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>New Enrollments</TableCell>
                    <TableCell className="font-bold">{stats.newEnrollments}</TableCell>
                    <TableCell><Badge className="bg-info/10 text-info">This Period</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pending Requests</TableCell>
                    <TableCell className="font-bold">{stats.pendingRequests}</TableCell>
                    <TableCell>
                      <Badge className={stats.pendingRequests > 5 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}>
                        {stats.pendingRequests > 5 ? "Needs Attention" : "Good"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="department">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Department-wise Report</CardTitle>
              <Button onClick={handleGenerateReport} disabled={generating}>
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export Report
              </Button>
            </CardHeader>
            <CardContent>
              {departmentStats.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No department data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentStats.map((dept) => (
                      <TableRow key={dept.department}>
                        <TableCell className="font-medium capitalize">{dept.department}</TableCell>
                        <TableCell>{dept.count}</TableCell>
                        <TableCell>
                          <Badge className={
                            dept.performance === "Good" ? "bg-success/10 text-success" :
                            dept.performance === "Average" ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          }>
                            {dept.performance}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Report Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Create custom reports by selecting specific criteria and data points.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                  <Users className="w-8 h-8 mb-2 text-primary" />
                  <h4 className="font-semibold">Student Report</h4>
                  <p className="text-sm text-muted-foreground">Generate detailed student enrollment and performance report</p>
                </div>

                <div className="p-4 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                  <CreditCard className="w-8 h-8 mb-2 text-success" />
                  <h4 className="font-semibold">Payment Report</h4>
                  <p className="text-sm text-muted-foreground">Generate payment collection and pending dues report</p>
                </div>

                <div className="p-4 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                  <Target className="w-8 h-8 mb-2 text-warning" />
                  <h4 className="font-semibold">Sales Report</h4>
                  <p className="text-sm text-muted-foreground">Generate leads and conversion performance report</p>
                </div>

                <div className="p-4 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                  <BarChart3 className="w-8 h-8 mb-2 text-info" />
                  <h4 className="font-semibold">Performance Report</h4>
                  <p className="text-sm text-muted-foreground">Generate overall branch performance analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BranchReportGeneration;
