import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  bio: string | null;
  photo_url: string | null;
  is_active: boolean;
  display_order: number;
}

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    bio: "",
    photo_url: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching team:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `team_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("team-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("team-photos")
        .getPublicUrl(fileName);

      setFormData({ ...formData, photo_url: publicUrl.publicUrl });
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMember) {
        const { error } = await supabase
          .from("team_members")
          .update({
            name: formData.name,
            designation: formData.designation,
            bio: formData.bio || null,
            photo_url: formData.photo_url || null,
          })
          .eq("id", editingMember.id);

        if (error) throw error;
        toast.success("Team member updated successfully");
      } else {
        const maxOrder = Math.max(...members.map((m) => m.display_order), 0);
        const { error } = await supabase.from("team_members").insert({
          name: formData.name,
          designation: formData.designation,
          bio: formData.bio || null,
          photo_url: formData.photo_url || null,
          display_order: maxOrder + 1,
        });

        if (error) throw error;
        toast.success("Team member added successfully");
      }

      setIsDialogOpen(false);
      setEditingMember(null);
      setFormData({ name: "", designation: "", bio: "", photo_url: "" });
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
      toast.error("Failed to save team member");
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      designation: member.designation,
      bio: member.bio || "",
      photo_url: member.photo_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ is_active: !member.is_active })
        .eq("id", member.id);

      if (error) throw error;
      toast.success(member.is_active ? "Member hidden" : "Member visible");
      fetchMembers();
    } catch (error) {
      toast.error("Failed to update member");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    try {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
      toast.success("Team member deleted");
      fetchMembers();
    } catch (error) {
      toast.error("Failed to delete member");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members shown on the website</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingMember(null);
                setFormData({ name: "", designation: "", bio: "", photo_url: "" });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-border flex items-center justify-center bg-muted">
                    {formData.photo_url ? (
                      <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {uploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
                    {formData.photo_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive mt-1"
                        onClick={() => setFormData({ ...formData, photo_url: "" })}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Senior Faculty, Director"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short bio or description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {editingMember ? "Update" : "Add"} Member
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No team members yet. Add your first team member to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className={`rounded-xl border p-4 ${
                member.is_active ? "bg-card border-border" : "bg-muted/50 border-muted"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold truncate ${!member.is_active && "text-muted-foreground"}`}>
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary truncate">{member.designation}</p>
                  {member.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{member.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(member)}
                  title={member.is_active ? "Hide" : "Show"}
                >
                  {member.is_active ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(member.id)}
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
