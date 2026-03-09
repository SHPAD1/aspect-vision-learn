import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Video } from "lucide-react";

const YouTubeRevenue = () => {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("youtube_videos").select("*").order("revenue_generated", { ascending: false }).then(({ data }) => setVideos(data || []));
  }, []);

  const totalRevenue = videos.reduce((s, v) => s + Number(v.revenue_generated || 0), 0);
  const monetizedCount = videos.filter((v) => v.is_monetized).length;
  const avgRevenue = videos.length > 0 ? totalRevenue / videos.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-muted text-success"><DollarSign className="h-6 w-6" /></div>
          <div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-muted text-primary"><Video className="h-6 w-6" /></div>
          <div><p className="text-sm text-muted-foreground">Monetized Videos</p><p className="text-2xl font-bold">{monetizedCount}/{videos.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-muted text-warning"><TrendingUp className="h-6 w-6" /></div>
          <div><p className="text-sm text-muted-foreground">Avg Revenue/Video</p><p className="text-2xl font-bold">₹{avgRevenue.toFixed(0)}</p></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue by Video</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Watch Hours</TableHead>
                <TableHead>Monetized</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{v.title}</TableCell>
                  <TableCell>{v.creator_name}</TableCell>
                  <TableCell>{(v.views_count || 0).toLocaleString()}</TableCell>
                  <TableCell>{Number(v.watch_hours || 0).toFixed(1)}</TableCell>
                  <TableCell><Badge variant={v.is_monetized ? "default" : "secondary"}>{v.is_monetized ? "Yes" : "No"}</Badge></TableCell>
                  <TableCell className="font-bold">₹{Number(v.revenue_generated || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeRevenue;
