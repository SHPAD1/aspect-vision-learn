import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const YouTubePerformance = () => {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("youtube_videos").select("*").then(({ data }) => setVideos(data || []));
  }, []);

  const creatorData = Object.entries(
    videos.reduce((acc: Record<string, { videos: number; views: number; revenue: number; likes: number }>, v) => {
      const c = v.creator_name;
      if (!acc[c]) acc[c] = { videos: 0, views: 0, revenue: 0, likes: 0 };
      acc[c].videos += 1;
      acc[c].views += v.views_count || 0;
      acc[c].revenue += Number(v.revenue_generated || 0);
      acc[c].likes += v.likes_count || 0;
      return acc;
    }, {})
  ).map(([creator, d]) => {
    const data = d as { videos: number; views: number; revenue: number; likes: number };
    return { creator, videos: data.videos, views: data.views, revenue: data.revenue, likes: data.likes };
  }).sort((a, b) => b.views - a.views);

  const avgEngagement = videos.length > 0
    ? ((videos.reduce((s, v) => s + (v.likes_count || 0) + (v.comments_count || 0), 0)) / videos.reduce((s, v) => s + (v.views_count || 1), 0) * 100).toFixed(2)
    : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Avg Engagement Rate</p>
          <p className="text-3xl font-bold text-primary">{avgEngagement}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Creators</p>
          <p className="text-3xl font-bold">{creatorData.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Avg Views/Video</p>
          <p className="text-3xl font-bold">{videos.length > 0 ? Math.round(videos.reduce((s, v) => s + (v.views_count || 0), 0) / videos.length).toLocaleString() : 0}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Creator Performance</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={creatorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="creator" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" />
              <Bar dataKey="likes" fill="hsl(var(--destructive))" name="Likes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Creator Details</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {creatorData.map((c) => (
              <div key={c.creator} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{c.creator}</p>
                  <p className="text-xs text-muted-foreground">{c.videos} videos</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center"><p className="font-bold">{c.views.toLocaleString()}</p><p className="text-xs text-muted-foreground">Views</p></div>
                  <div className="text-center"><p className="font-bold">{c.likes.toLocaleString()}</p><p className="text-xs text-muted-foreground">Likes</p></div>
                  <div className="text-center"><p className="font-bold">₹{c.revenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Revenue</p></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubePerformance;
