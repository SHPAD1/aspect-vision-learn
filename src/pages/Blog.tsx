import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string;
  published_at: string | null;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, category, published_at, created_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = activeTab === "all" 
    ? posts 
    : posts.filter(p => p.category === activeTab);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Blog & Stories
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Insights & Success Stories
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Read our latest articles, tips for exam preparation, and inspiring success stories from our students
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="mb-10" onValueChange={setActiveTab}>
            <div className="flex justify-center">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
                <TabsTrigger value="success_story">Success Stories</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug}`}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="aspect-video relative overflow-hidden">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                      {post.category === "success_story" ? "Success Story" : "Blog"}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No posts available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
