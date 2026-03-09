import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#8b5cf6"];

const YouTubeAnalytics = () => {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("youtube_videos").select("*").then(({ data }) => setVideos(data || []));
  }, []);

  const categoryData = Object.entries(
    videos.reduce((acc, v) => { acc[v.category || "Other"] = (acc[v.category || "Other"] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const monthlyData = Object.entries(
    videos.reduce((acc: Record<string, { views: number; videos: number; revenue: number }>, v) => {
      const m = new Date(v.posted_date).toLocaleDateString("en-IN", { year: "numeric", month: "short" });
      if (!acc[m]) acc[m] = { views: 0, videos: 0, revenue: 0 };
      acc[m].views += v.views_count || 0;
      acc[m].videos += 1;
      acc[m].revenue += Number(v.revenue_generated || 0);
      return acc;
    }, {})
  ).map(([month, d]) => ({ month, views: d.views, videos: d.videos, revenue: d.revenue })).slice(-12);

  const topVideos = [...videos].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 10).map((v) => ({ name: v.title.substring(0, 25), views: v.views_count || 0 }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Videos by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top 10 Videos by Views</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topVideos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly Trends</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="views" stroke="hsl(var(--primary))" name="Views" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(var(--destructive))" name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeAnalytics;
