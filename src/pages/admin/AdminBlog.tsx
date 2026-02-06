import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, FileText, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export default function AdminBlog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    category: "blog",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title),
    });
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
      const fileName = `blog_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("blog-images")
        .getPublicUrl(fileName);

      setFormData({ ...formData, cover_image_url: publicUrl.publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt || null,
            content: formData.content,
            cover_image_url: formData.cover_image_url || null,
            category: formData.category,
          })
          .eq("id", editingPost.id);

        if (error) throw error;
        toast.success("Post updated successfully");
      } else {
        const { error } = await supabase.from("blog_posts").insert({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt || null,
          content: formData.content,
          cover_image_url: formData.cover_image_url || null,
          category: formData.category,
          author_id: user?.id,
        });

        if (error) throw error;
        toast.success("Post created successfully");
      }

      setIsDialogOpen(false);
      setEditingPost(null);
      setFormData({ title: "", slug: "", excerpt: "", content: "", cover_image_url: "", category: "blog" });
      fetchPosts();
    } catch (error: any) {
      console.error("Error saving post:", error);
      toast.error(error.message || "Failed to save post");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      cover_image_url: post.cover_image_url || "",
      category: post.category,
    });
    setIsDialogOpen(true);
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : null,
        })
        .eq("id", post.id);

      if (error) throw error;
      toast.success(post.is_published ? "Post unpublished" : "Post published");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to update post");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Post deleted");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog & Success Stories</h1>
          <p className="text-muted-foreground">Manage blog posts and student success stories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPost(null);
                setFormData({ title: "", slug: "", excerpt: "", content: "", cover_image_url: "", category: "blog" });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cover Image */}
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {formData.cover_image_url ? (
                    <div className="relative">
                      <img
                        src={formData.cover_image_url}
                        alt="Cover preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-muted/50 rounded-lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="success_story">Success Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="post-url-slug"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Post title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief description for listing pages"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your post content here..."
                  rows={10}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {editingPost ? "Update" : "Create"} Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No blog posts yet. Create your first post to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                post.is_published ? "bg-card border-border" : "bg-muted/50 border-muted"
              }`}
            >
              {post.cover_image_url ? (
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-20 h-14 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-14 bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-medium truncate ${!post.is_published && "text-muted-foreground"}`}>
                    {post.title}
                  </h3>
                  <Badge variant={post.category === "success_story" ? "secondary" : "outline"} className="text-xs">
                    {post.category === "success_story" ? "Success Story" : "Blog"}
                  </Badge>
                </div>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {post.is_published ? `Published ${formatDate(post.published_at || post.created_at)}` : "Draft"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {post.is_published && (
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" title="View post">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTogglePublish(post)}
                  title={post.is_published ? "Unpublish" : "Publish"}
                >
                  {post.is_published ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(post.id)}
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
