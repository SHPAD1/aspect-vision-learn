import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  UserPlus,
  Edit,
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BranchInfo {
  id: string;
  name: string;
}

type BranchCreatableRole = "teacher" | "sales" | "support";

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

const departmentColors: Record<string, string> = {
  sales: "bg-success/10 text-success",
  support: "bg-primary/10 text-primary",
  teaching: "bg-info/10 text-info",
  management: "bg-warning/10 text-warning",
  operations: "bg-accent/10 text-accent-foreground",
  hr: "bg-muted text-muted-foreground",
  accounts: "bg-secondary text-secondary-foreground",
};

const createRoleOptions: Array<{ value: BranchCreatableRole; label: string }> = [
  { value: "teacher", label: "Teacher" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
];

const departmentOptions = [
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "teaching", label: "Teaching" },
  { value: "management", label: "Management" },
  { value: "operations", label: "Operations" },
  { value: "hr", label: "Human Resources" },
  { value: "accounts", label: "Accounts" },
];

const defaultDepartmentByRole: Record<BranchCreatableRole, string> = {
  teacher: "teaching",
  sales: "sales",
  support: "support",
};

const BranchUserManagement = () => {
  const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [addFormData, setAddFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    role: "support" as BranchCreatableRole,
    department: "support",
    designation: "",
    salary: "",
  });

  const [editFormData, setEditFormData] = useState({
    department: "",
    designation: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, [branchInfo]);

  const resetAddForm = () => {
    setAddFormData({
      full_name: "",
      email: "",
      password: "",
      phone: "",
      city: "",
      role: "support",
      department: "support",
      designation: "",
      salary: "",
    });
  };

  const fetchEmployees = async () => {
    if (!branchInfo?.id) {
      setLoading(false);
      return;
    }

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
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!branchInfo?.id) {
      toast({
        title: "Error",
        description: "Branch context not found",
        variant: "destructive",
      });
      return;
    }

    if (!addFormData.full_name.trim() || !addFormData.email.trim() || !addFormData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, email, and password are required",
        variant: "destructive",
      });
      return;
    }

    if (addFormData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: addFormData.email.trim(),
          password: addFormData.password,
          full_name: addFormData.full_name.trim(),
          phone: addFormData.phone.trim() || null,
          city: addFormData.city.trim() || null,
          role: addFormData.role,
          branch_id: branchInfo.id,
          department: addFormData.department,
          designation: addFormData.designation.trim() || null,
          salary: addFormData.salary ? Number(addFormData.salary) : null,
        },
      });

      if (error) throw new Error(error.message || "Failed to create user");
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Success",
        description: `${addFormData.full_name} ka login ID ${branchInfo.name} branch ke under create ho gaya`,
      });

      setIsAddDialogOpen(false);
      resetAddForm();
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditFormData({
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
          department: editFormData.department,
          designation: editFormData.designation || null,
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
      e.department.toLowerCase().includes(searchQuery.toLowerCase()),
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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID, or department..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Employee Login ID</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div>
              <Label>Full Name</Label>
              <Input
                value={addFormData.full_name}
                onChange={(e) => setAddFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                placeholder="Employee full name"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="employee@email.com"
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={addFormData.password}
                onChange={(e) => setAddFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={addFormData.city}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Select
                  value={addFormData.role}
                  onValueChange={(value: BranchCreatableRole) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      role: value,
                      department: defaultDepartmentByRole[value],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {createRoleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Department</Label>
                <Select
                  value={addFormData.department}
                  onValueChange={(value) => setAddFormData((prev) => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((department) => (
                      <SelectItem key={department.value} value={department.value}>
                        {department.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Designation</Label>
                <Input
                  value={addFormData.designation}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, designation: e.target.value }))}
                  placeholder="e.g., Senior Executive"
                />
              </div>
              <div>
                <Label>Salary (Optional)</Label>
                <Input
                  type="number"
                  value={addFormData.salary}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, salary: e.target.value }))}
                  placeholder="Monthly salary"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              User automatically {branchInfo?.name} branch ke under create hoga.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create ID"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Department</Label>
              <Select
                value={editFormData.department}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((department) => (
                    <SelectItem key={department.value} value={department.value}>
                      {department.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Designation</Label>
              <Input
                value={editFormData.designation}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, designation: e.target.value }))}
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
