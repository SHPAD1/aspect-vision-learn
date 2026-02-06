import { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  Plus,
  Edit2,
  Loader2,
  Copy,
  Trash2,
  Calendar,
  Percent,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  applicable_courses: string[] | null;
  created_at: string;
}

const generateCouponCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "AV";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_percent: "10",
    max_uses: "",
    valid_until: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("discount_coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: generateCouponCode(),
      description: "",
      discount_percent: "10",
      max_uses: "",
      valid_until: "",
      is_active: true,
    });
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleAddCoupon = async () => {
    if (!formData.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Coupon code is required",
        variant: "destructive",
      });
      return;
    }

    const discountPercent = parseInt(formData.discount_percent);
    if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      toast({
        title: "Validation Error",
        description: "Discount must be between 1% and 100%",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("discount_coupons").insert({
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || null,
        discount_percent: discountPercent,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active,
        created_by: userData.user?.id,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Coupon created successfully" });
      setIsAddDialogOpen(false);
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_percent: coupon.discount_percent.toString(),
      max_uses: coupon.max_uses?.toString() || "",
      valid_until: coupon.valid_until ? coupon.valid_until.split("T")[0] : "",
      is_active: coupon.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return;

    const discountPercent = parseInt(formData.discount_percent);
    if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      toast({
        title: "Validation Error",
        description: "Discount must be between 1% and 100%",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("discount_coupons")
        .update({
          description: formData.description.trim() || null,
          discount_percent: discountPercent,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          valid_until: formData.valid_until || null,
          is_active: formData.is_active,
        })
        .eq("id", selectedCoupon.id);

      if (error) throw error;

      toast({ title: "Success", description: "Coupon updated successfully" });
      setIsEditDialogOpen(false);
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const { error } = await supabase
        .from("discount_coupons")
        .delete()
        .eq("id", couponId);

      if (error) throw error;

      toast({ title: "Success", description: "Coupon deleted successfully" });
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Coupon code ${code} copied` });
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCoupons = coupons.filter((c) => c.is_active);
  const totalUsage = coupons.reduce((sum, c) => sum + c.used_count, 0);

  const CouponForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="coupon-code">Coupon Code *</Label>
        <div className="flex gap-2">
          <Input
            id="coupon-code"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            placeholder="e.g., SAVE20"
            className="uppercase"
            disabled={!!selectedCoupon}
          />
          {!selectedCoupon && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setFormData({ ...formData, code: generateCouponCode() })}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="e.g., New Year Special Offer"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discount">Discount Percent *</Label>
          <div className="relative">
            <Input
              id="discount"
              type="number"
              value={formData.discount_percent}
              onChange={(e) =>
                setFormData({ ...formData, discount_percent: e.target.value })
              }
              min="1"
              max="100"
              className="pr-8"
            />
            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div>
          <Label htmlFor="max-uses">Max Uses (optional)</Label>
          <Input
            id="max-uses"
            type="number"
            value={formData.max_uses}
            onChange={(e) =>
              setFormData({ ...formData, max_uses: e.target.value })
            }
            placeholder="Unlimited"
            min="1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="valid-until">Valid Until (optional)</Label>
        <Input
          id="valid-until"
          type="date"
          value={formData.valid_until}
          onChange={(e) =>
            setFormData({ ...formData, valid_until: e.target.value })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="is-active">Coupon Active</Label>
        <Switch
          id="is-active"
          checked={formData.is_active}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_active: checked })
          }
        />
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
            <Ticket className="w-6 h-6 text-primary" />
            Discount Coupons
          </h2>
          <p className="text-muted-foreground">
            Generate and manage discount coupons
          </p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{coupons.length}</p>
              <p className="text-sm text-muted-foreground">Total Coupons</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Percent className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCoupons.length}</p>
              <p className="text-sm text-muted-foreground">Active Coupons</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalUsage}</p>
              <p className="text-sm text-muted-foreground">Total Usages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search coupons..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Coupons Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium">Code</th>
                <th className="text-left p-4 font-medium">Discount</th>
                <th className="text-left p-4 font-medium">Usage</th>
                <th className="text-left p-4 font-medium">Valid Until</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(coupon.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    {coupon.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {coupon.description}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge className="bg-primary/10 text-primary">
                      {coupon.discount_percent}% OFF
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">
                      {coupon.used_count}
                      {coupon.max_uses && ` / ${coupon.max_uses}`}
                    </span>
                  </td>
                  <td className="p-4">
                    {coupon.valid_until ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(coupon.valid_until), "MMM dd, yyyy")}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No expiry</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={coupon.is_active ? "default" : "secondary"}
                      className={
                        coupon.is_active
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {coupon.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCoupon(coupon)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No coupons found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Coupon</DialogTitle>
          </DialogHeader>
          <CouponForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCoupon} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Generate Coupon"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          <CouponForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCoupon} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
