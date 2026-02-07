import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BranchInfo {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  employee_id: string;
  user_id: string;
  department: string;
  designation: string | null;
  is_active: boolean;
  joining_date: string;
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  role?: string;
}

interface BranchUserManagementProps {
  branchInfo: BranchInfo | null;
}

const departmentColors: Record<string, string> = {
  sales: "bg-success/10 text-success",
  support: "bg-primary/10 text-primary",
  teaching: "bg-info/10 text-info",
  management: "bg-warning/10 text-warning",
  operations: "bg-accent/10 text-accent-foreground",
};

const BranchUserManagement = ({ branchInfo }: BranchUserManagementProps) => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    department: "",
    designation: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, [branchInfo]);

  const fetchEmployees = async () => {
    if (!branchInfo?.id) return;

    try {
      const { data: employeesData } = await supabase
        .from("employees")
        .select("*")
        .eq("branch_id", branchInfo.id)
        .order("created_at", { ascending: false });

      if (employeesData && employeesData.length > 0) {
        const userIds = employeesData.map((e) => e.user_id);
        
        const [{ data: profiles }, { data: roles }] = await Promise.all([
          supabase
            .from("profiles")
            .select("user_id, full_name, email, phone")
            .in("user_id", userIds),
          supabase
            .from("user_roles")
            .select("user_id, role")
            .in("user_id", userIds),
        ]);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
        const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]));
        
        const employeesWithDetails = employeesData.map((e) => ({
          ...e,
          profile: profileMap.get(e.user_id),
          role: roleMap.get(e.user_id),
        }));
        
        setEmployees(employeesWithDetails);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      department: employee.department,
      designation: employee.designation || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("employees")
        .update({
          department: formData.department,
          designation: formData.designation || null,
        })
        .eq("id", selectedEmployee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      setIsEditDialogOpen(false);
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from("employees")
        .update({ is_active: !employee.is_active })
        .eq("id", employee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Employee ${employee.is_active ? "deactivated" : "activated"} successfully`,
      });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            User Management
          </h2>
          <p className="text-muted-foreground">Manage employees at {branchInfo?.name}</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["sales", "support", "teaching", "management"].map((dept) => (
          <Card key={dept}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${departmentColors[dept]}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {employees.filter((e) => e.department.toLowerCase() === dept).length}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{dept}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID, or department..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No employees found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {employee.profile?.full_name?.charAt(0) || "E"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{employee.profile?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{employee.designation || "Staff"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.employee_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={departmentColors[employee.department.toLowerCase()] || "bg-muted"}>
                        {employee.department}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        <Shield className="w-3 h-3 mr-1" />
                        {employee.role || "employee"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={employee.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                        {employee.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(employee)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={employee.is_active ? "outline" : "default"}
                          onClick={() => handleToggleStatus(employee)}
                        >
                          {employee.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              To add a new employee, please contact the main admin. 
              New user creation requires admin-level permissions.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="teaching">Teaching</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Designation</Label>
              <Input
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g., Senior Executive"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchUserManagement;
