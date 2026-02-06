import { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Notice {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  display_order: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

const AdminNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    button_text: "Learn More",
    button_link: "",
    is_active: true,
    end_date: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from("popup_notices")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast({
        title: "Error",
        description: "Failed to fetch notices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image_url: "",
      button_text: "Learn More",
      button_link: "",
      is_active: true,
      end_date: "",
    });
    setEditingNotice(null);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      if (editingNotice) {
        const { error } = await supabase
          .from("popup_notices")
          .update({
            title: formData.title.trim(),
            content: formData.content.trim(),
            image_url: formData.image_url.trim() || null,
            button_text: formData.button_text.trim() || null,
            button_link: formData.button_link.trim() || null,
            is_active: formData.is_active,
            end_date: formData.end_date || null,
          })
          .eq("id", editingNotice.id);

        if (error) throw error;
        toast({ title: "Success", description: "Notice updated successfully" });
      } else {
        const maxOrder = Math.max(...notices.map((n) => n.display_order), 0);
        const { error } = await supabase.from("popup_notices").insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          image_url: formData.image_url.trim() || null,
          button_text: formData.button_text.trim() || null,
          button_link: formData.button_link.trim() || null,
          is_active: formData.is_active,
          end_date: formData.end_date || null,
          display_order: maxOrder + 1,
          created_by: userData.user?.id,
        });

        if (error) throw error;
        toast({ title: "Success", description: "Notice created successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchNotices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save notice",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      image_url: notice.image_url || "",
      button_text: notice.button_text || "Learn More",
      button_link: notice.button_link || "",
      is_active: notice.is_active,
      end_date: notice.end_date ? notice.end_date.split("T")[0] : "",
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (notice: Notice) => {
    try {
      const { error } = await supabase
        .from("popup_notices")
        .update({ is_active: !notice.is_active })
        .eq("id", notice.id);

      if (error) throw error;
      toast({
        title: "Success",
        description: notice.is_active ? "Notice hidden" : "Notice visible",
      });
      fetchNotices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update notice",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    try {
      const { error } = await supabase.from("popup_notices").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Notice deleted" });
      fetchNotices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete notice",
        variant: "destructive",
      });
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Popup Notices
          </h2>
          <p className="text-muted-foreground">
            Manage homepage popup notices
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Notice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notices.length}</p>
              <p className="text-sm text-muted-foreground">Total Notices</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {notices.filter((n) => n.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Notices</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {notices.filter((n) => !n.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Hidden Notices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`card-elevated p-4 ${
              !notice.is_active && "opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{notice.title}</h3>
                  <Badge
                    variant={notice.is_active ? "default" : "secondary"}
                    className={
                      notice.is_active
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {notice.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notice.content}
                </p>
                {notice.end_date && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Expires: {format(new Date(notice.end_date), "MMM dd, yyyy")}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(notice)}
                >
                  {notice.is_active ? (
                    <Eye className="w-4 h-4 text-success" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(notice)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(notice.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {notices.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notices created yet</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNotice ? "Edit Notice" : "Add New Notice"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Notice title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Notice content..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="button_text">Button Text</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) =>
                    setFormData({ ...formData, button_text: e.target.value })
                  }
                  placeholder="Learn More"
                />
              </div>
              <div>
                <Label htmlFor="button_link">Button Link</Label>
                <Input
                  id="button_link"
                  value={formData.button_link}
                  onChange={(e) =>
                    setFormData({ ...formData, button_link: e.target.value })
                  }
                  placeholder="/batches"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="end_date">End Date (optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingNotice ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotices;
