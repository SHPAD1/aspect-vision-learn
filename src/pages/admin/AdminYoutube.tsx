import { useState } from "react";
import {
  Youtube,
  Eye,
  ThumbsUp,
  Users,
  TrendingUp,
  Play,
  Building2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock YouTube analytics data
const mockChannelData = {
  totalViews: 125000,
  totalSubscribers: 4500,
  totalLikes: 8200,
  watchTimeHours: 3400,
};

const mockBranchData = [
  {
    branch: "Noida",
    videos: 45,
    views: 65000,
    subscribers: 2200,
    topVideo: "Full Stack Web Development - Complete Course",
    topVideoViews: 12000,
  },
  {
    branch: "Patna",
    videos: 32,
    views: 60000,
    subscribers: 2300,
    topVideo: "Data Science with Python - Beginner Guide",
    topVideoViews: 15000,
  },
];

const mockRecentVideos = [
  {
    title: "React Hooks Tutorial 2024",
    views: 5200,
    likes: 320,
    date: "2024-01-15",
  },
  {
    title: "Python for Data Science",
    views: 4800,
    likes: 280,
    date: "2024-01-12",
  },
  {
    title: "UI/UX Design Fundamentals",
    views: 3900,
    likes: 245,
    date: "2024-01-10",
  },
  {
    title: "JavaScript Advanced Concepts",
    views: 6100,
    likes: 410,
    date: "2024-01-08",
  },
];

const AdminYoutube = () => {
  const [branchFilter, setBranchFilter] = useState<string>("all");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Youtube className="w-6 h-6 text-destructive" />
            YouTube Analytics
          </h2>
          <p className="text-muted-foreground">
            Track channel performance across all branches
          </p>
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            <SelectItem value="noida">Noida</SelectItem>
            <SelectItem value="patna">Patna</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Channel Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(mockChannelData.totalViews / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(mockChannelData.totalSubscribers / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-muted-foreground">Subscribers</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(mockChannelData.totalLikes / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-muted-foreground">Total Likes</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(mockChannelData.watchTimeHours / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-muted-foreground">Watch Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Performance */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Branch Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockBranchData.map((branch) => (
            <div key={branch.branch} className="card-elevated p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Youtube className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{branch.branch} Channel</h4>
                    <p className="text-sm text-muted-foreground">
                      {branch.videos} videos
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold">
                    {(branch.views / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold">
                    {(branch.subscribers / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <Play className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Top Video</span>
                </div>
                <p className="text-sm truncate">{branch.topVideo}</p>
                <p className="text-xs text-muted-foreground">
                  {branch.topVideoViews.toLocaleString()} views
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Videos */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          Recent Videos
        </h3>
        <div className="grid gap-3">
          {mockRecentVideos.map((video, index) => (
            <div
              key={index}
              className="card-elevated p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Play className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{video.title}</p>
                  <p className="text-sm text-muted-foreground">{video.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold">{video.views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{video.likes}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminYoutube;
