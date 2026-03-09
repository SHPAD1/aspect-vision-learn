import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Eye, DollarSign, ThumbsUp, Clock, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const YouTubeOverview = () => {
  const [stats, setStats] = useState({ totalVideos: 0, totalViews: 0, totalRevenue: 0, totalLikes: 0, totalWatchHours: 0, totalSubscribers: 0 });
  const [recentVideos, setRecentVideos] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase.from("youtube_videos").select("*");
    if (data) {
      setStats({
        totalVideos: data.length,
        totalViews: data.reduce((s, v) => s + (v.views_count || 0), 0),
        totalRevenue: data.reduce((s, v) => s + Number(v.revenue_generated || 0), 0),
        totalLikes: data.reduce((s, v) => s + (v.likes_count || 0), 0),
        totalWatchHours: data.reduce((s, v) => s + Number(v.watch_hours || 0), 0),
        totalSubscribers: data.reduce((s, v) => s + (v.subscribers_gained || 0), 0),
      });
      setRecentVideos(data.sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()).slice(0, 5));
    }
  };

  const statCards = [
    { icon: Video, label: "Total Videos", value: stats.totalVideos, color: "text-destructive" },
    { icon: Eye, label: "Total Views", value: stats.totalViews.toLocaleString(), color: "text-primary" },
    { icon: DollarSign, label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, color: "text-success" },
    { icon: ThumbsUp, label: "Total Likes", value: stats.totalLikes.toLocaleString(), color: "text-warning" },
    { icon: Clock, label: "Watch Hours", value: stats.totalWatchHours.toLocaleString(), color: "text-accent-foreground" },
    { icon: Users, label: "Subscribers Gained", value: stats.totalSubscribers.toLocaleString(), color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Videos</CardTitle></CardHeader>
        <CardContent>
          {recentVideos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No videos yet. Add your first video!</p>
          ) : (
            <div className="space-y-3">
              {recentVideos.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{v.title}</p>
                    <p className="text-xs text-muted-foreground">By {v.creator_name} • {new Date(v.posted_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{(v.views_count || 0).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{(v.likes_count || 0).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />₹{Number(v.revenue_generated || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeOverview;
