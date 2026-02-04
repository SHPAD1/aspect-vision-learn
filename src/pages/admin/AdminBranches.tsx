import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Plus,
  Edit2,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Trash2,
  Power,
  PowerOff,
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

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean | null;
}

const AdminBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    city: "",
    state: "",
    address: "",
    phone: "",
    email: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("name");

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      city: "",
      state: "",
      address: "",
      phone: "",
      email: "",
    });
  };

  const handleAddBranch = async () => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.city.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, code, and city are required",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      const { error } = await supabase.from("branches").insert({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        city: formData.city.trim(),
        state: formData.state.trim() || null,
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        is_active: true,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Branch created successfully" });
      setIsAddDialogOpen(false);
      resetForm();
      fetchBranches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create branch",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      city: branch.city,
      state: branch.state || "",
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBranch = async () => {
    if (!selectedBranch) return;
    if (!formData.name.trim() || !formData.code.trim() || !formData.city.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, code, and city are required",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("branches")
        .update({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          city: formData.city.trim(),
          state: formData.state.trim() || null,
          address: formData.address.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
        })
        .eq("id", selectedBranch.id);

      if (error) throw error;

      toast({ title: "Success", description: "Branch updated successfully" });
      setIsEditDialogOpen(false);
      fetchBranches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleBranch = async () => {
    if (!selectedBranch) return;
    setFormLoading(true);

    try {
      const { error } = await supabase
        .from("branches")
        .update({ is_active: !selectedBranch.is_active })
        .eq("id", selectedBranch.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Branch ${selectedBranch.is_active ? "closed" : "activated"} successfully`,
      });
      setIsToggleDialogOpen(false);
      fetchBranches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch status",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;
    setFormLoading(true);

    try {
      const { error } = await supabase
        .from("branches")
        .delete()
        .eq("id", selectedBranch.id);

      if (error) throw error;

      toast({ title: "Success", description: "Branch deleted successfully" });
      setIsDeleteDialogOpen(false);
      fetchBranches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete branch. It may have associated data.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const BranchForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Branch Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g., Noida Main Center"
          />
        </div>
        <div>
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
            }
            placeholder="e.g., NOI-01"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
            placeholder="e.g., Noida"
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            placeholder="e.g., Uttar Pradesh"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          placeholder="Full address"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="e.g., +91 98765 43210"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="e.g., branch@example.com"
          />
        </div>
      </div>
    </div>
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
            <Building2 className="w-6 h-6 text-primary" />
            Branches
          </h2>
          <p className="text-muted-foreground">
            Manage all branch locations
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{branches.length}</p>
              <p className="text-sm text-muted-foreground">Total Branches</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Power className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {branches.filter((b) => b.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Branches</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <PowerOff className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {branches.filter((b) => !b.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Closed Branches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search branches..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBranches.map((branch) => (
          <div key={branch.id} className="card-elevated p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{branch.name}</h3>
                  <p className="text-sm text-muted-foreground">{branch.code}</p>
                </div>
              </div>
              <Badge
                variant={branch.is_active ? "default" : "secondary"}
                className={
                  branch.is_active
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }
              >
                {branch.is_active ? "Active" : "Closed"}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {branch.city}
                  {branch.state ? `, ${branch.state}` : ""}
                </span>
              </div>
              {branch.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{branch.phone}</span>
                </div>
              )}
              {branch.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{branch.email}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEditBranch(branch)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={branch.is_active ? "text-warning hover:text-warning" : "text-success hover:text-success"}
                onClick={() => {
                  setSelectedBranch(branch);
                  setIsToggleDialogOpen(true);
                }}
              >
                {branch.is_active ? (
                  <PowerOff className="w-4 h-4" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setSelectedBranch(branch);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {filteredBranches.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No branches found</p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
          </DialogHeader>
          <BranchForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBranch} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add Branch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          <BranchForm />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateBranch} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Dialog */}
      <AlertDialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedBranch?.is_active ? "Close Branch?" : "Activate Branch?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedBranch?.is_active
                ? `Are you sure you want to close "${selectedBranch?.name}"? This will make it inactive.`
                : `Are you sure you want to activate "${selectedBranch?.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleBranch}
              className={selectedBranch?.is_active ? "bg-warning hover:bg-warning/90" : "bg-success hover:bg-success/90"}
            >
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : selectedBranch?.is_active ? (
                "Close Branch"
              ) : (
                "Activate Branch"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedBranch?.name}"? This
              action cannot be undone. Branches with associated batches or
              employees cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBranch}
              className="bg-destructive hover:bg-destructive/90"
            >
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete Branch"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBranches;
