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
  Send,
  Sparkles,
  Mail,
  Users,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [aiLoading, setAiLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailTarget, setEmailTarget] = useState("all_students");
  const [aiTopic, setAiTopic] = useState("");
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
      toast({ title: "Error", description: "Failed to fetch notices", variant: "destructive" });
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
    setAiTopic("");
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      toast({ title: "Error", description: "AI topic enter करें", variant: "destructive" });
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          message: `You are a professional notice writer for an educational institute called "Aspect Vision". Write a formal notice/announcement about the following topic. Keep it professional, clear, and concise. Use formal language. Do NOT use markdown formatting, HTML tags, or special characters. Write plain text only.

Topic: ${aiTopic}

Format your response exactly like this:
TITLE: [Short professional title]
CONTENT: [Formal notice content in 3-5 paragraphs. Be professional and informative.]`,
        },
      });

      if (error) throw error;

      const response = data?.response || data?.text || "";
      const titleMatch = response.match(/TITLE:\s*(.+)/);
      const contentMatch = response.match(/CONTENT:\s*([\s\S]+)/);

      if (titleMatch) {
        setFormData((prev) => ({ ...prev, title: titleMatch[1].trim() }));
      }
      if (contentMatch) {
        setFormData((prev) => ({ ...prev, content: contentMatch[1].trim() }));
      }

      toast({ title: "✅ AI Content Generated", description: "Review and edit before saving" });
    } catch (error: any) {
      console.error("AI error:", error);
      toast({ title: "Error", description: "AI content generation failed", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ title: "Error", description: "Title and content required", variant: "destructive" });
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
        toast({ title: "Success", description: "Notice updated" });
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
        toast({ title: "Success", description: "Notice created" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchNotices();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save", variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSendEmail = async (notice: Notice) => {
    setSendingEmail(true);
    try {
      // Fetch recipient emails based on target
      let recipients: string[] = [];

      if (emailTarget === "all_students" || emailTarget === "all") {
        const { data: students } = await supabase
          .from("students")
          .select("user_id")
          .eq("is_active", true);

        if (students && students.length > 0) {
          const userIds = students.map((s) => s.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("email")
            .in("user_id", userIds);
          recipients.push(...(profiles?.map((p) => p.email) || []));
        }
      }

      if (emailTarget === "all_employees" || emailTarget === "all") {
        const { data: employees } = await supabase
          .from("employees")
          .select("user_id")
          .eq("is_active", true);

        if (employees && employees.length > 0) {
          const userIds = employees.map((e) => e.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("email")
            .in("user_id", userIds);
          recipients.push(...(profiles?.map((p) => p.email) || []));
        }
      }

      // Remove duplicates
      recipients = [...new Set(recipients)];

      if (recipients.length === 0) {
        toast({ title: "No Recipients", description: "No email addresses found", variant: "destructive" });
        setSendingEmail(false);
        return;
      }

      const emailBody = `<p>Dear Student/Team Member,</p>
        <p>We would like to bring the following notice to your attention:</p>
        <div style="background-color:#f0fdfa;border-left:4px solid #0d9488;padding:16px;margin:16px 0;border-radius:4px;">
          <p style="margin:0;color:#333333;line-height:1.7;">${notice.content.replace(/\n/g, "<br/>")}</p>
        </div>
        <p>Please take note of this announcement and act accordingly.</p>
        <p>For any queries, please contact the administration office.</p>`;

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          action: "send_notice",
          subject: notice.title,
          body: emailBody,
          recipients: recipients,
        },
      });

      if (error) throw error;

      toast({
        title: "✅ Email Sent!",
        description: `Notice emailed to ${recipients.length} recipients`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Email Failed",
        description: error.message || "Could not send emails",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
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
      toast({ title: "Success", description: notice.is_active ? "Notice hidden" : "Notice visible" });
      fetchNotices();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
            Notices & Announcements
          </h2>
          <p className="text-muted-foreground">
            Create notices, AI se content likhein, aur email se bhejein
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> New Notice
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
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notices.filter((n) => n.is_active).length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notices.filter((n) => !n.is_active).length}</p>
              <p className="text-sm text-muted-foreground">Hidden</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`card-elevated p-4 ${!notice.is_active && "opacity-60"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{notice.title}</h3>
                  <Badge
                    variant={notice.is_active ? "default" : "secondary"}
                    className={notice.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}
                  >
                    {notice.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                {notice.end_date && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Expires: {format(new Date(notice.end_date), "MMM dd, yyyy")}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* Email Send */}
                <div className="flex items-center gap-1">
                  <Select value={emailTarget} onValueChange={setEmailTarget}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_students">Students</SelectItem>
                      <SelectItem value="all_employees">Employees</SelectItem>
                      <SelectItem value="all">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSendEmail(notice)}
                    disabled={sendingEmail}
                    title="Send via Email"
                  >
                    {sendingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary" />
                    )}
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleToggleActive(notice)}>
                  {notice.is_active ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(notice)}>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNotice ? "Edit Notice" : "New Notice"}</DialogTitle>
          </DialogHeader>

          {/* AI Content Generator */}
          {!editingNotice && (
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="w-4 h-4" />
                AI se Notice Likhein
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Topic enter करें... (e.g. Holiday notice, Exam schedule)"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  className="shrink-0"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Notice title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Notice content..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="button_text">Button Text</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="button_link">Button Link</Label>
                <Input
                  id="button_link"
                  value={formData.button_link}
                  onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="end_date">End Date (optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingNotice ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotices;
