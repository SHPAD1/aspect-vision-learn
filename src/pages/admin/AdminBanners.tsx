import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Upload, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  button_text: string;
  button_link: string;
  is_active: boolean;
  display_order: number;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    button_text: "Explore Batches",
    button_link: "/#batches",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `banner_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl.publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from("banners")
          .update({
            title: formData.title,
            subtitle: formData.subtitle || null,
            image_url: formData.image_url || null,
            button_text: formData.button_text,
            button_link: formData.button_link,
          })
          .eq("id", editingBanner.id);

        if (error) throw error;
        toast.success("Banner updated successfully");
      } else {
        const maxOrder = Math.max(...banners.map((b) => b.display_order), 0);
        const { error } = await supabase.from("banners").insert({
          title: formData.title,
          subtitle: formData.subtitle || null,
          image_url: formData.image_url || null,
          button_text: formData.button_text,
          button_link: formData.button_link,
          display_order: maxOrder + 1,
        });

        if (error) throw error;
        toast.success("Banner created successfully");
      }

      setIsDialogOpen(false);
      setEditingBanner(null);
      setFormData({
        title: "",
        subtitle: "",
        image_url: "",
        button_text: "Explore Batches",
        button_link: "/#batches",
      });
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Failed to save banner");
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image_url: banner.image_url || "",
      button_text: banner.button_text,
      button_link: banner.button_link,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !banner.is_active })
        .eq("id", banner.id);

      if (error) throw error;
      toast.success(banner.is_active ? "Banner hidden" : "Banner visible");
      fetchBanners();
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error("Failed to update banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
      toast.success("Banner deleted");
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banner Management</h1>
          <p className="text-muted-foreground">Manage homepage hero banners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingBanner(null);
                setFormData({
                  title: "",
                  subtitle: "",
                  image_url: "",
                  button_text: "Explore Batches",
                  button_link: "/#batches",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Banner headline"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Supporting text"
                  rows={2}
                />
              </div>
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {formData.image_url ? (
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="Banner preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, image_url: "" })}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload image</p>
                          <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG/WebP</p>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    placeholder="Explore Batches"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="button_link">Button Link</Label>
                  <Input
                    id="button_link"
                    value={formData.button_link}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                    placeholder="/#batches"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {editingBanner ? "Update" : "Create"} Banner
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No banners created yet. Add your first banner to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                banner.is_active ? "bg-card border-border" : "bg-muted/50 border-muted"
              }`}
            >
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />

              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-20 h-14 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-14 bg-muted rounded-lg flex items-center justify-center">
                  <Image className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className={`font-medium truncate ${!banner.is_active && "text-muted-foreground"}`}>
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Button: {banner.button_text} → {banner.button_link}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(banner)}
                  title={banner.is_active ? "Hide banner" : "Show banner"}
                >
                  {banner.is_active ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(banner.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
