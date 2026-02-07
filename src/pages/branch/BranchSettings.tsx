import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Settings,
  Shield,
  Users,
  FileText,
  UserPlus,
  Loader2,
  Save,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BranchInfo {
  id: string;
  name: string;
  code: string;
  city: string;
}

interface DepartmentPermission {
  id: string;
  department: string;
  can_create_ids: boolean;
  can_view_reports: boolean;
  can_manage_students: boolean;
}

const departmentLabels: Record<string, string> = {
  sales: "Sales",
  support: "Support",
  teaching: "Teaching",
  management: "Management",
  operations: "Operations",
  hr: "Human Resources",
  accounts: "Accounts",
};

const departmentIcons: Record<string, string> = {
  sales: "📊",
  support: "🎧",
  teaching: "📚",
  management: "👔",
  operations: "⚙️",
  hr: "👥",
  accounts: "💰",
};

const BranchSettings = () => {
  const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
  const [permissions, setPermissions] = useState<DepartmentPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (branchInfo?.id) {
      fetchPermissions();
    }
  }, [branchInfo?.id]);

  const fetchPermissions = async () => {
    if (!branchInfo?.id) return;

    try {
      const { data, error } = await supabase
        .from("branch_permissions")
        .select("*")
        .eq("branch_id", branchInfo.id)
        .order("department");

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (
    departmentId: string,
    field: keyof DepartmentPermission,
    value: boolean
  ) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === departmentId ? { ...p, [field]: value } : p
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const perm of permissions) {
        const { error } = await supabase
          .from("branch_permissions")
          .update({
            can_create_ids: perm.can_create_ids,
            can_view_reports: perm.can_view_reports,
            can_manage_students: perm.can_manage_students,
          })
          .eq("id", perm.id);

        if (error) throw error;
      }

      toast({
        title: "सफल!",
        description: "Department permissions updated successfully",
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Branch Settings
          </h2>
          <p className="text-muted-foreground">
            Configure department permissions for {branchInfo?.name}
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      {/* Permissions Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Department Permissions</h3>
              <p className="text-sm text-muted-foreground">
                Control which departments can create IDs, view reports, and manage students
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {permissions.map((perm) => (
          <Card key={perm.id} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{departmentIcons[perm.department] || "📁"}</span>
                {departmentLabels[perm.department] || perm.department}
              </CardTitle>
              <CardDescription>
                Configure permissions for {departmentLabels[perm.department] || perm.department} department
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Can Create IDs */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-sm font-medium">Create IDs</p>
                    <p className="text-xs text-muted-foreground">
                      Can create employee/student IDs
                    </p>
                  </div>
                </div>
                <Switch
                  checked={perm.can_create_ids}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(perm.id, "can_create_ids", checked)
                  }
                />
              </div>

              {/* Can View Reports */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-info" />
                  <div>
                    <p className="text-sm font-medium">View Reports</p>
                    <p className="text-xs text-muted-foreground">
                      Access to view reports
                    </p>
                  </div>
                </div>
                <Switch
                  checked={perm.can_view_reports}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(perm.id, "can_view_reports", checked)
                  }
                />
              </div>

              {/* Can Manage Students */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-warning" />
                  <div>
                    <p className="text-sm font-medium">Manage Students</p>
                    <p className="text-xs text-muted-foreground">
                      Can add/edit student data
                    </p>
                  </div>
                </div>
                <Switch
                  checked={perm.can_manage_students}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(perm.id, "can_manage_students", checked)
                  }
                />
              </div>

              {/* Status Badge */}
              <div className="flex flex-wrap gap-2 pt-2">
                {perm.can_create_ids && (
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <Check className="w-3 h-3 mr-1" /> ID Creation
                  </Badge>
                )}
                {perm.can_view_reports && (
                  <Badge variant="secondary" className="bg-info/10 text-info">
                    <Check className="w-3 h-3 mr-1" /> Reports
                  </Badge>
                )}
                {perm.can_manage_students && (
                  <Badge variant="secondary" className="bg-warning/10 text-warning">
                    <Check className="w-3 h-3 mr-1" /> Students
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Note */}
      <Card className="border-info/30 bg-info/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center shrink-0">
              <span className="text-info text-lg">ℹ️</span>
            </div>
            <div>
              <h4 className="font-medium text-info">Permission Info</h4>
              <p className="text-sm text-muted-foreground mt-1">
                • <strong>Create IDs</strong>: Allows department to create new employee or student IDs<br />
                • <strong>View Reports</strong>: Grants access to department reports and analytics<br />
                • <strong>Manage Students</strong>: Allows adding, editing, and managing student records
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BranchSettings;