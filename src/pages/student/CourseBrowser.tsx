import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Clock,
  IndianRupee,
  MapPin,
  Calendar,
  Users,
  Loader2,
  Filter,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Course {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_weeks: number;
  thumbnail_url: string | null;
}

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
  max_students: number | null;
  is_active: boolean | null;
  course?: Course;
  branch?: { name: string; city: string };
}

const CourseBrowser = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, coursesRes] = await Promise.all([
        supabase
          .from("batches")
          .select(`
            *,
            courses (id, name, description, category, duration_weeks, thumbnail_url),
            branches (name, city)
          `)
          .eq("is_active", true)
          .order("start_date", { ascending: true }),
        supabase.from("courses").select("*").eq("is_active", true),
      ]);

      if (batchesRes.error) throw batchesRes.error;

      const enrichedBatches = (batchesRes.data || []).map((batch) => ({
        ...batch,
        course: batch.courses,
        branch: batch.branches,
      }));

      setBatches(enrichedBatches);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (batch: Batch) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to enroll in a course",
        variant: "destructive",
      });
      return;
    }
    setSelectedBatch(batch);
    setIsEnrollDialogOpen(true);
  };

  const handleEnroll = async () => {
    if (!selectedBatch || !user) return;
    setEnrolling(true);

    try {
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-course-payment", {
        body: {
          batch_id: selectedBatch.id,
          course_name: selectedBatch.course?.name,
          amount: selectedBatch.fees,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.open(data.url, "_blank");
        setIsEnrollDialogOpen(false);
        toast({
          title: "Redirecting to Payment",
          description: "Complete your payment to confirm enrollment",
        });
      }
    } catch (error: any) {
      console.error("Error creating payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.course?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.branch?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse =
      courseFilter === "all" || batch.course_id === courseFilter;
    const matchesMode = modeFilter === "all" || batch.mode === modeFilter;
    return matchesSearch && matchesCourse && matchesMode;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          Browse Courses
        </h1>
        <p className="text-muted-foreground">
          Explore our available courses and batches
        </p>
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
              <p className="text-sm text-muted-foreground">Courses</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{batches.length}</p>
              <p className="text-sm text-muted-foreground">Active Batches</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {batches.filter((b) => b.mode === "online").length}
              </p>
              <p className="text-sm text-muted-foreground">Online Options</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses, batches, or locations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Batches Grid */}
      {filteredBatches.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
            No Courses Found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => (
            <div key={batch.id} className="card-elevated p-5 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {batch.course?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {batch.name}
                    </p>
                  </div>
                </div>
                <Badge className={getModeColor(batch.mode)}>
                  {batch.mode}
                </Badge>
              </div>

              {batch.course?.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {batch.course.description}
                </p>
              )}

              <div className="space-y-2 text-sm flex-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {batch.branch?.name}, {batch.branch?.city}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Starts {format(new Date(batch.start_date), "dd MMM yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{batch.schedule || "Schedule TBA"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{batch.course?.duration_weeks} weeks duration</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-xl font-bold text-foreground">
                    <IndianRupee className="w-5 h-5" />
                    {batch.fees.toLocaleString("en-IN")}
                  </div>
                  {batch.max_students && (
                    <span className="text-xs text-muted-foreground">
                      Max {batch.max_students} students
                    </span>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleEnrollClick(batch)}
                >
                  Enroll Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Enrollment</DialogTitle>
            <DialogDescription>
              You are about to enroll in the following course
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-4">
              <div className="card-elevated p-4">
                <h3 className="font-semibold text-lg">
                  {selectedBatch.course?.name}
                </h3>
                <p className="text-muted-foreground">{selectedBatch.name}</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>
                      {selectedBatch.branch?.name}, {selectedBatch.branch?.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span>
                      {format(new Date(selectedBatch.start_date), "dd MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode</span>
                    <Badge className={getModeColor(selectedBatch.mode)}>
                      {selectedBatch.mode}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{selectedBatch.course?.duration_weeks} weeks</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
                <span className="font-medium">Total Amount</span>
                <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                  <IndianRupee className="w-6 h-6" />
                  {selectedBatch.fees.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEnrollDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <IndianRupee className="w-4 h-4 mr-2" />
              )}
              Pay & Enroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseBrowser;
