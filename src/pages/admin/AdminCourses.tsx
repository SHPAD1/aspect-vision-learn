import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Clock,
  Loader2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_weeks: number;
  thumbnail_url: string | null;
  is_active: boolean | null;
  discount_percent: number | null;
  created_at: string;
}

const courseCategories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "Digital Marketing",
  "Cyber Security",
  "Cloud Computing",
  "DevOps",
  "Other",
];

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    duration_weeks: "12",
    thumbnail_url: "",
    is_active: true,
    discount_percent: "0",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("name");

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      duration_weeks: "12",
      thumbnail_url: "",
      is_active: true,
      discount_percent: "0",
    });
  };

  const handleAddCourse = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Course name is required",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      const { error } = await supabase.from("courses").insert({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category || null,
        duration_weeks: parseInt(formData.duration_weeks) || 12,
        thumbnail_url: formData.thumbnail_url.trim() || null,
        is_active: formData.is_active,
        discount_percent: parseInt(formData.discount_percent) || 0,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Course created successfully" });
      setIsAddDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      description: course.description || "",
      category: course.category || "",
      duration_weeks: course.duration_weeks.toString(),
      thumbnail_url: course.thumbnail_url || "",
      is_active: course.is_active ?? true,
      discount_percent: (course.discount_percent ?? 0).toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Course name is required",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category: formData.category || null,
          duration_weeks: parseInt(formData.duration_weeks) || 12,
          thumbnail_url: formData.thumbnail_url.trim() || null,
          is_active: formData.is_active,
        })
        .eq("id", selectedCourse.id);

      if (error) throw error;

      toast({ title: "Success", description: "Course updated successfully" });
      setIsEditDialogOpen(false);
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = [...new Set(courses.map((c) => c.category).filter(Boolean))];

  const CourseForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="course-name">Course Name *</Label>
        <Input
          id="course-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Full Stack Web Development"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Brief description of the course"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {courseCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="duration">Duration (weeks)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration_weeks}
            onChange={(e) =>
              setFormData({ ...formData, duration_weeks: e.target.value })
            }
            min="1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="thumbnail">Thumbnail URL</Label>
        <Input
          id="thumbnail"
          value={formData.thumbnail_url}
          onChange={(e) =>
            setFormData({ ...formData, thumbnail_url: e.target.value })
          }
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="is-active">Course Active</Label>
        <Switch
          id="is-active"
          checked={formData.is_active}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_active: checked })
          }
        />
      </div>
    </div>
  );

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
            <BookOpen className="w-6 h-6 text-primary" />
            Course Management
          </h2>
          <p className="text-muted-foreground">
            Add and manage all courses
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {courses.filter((c) => c.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Courses</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueCategories.length}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat!}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div key={course.id} className="card-elevated p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{course.name}</h3>
                  {course.category && (
                    <p className="text-sm text-muted-foreground">
                      {course.category}
                    </p>
                  )}
                </div>
              </div>
              <Badge
                variant={course.is_active ? "default" : "secondary"}
                className={
                  course.is_active
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }
              >
                {course.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            {course.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {course.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="w-4 h-4" />
              <span>{course.duration_weeks} weeks</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleEditCourse(course)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Course
            </Button>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No courses found</p>
          </div>
        )}
      </div>

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <CourseForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCourse} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add Course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <CourseForm />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;
