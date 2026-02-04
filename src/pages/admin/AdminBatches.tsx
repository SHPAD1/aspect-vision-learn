import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Calendar,
  Users,
  IndianRupee,
  Building2,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Batch {
  id: string;
  name: string;
  course_id: string;
  branch_id: string;
  start_date: string;
  end_date: string | null;
  mode: string;
  fees: number;
  schedule: string | null;
  description: string | null;
  max_students: number | null;
  is_active: boolean | null;
  course?: { name: string };
  branch?: { name: string; city: string };
}

interface Course {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
  city: string;
}

const AdminBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    course_id: "",
    branch_id: "",
    start_date: "",
    end_date: "",
    mode: "offline",
    fees: "",
    schedule: "",
    description: "",
    max_students: "30",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, coursesRes, branchesRes] = await Promise.all([
        supabase
          .from("batches")
          .select("*, courses(name), branches(name, city)")
          .order("start_date", { ascending: false }),
        supabase.from("courses").select("id, name").eq("is_active", true),
        supabase.from("branches").select("id, name, city").eq("is_active", true),
      ]);

      if (batchesRes.error) throw batchesRes.error;

      const enrichedBatches = (batchesRes.data || []).map((batch) => ({
        ...batch,
        course: batch.courses,
        branch: batch.branches,
      }));

      setBatches(enrichedBatches);
      setCourses(coursesRes.data || []);
      setBranches(branchesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBatch = async () => {
    setFormLoading(true);
    try {
      const { error } = await supabase.from("batches").insert({
        name: formData.name,
        course_id: formData.course_id,
        branch_id: formData.branch_id,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        mode: formData.mode,
        fees: parseFloat(formData.fees),
        schedule: formData.schedule || null,
        description: formData.description || null,
        max_students: parseInt(formData.max_students) || 30,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Batch created successfully" });
      setIsAddDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create batch",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormData({
      name: batch.name,
      course_id: batch.course_id,
      branch_id: batch.branch_id,
      start_date: batch.start_date,
      end_date: batch.end_date || "",
      mode: batch.mode,
      fees: batch.fees.toString(),
      schedule: batch.schedule || "",
      description: batch.description || "",
      max_students: (batch.max_students || 30).toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBatch = async () => {
    if (!selectedBatch) return;
    setFormLoading(true);

    try {
      const { error } = await supabase
        .from("batches")
        .update({
          name: formData.name,
          course_id: formData.course_id,
          branch_id: formData.branch_id,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          mode: formData.mode,
          fees: parseFloat(formData.fees),
          schedule: formData.schedule || null,
          description: formData.description || null,
          max_students: parseInt(formData.max_students) || 30,
        })
        .eq("id", selectedBatch.id);

      if (error) throw error;

      toast({ title: "Success", description: "Batch updated successfully" });
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update batch",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      course_id: "",
      branch_id: "",
      start_date: "",
      end_date: "",
      mode: "offline",
      fees: "",
      schedule: "",
      description: "",
      max_students: "30",
    });
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.course?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch =
      branchFilter === "all" || batch.branch_id === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "online":
        return "bg-info/10 text-info";
      case "offline":
        return "bg-success/10 text-success";
      case "hybrid":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const BatchForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="batch-name">Batch Name</Label>
        <Input
          id="batch-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Full Stack Feb 2025 - Noida"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="course">Course</Label>
          <Select
            value={formData.course_id}
            onValueChange={(value) =>
              setFormData({ ...formData, course_id: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="branch">Branch</Label>
          <Select
            value={formData.branch_id}
            onValueChange={(value) =>
              setFormData({ ...formData, branch_id: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name} ({branch.city})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={formData.start_date}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mode">Mode</Label>
          <Select
            value={formData.mode}
            onValueChange={(value) => setFormData({ ...formData, mode: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="fees">Fees (₹)</Label>
          <Input
            id="fees"
            type="number"
            value={formData.fees}
            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
            placeholder="e.g., 45000"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="schedule">Schedule</Label>
          <Input
            id="schedule"
            value={formData.schedule}
            onChange={(e) =>
              setFormData({ ...formData, schedule: e.target.value })
            }
            placeholder="e.g., Mon-Fri 10:00 AM - 1:00 PM"
          />
        </div>
        <div>
          <Label htmlFor="max-students">Max Students</Label>
          <Input
            id="max-students"
            type="number"
            value={formData.max_students}
            onChange={(e) =>
              setFormData({ ...formData, max_students: e.target.value })
            }
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Brief description of the batch"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Batches Management
          </h2>
          <p className="text-muted-foreground">
            Manage all course batches across branches
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Batch
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{batches.length}</p>
              <p className="text-sm text-muted-foreground">Total Batches</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {batches.filter((b) => b.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Batches</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {batches.filter((b) => b.mode === "online").length}
              </p>
              <p className="text-sm text-muted-foreground">Online Batches</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{Math.round(batches.reduce((sum, b) => sum + b.fees, 0) / 1000)}K
              </p>
              <p className="text-sm text-muted-foreground">Avg Fees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search batches..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name} ({branch.city})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBatches.map((batch) => (
          <div key={batch.id} className="card-elevated p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">
                  {batch.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {batch.course?.name}
                </p>
              </div>
              <Badge className={getModeColor(batch.mode)}>{batch.mode}</Badge>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>
                  {batch.branch?.name} ({batch.branch?.city})
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(batch.start_date), "dd MMM yyyy")}
                  {batch.end_date &&
                    ` - ${format(new Date(batch.end_date), "dd MMM yyyy")}`}
                </span>
              </div>
              {batch.schedule && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{batch.schedule}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-success" />
                <span className="font-semibold text-success">
                  ₹{batch.fees.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEditBatch(batch)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Badge
                variant={batch.is_active ? "default" : "secondary"}
                className={
                  batch.is_active
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }
              >
                {batch.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Add Batch Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Batch</DialogTitle>
          </DialogHeader>
          <BatchForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBatch} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Batch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
          </DialogHeader>
          <BatchForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBatch} disabled={formLoading}>
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

export default AdminBatches;
