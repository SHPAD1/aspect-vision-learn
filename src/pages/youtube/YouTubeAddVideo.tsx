import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const YouTubeAddVideo = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "", video_url: "", youtube_video_id: "", thumbnail_url: "", description: "",
    category: "general", creator_name: "", status: "published", branch_id: "",
    views_count: 0, likes_count: 0, comments_count: 0, subscribers_gained: 0,
    watch_hours: 0, revenue_generated: 0, duration_seconds: 0, is_monetized: false,
    posted_date: new Date().toISOString().split("T")[0], notes: "", currency: "INR", tags: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("branches").select("id, name").eq("is_active", true).then(({ data }) => setBranches(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.video_url || !form.creator_name) {
      toast({ title: "Error", description: "Title, Video URL, and Creator are required.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("youtube_videos").insert({
      title: form.title, video_url: form.video_url, youtube_video_id: form.youtube_video_id || null,
      thumbnail_url: form.thumbnail_url || null, description: form.description || null,
      category: form.category, creator_name: form.creator_name, creator_id: user?.id,
      status: form.status, branch_id: form.branch_id || null,
      views_count: Number(form.views_count), likes_count: Number(form.likes_count),
      comments_count: Number(form.comments_count), subscribers_gained: Number(form.subscribers_gained),
      watch_hours: Number(form.watch_hours), revenue_generated: Number(form.revenue_generated),
      duration_seconds: Number(form.duration_seconds), is_monetized: form.is_monetized,
      posted_date: form.posted_date, notes: form.notes || null, currency: form.currency,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Success", description: "Video added successfully!" });
    navigate("/youtube/videos");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Add New Video</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><Label>Creator Name *</Label><Input value={form.creator_name} onChange={(e) => setForm({ ...form, creator_name: e.target.value })} required /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. tutorial, vlog" /></div>
          <div><Label>Video URL *</Label><Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} required /></div>
          <div><Label>YouTube Video ID</Label><Input value={form.youtube_video_id} onChange={(e) => setForm({ ...form, youtube_video_id: e.target.value })} placeholder="e.g. dQw4w9WgXcQ" /></div>
          <div><Label>Thumbnail URL</Label><Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} /></div>
          <div><Label>Posted Date</Label><Input type="date" value={form.posted_date} onChange={(e) => setForm({ ...form, posted_date: e.target.value })} /></div>
          <div><Label>Views</Label><Input type="number" value={form.views_count} onChange={(e) => setForm({ ...form, views_count: Number(e.target.value) })} /></div>
          <div><Label>Likes</Label><Input type="number" value={form.likes_count} onChange={(e) => setForm({ ...form, likes_count: Number(e.target.value) })} /></div>
          <div><Label>Comments</Label><Input type="number" value={form.comments_count} onChange={(e) => setForm({ ...form, comments_count: Number(e.target.value) })} /></div>
          <div><Label>Watch Hours</Label><Input type="number" step="0.1" value={form.watch_hours} onChange={(e) => setForm({ ...form, watch_hours: Number(e.target.value) })} /></div>
          <div><Label>Revenue (₹)</Label><Input type="number" step="0.01" value={form.revenue_generated} onChange={(e) => setForm({ ...form, revenue_generated: Number(e.target.value) })} /></div>
          <div><Label>Subscribers Gained</Label><Input type="number" value={form.subscribers_gained} onChange={(e) => setForm({ ...form, subscribers_gained: Number(e.target.value) })} /></div>
          <div><Label>Duration (seconds)</Label><Input type="number" value={form.duration_seconds} onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) })} /></div>
          <div>
            <Label>Branch</Label>
            <Select value={form.branch_id || "none"} onValueChange={(v) => setForm({ ...form, branch_id: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Branch</SelectItem>
                {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tech, tutorial, coding" /></div>
          <div className="flex items-center gap-3 pt-6">
            <Switch checked={form.is_monetized} onCheckedChange={(v) => setForm({ ...form, is_monetized: v })} />
            <Label>Monetized</Label>
          </div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          <div className="md:col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          <div className="md:col-span-2"><Button type="submit" className="w-full">Add Video</Button></div>
        </form>
      </CardContent>
    </Card>
  );
};

export default YouTubeAddVideo;
