import { useState, useEffect } from "react";
import {
  Shield,
  Building2,
  UserPlus,
  FileText,
  Users,
  Loader2,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
}

interface Permission {
  id: string;
  branch_id: string;
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

const AdminBranchPermissions = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [branchRes, permRes] = await Promise.all([
        supabase.from("branches").select("id, name, code, city").eq("is_active", true).order("name"),
        supabase.from("branch_permissions").select("*").order("department"),
      ]);

      if (branchRes.error) throw branchRes.error;
      if (permRes.error) throw permRes.error;

      setBranches(branchRes.data || []);
      setPermissions(permRes.data || []);

      // Open first branch by default
      if (branchRes.data && branchRes.data.length > 0) {
        setOpenBranches({ [branchRes.data[0].id]: true });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permId: string, field: string, value: boolean) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === permId ? { ...p, [field]: value } : p))
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
      toast({ title: "सफल!", description: "All branch permissions updated successfully" });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Error", description: "Failed to save permissions", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleBranch = (branchId: string) => {
    setOpenBranches((prev) => ({ ...prev, [branchId]: !prev[branchId] }));
  };

  const getBranchPermissions = (branchId: string) =>
    permissions.filter((p) => p.branch_id === branchId);

  const getIdCreationSummary = (branchId: string) => {
    const perms = getBranchPermissions(branchId);
    const enabled = perms.filter((p) => p.can_create_ids);
    return enabled.length > 0
      ? enabled.map((p) => departmentLabels[p.department] || p.department).join(", ")
      : "None";
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
            <Shield className="w-6 h-6 text-primary" />
            Branch Permissions
          </h2>
          <p className="text-muted-foreground">
            Control which branch can create IDs for which departments
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save All Changes
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <Card key={branch.id} className="border-primary/20">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">{branch.name}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-1">ID Creation Allowed:</p>
              <p className="text-sm font-medium text-foreground">{getIdCreationSummary(branch.id)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Branch-wise Permission Management */}
      <div className="space-y-4">
        {branches.map((branch) => (
          <Collapsible
            key={branch.id}
            open={openBranches[branch.id] || false}
            onOpenChange={() => toggleBranch(branch.id)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                      {branch.name}
                      <Badge variant="outline">{branch.code}</Badge>
                      <Badge variant="secondary">{branch.city}</Badge>
                    </CardTitle>
                    {openBranches[branch.id] ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getBranchPermissions(branch.id).map((perm) => (
                      <div key={perm.id} className="border rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <span>{departmentIcons[perm.department] || "📁"}</span>
                          {departmentLabels[perm.department] || perm.department}
                        </h4>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-green-600" />
                            <span className="text-sm">Create IDs</span>
                          </div>
                          <Switch
                            checked={perm.can_create_ids}
                            onCheckedChange={(v) => handlePermissionChange(perm.id, "can_create_ids", v)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">View Reports</span>
                          </div>
                          <Switch
                            checked={perm.can_view_reports}
                            onCheckedChange={(v) => handlePermissionChange(perm.id, "can_view_reports", v)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-orange-600" />
                            <span className="text-sm">Manage Students</span>
                          </div>
                          <Switch
                            checked={perm.can_manage_students}
                            onCheckedChange={(v) => handlePermissionChange(perm.id, "can_manage_students", v)}
                          />
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {perm.can_create_ids && (
                            <Badge className="bg-green-100 text-green-700 text-[10px]">
                              <Check className="w-3 h-3 mr-0.5" /> IDs
                            </Badge>
                          )}
                          {perm.can_view_reports && (
                            <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                              <Check className="w-3 h-3 mr-0.5" /> Reports
                            </Badge>
                          )}
                          {perm.can_manage_students && (
                            <Badge className="bg-orange-100 text-orange-700 text-[10px]">
                              <Check className="w-3 h-3 mr-0.5" /> Students
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {getBranchPermissions(branch.id).length === 0 && (
                      <p className="text-sm text-muted-foreground col-span-full py-4 text-center">
                        No department permissions configured for this branch yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default AdminBranchPermissions;
