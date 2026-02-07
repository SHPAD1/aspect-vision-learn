import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  Phone,
  Shield,
  Loader2,
  UserPlus,
  UserX,
  Building,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRoles {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  roles: AppRole[];
  created_at: string;
  is_blocked?: boolean;
  branch_id?: string | null;
  department?: string | null;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
}

const departments = [
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "teaching", label: "Teaching" },
  { value: "management", label: "Management" },
  { value: "operations", label: "Operations" },
];

// Roles that require branch/employee mapping
const employeeRoles: AppRole[] = ["branch_admin", "teacher", "sales", "support"];

const roleColors: Record<AppRole, string> = {
  admin: "bg-destructive/10 text-destructive",
  branch_admin: "bg-warning/10 text-warning",
  teacher: "bg-info/10 text-info",
  sales: "bg-success/10 text-success",
  support: "bg-primary/10 text-primary",
  student: "bg-muted text-muted-foreground",
};

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    role: "student" as AppRole,
    branch_id: "",
    department: "",
    designation: "",
    salary: "",
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name, code, city")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch all employees with branch info
      const { data: employees, error: employeesError } = await supabase
        .from("employees")
        .select("user_id, branch_id, department");

      if (employeesError) console.error("Error fetching employees:", employeesError);

      // Fetch all students with branch info
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("user_id, branch_id");

      if (studentsError) console.error("Error fetching students:", studentsError);

      // Map roles to users with branch info
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => {
        const employee = employees?.find((e) => e.user_id === profile.user_id);
        const student = students?.find((s) => s.user_id === profile.user_id);
        
        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          city: profile.city,
          roles: roles
            ?.filter((r) => r.user_id === profile.user_id)
            .map((r) => r.role) || [],
          created_at: profile.created_at,
          is_blocked: false,
          branch_id: employee?.branch_id || student?.branch_id || null,
          department: employee?.department || null,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      password: "",
      phone: "",
      city: "",
      role: "student",
      branch_id: "",
      department: "",
      designation: "",
      salary: "",
    });
  };

  const handleAddUser = async () => {
    if (!formData.full_name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, email, and password are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    // Validate branch for employee roles
    if (employeeRoles.includes(formData.role) && !formData.branch_id) {
      toast({
        title: "Validation Error",
        description: "Branch selection is required for this role",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      // Call edge function to create user (preserves admin session)
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: formData.email.trim(),
          password: formData.password,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          city: formData.city.trim() || null,
          role: formData.role,
          branch_id: formData.branch_id || null,
          department: formData.department || formData.role,
          designation: formData.designation.trim() || null,
          salary: formData.salary ? parseFloat(formData.salary) : null,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to create user");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: "User created successfully. They can now login with their credentials.",
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = (user: UserWithRoles) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: "",
      phone: user.phone || "",
      city: user.city || "",
      role: user.roles[0] || "student",
      branch_id: user.branch_id || "",
      department: user.department || "",
      designation: "",
      salary: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setFormLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          city: formData.city || null,
        })
        .eq("id", selectedUser.id);

      if (profileError) throw profileError;

      // Update role - first delete existing roles, then add new one
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.user_id);

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: selectedUser.user_id, role: formData.role });

      if (roleError) throw roleError;

      toast({ title: "Success", description: "User updated successfully" });
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    setFormLoading(true);

    try {
      // Remove all roles to effectively block the user
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User "${selectedUser.full_name}" has been blocked. They will no longer have access.`,
      });
      setIsBlockDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error blocking user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to block user",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setFormLoading(true);

    try {
      // Delete user roles first
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.user_id);

      // Delete profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast({ title: "Success", description: "User deleted successfully" });
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.roles.includes(roleFilter as AppRole);
    return matchesSearch && matchesRole;
  });

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
            <Users className="w-6 h-6 text-primary" />
            User Management
          </h2>
          <p className="text-muted-foreground">
            Create, edit, block, and delete user accounts
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.roles.length > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <UserX className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.roles.length === 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Blocked Users</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.roles.includes("admin")).length}
              </p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="branch_admin">Branch Admin</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const userBranch = branches.find((b) => b.id === user.branch_id);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.phone ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className={roleColors[role]}
                            >
                              {role.replace("_", " ")}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                            Blocked
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {userBranch ? (
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{userBranch.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          user.roles.length > 0
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }
                      >
                        {user.roles.length > 0 ? "Active" : "Blocked"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={user.roles.length > 0 ? "text-warning hover:text-warning" : "text-success hover:text-success"}
                          onClick={() => {
                            setSelectedUser(user);
                            setIsBlockDialogOpen(true);
                          }}
                          title={user.roles.length > 0 ? "Block User" : "User is blocked"}
                          disabled={user.roles.length === 0}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">Full Name *</Label>
              <Input
                id="add-name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="add-email">Email *</Label>
              <Input
                id="add-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="add-password">Password *</Label>
              <Input
                id="add-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <Label htmlFor="add-phone">Phone</Label>
              <Input
                id="add-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="add-city">City</Label>
              <Input
                id="add-city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="add-role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as AppRole, branch_id: "", department: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="branch_admin">Branch Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch Selection - for employee roles and students */}
            {(employeeRoles.includes(formData.role) || formData.role === "student") && (
              <div>
                <Label htmlFor="add-branch">
                  <Building className="w-3 h-3 inline mr-1" />
                  Branch {employeeRoles.includes(formData.role) ? "*" : "(Optional)"}
                </Label>
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branch_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Department & Designation - only for employee roles */}
            {employeeRoles.includes(formData.role) && (
              <>
                <div>
                  <Label htmlFor="add-department">
                    <Briefcase className="w-3 h-3 inline mr-1" />
                    Department
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-designation">Designation</Label>
                    <Input
                      id="add-designation"
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({ ...formData, designation: e.target.value })
                      }
                      placeholder="e.g. Manager"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-salary">Salary</Label>
                    <Input
                      id="add-salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      placeholder="Monthly salary"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email (Read Only)</Label>
              <Input
                id="edit-email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as AppRole })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="branch_admin">Branch Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch Selection - for employee roles and students */}
            {(employeeRoles.includes(formData.role) || formData.role === "student") && (
              <div>
                <Label htmlFor="edit-branch">
                  <Building className="w-3 h-3 inline mr-1" />
                  Branch {employeeRoles.includes(formData.role) ? "*" : "(Optional)"}
                </Label>
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branch_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Department - only for employee roles */}
            {employeeRoles.includes(formData.role) && (
              <div>
                <Label htmlFor="edit-department">
                  <Briefcase className="w-3 h-3 inline mr-1" />
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block User Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block "{selectedUser?.full_name}"? This
              will remove all their roles and they will no longer be able to
              access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              className="bg-warning hover:bg-warning/90"
            >
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Block User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedUser?.full_name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
