import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, ThumbsUp, MessageCircle, Pencil, Trash2, Search, ExternalLink } from "lucide-react";

const YouTubeVideos = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editVideo, setEditVideo] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
    fetchBranches();
  }, []);

  const fetchVideos = async () => {
    const { data } = await supabase.from("youtube_videos").select("*").order("posted_date", { ascending: false });
    setVideos(data || []);
  };

  const fetchBranches = async () => {
    const { data } = await supabase.from("branches").select("id, name").eq("is_active", true);
    setBranches(data || []);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("youtube_videos").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted", description: "Video removed." });
    fetchVideos();
  };

  const handleUpdate = async () => {
    if (!editVideo) return;
    const { id, ...rest } = editVideo;
    const { error } = await supabase.from("youtube_videos").update({
      title: rest.title, video_url: rest.video_url, youtube_video_id: rest.youtube_video_id,
      thumbnail_url: rest.thumbnail_url, description: rest.description, category: rest.category,
      creator_name: rest.creator_name, status: rest.status, views_count: Number(rest.views_count) || 0,
      likes_count: Number(rest.likes_count) || 0, comments_count: Number(rest.comments_count) || 0,
      subscribers_gained: Number(rest.subscribers_gained) || 0, watch_hours: Number(rest.watch_hours) || 0,
      revenue_generated: Number(rest.revenue_generated) || 0, duration_seconds: Number(rest.duration_seconds) || 0,
      is_monetized: rest.is_monetized, branch_id: rest.branch_id || null, notes: rest.notes,
    }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Updated", description: "Video updated successfully." });
    setEditOpen(false);
    fetchVideos();
  };

  const filtered = videos.filter((v) => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) || v.creator_name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || v.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(videos.map((v) => v.category).filter(Boolean))];
  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search videos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No videos found</TableCell></TableRow>
                ) : filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{v.title}</span>
                        {v.video_url && <a href={v.video_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 text-muted-foreground" /></a>}
                      </div>
                    </TableCell>
                    <TableCell>{v.creator_name}</TableCell>
                    <TableCell>{getBranchName(v.branch_id)}</TableCell>
                    <TableCell>{new Date(v.posted_date).toLocaleDateString()}</TableCell>
                    <TableCell>{(v.views_count || 0).toLocaleString()}</TableCell>
                    <TableCell>{(v.likes_count || 0).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(v.revenue_generated || 0).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={v.status === "published" ? "default" : "secondary"}>{v.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditVideo({ ...v }); setEditOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Video</DialogTitle></DialogHeader>
          {editVideo && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Title</Label><Input value={editVideo.title} onChange={(e) => setEditVideo({ ...editVideo, title: e.target.value })} /></div>
              <div><Label>Creator</Label><Input value={editVideo.creator_name} onChange={(e) => setEditVideo({ ...editVideo, creator_name: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={editVideo.category || ""} onChange={(e) => setEditVideo({ ...editVideo, category: e.target.value })} /></div>
              <div><Label>Video URL</Label><Input value={editVideo.video_url} onChange={(e) => setEditVideo({ ...editVideo, video_url: e.target.value })} /></div>
              <div><Label>YouTube Video ID</Label><Input value={editVideo.youtube_video_id || ""} onChange={(e) => setEditVideo({ ...editVideo, youtube_video_id: e.target.value })} /></div>
              <div><Label>Views</Label><Input type="number" value={editVideo.views_count || 0} onChange={(e) => setEditVideo({ ...editVideo, views_count: e.target.value })} /></div>
              <div><Label>Likes</Label><Input type="number" value={editVideo.likes_count || 0} onChange={(e) => setEditVideo({ ...editVideo, likes_count: e.target.value })} /></div>
              <div><Label>Comments</Label><Input type="number" value={editVideo.comments_count || 0} onChange={(e) => setEditVideo({ ...editVideo, comments_count: e.target.value })} /></div>
              <div><Label>Watch Hours</Label><Input type="number" value={editVideo.watch_hours || 0} onChange={(e) => setEditVideo({ ...editVideo, watch_hours: e.target.value })} /></div>
              <div><Label>Revenue (₹)</Label><Input type="number" value={editVideo.revenue_generated || 0} onChange={(e) => setEditVideo({ ...editVideo, revenue_generated: e.target.value })} /></div>
              <div><Label>Subscribers Gained</Label><Input type="number" value={editVideo.subscribers_gained || 0} onChange={(e) => setEditVideo({ ...editVideo, subscribers_gained: e.target.value })} /></div>
              <div><Label>Duration (seconds)</Label><Input type="number" value={editVideo.duration_seconds || 0} onChange={(e) => setEditVideo({ ...editVideo, duration_seconds: e.target.value })} /></div>
              <div>
                <Label>Branch</Label>
                <Select value={editVideo.branch_id || "none"} onValueChange={(v) => setEditVideo({ ...editVideo, branch_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Branch</SelectItem>
                    {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editVideo.status} onValueChange={(v) => setEditVideo({ ...editVideo, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={editVideo.notes || ""} onChange={(e) => setEditVideo({ ...editVideo, notes: e.target.value })} /></div>
              <div className="col-span-2"><Button className="w-full" onClick={handleUpdate}>Update Video</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YouTubeVideos;
