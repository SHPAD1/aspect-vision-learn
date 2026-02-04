import { useState, useEffect } from "react";
import { BookOpen, Play, FileText, Link as LinkIcon, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Enrollment {
  id: string;
  status: string;
  fees_paid: number;
  batch: {
    id: string;
    name: string;
    schedule: string;
    mode: string;
    fees: number;
    course: {
      id: string;
      name: string;
      description: string;
      duration_weeks: number;
      thumbnail_url: string;
    };
  };
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
}

const StudentCourses = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      // First get student ID
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!student) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("student_enrollments")
        .select(`
          id,
          status,
          fees_paid,
          batch:batches (
            id,
            name,
            schedule,
            mode,
            fees,
            course:courses (
              id,
              name,
              description,
              duration_weeks,
              thumbnail_url
            )
          )
        `)
        .eq("student_id", student.id);

      if (error) throw error;
      setEnrollments((data as any) || []);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async (courseId: string) => {
    setLoadingMaterials(true);
    try {
      const { data, error } = await supabase
        .from("study_materials")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_active", true);

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    fetchMaterials(courseId);
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-5 h-5" />;
      case "document":
        return <FileText className="w-5 h-5" />;
      case "link":
        return <LinkIcon className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground">Access your enrolled courses and study materials</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
            No Courses Yet
          </h3>
          <p className="text-muted-foreground mb-4">
            You haven't enrolled in any courses yet.
          </p>
          <Button asChild>
            <a href="/dashboard/browse">Browse Courses</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course List */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Enrolled Courses ({enrollments.length})
            </h3>
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                onClick={() => handleCourseSelect(enrollment.batch?.course?.id)}
                className={`card-interactive p-4 cursor-pointer ${
                  selectedCourse === enrollment.batch?.course?.id
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {enrollment.batch?.course?.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {enrollment.batch?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        enrollment.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {enrollment.status}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {enrollment.batch?.schedule}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={45} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">45% complete</p>
                </div>
              </div>
            ))}
          </div>

          {/* Course Content */}
          <div className="lg:col-span-2">
            {selectedCourse ? (
              <div className="card-elevated p-6">
                <Tabs defaultValue="materials">
                  <TabsList className="mb-6">
                    <TabsTrigger value="materials">Study Materials</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="live">Live Classes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="materials">
                    {loadingMaterials ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : materials.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">No materials available yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {materials.map((material) => (
                          <div
                            key={material.id}
                            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              {getMaterialIcon(material.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{material.title}</h4>
                              <p className="text-sm text-muted-foreground">{material.description}</p>
                            </div>
                            <Button size="sm" variant="ghost">
                              Open
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="videos">
                    <div className="text-center py-12">
                      <Play className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">Video content coming soon</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes">
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">Notes will appear here</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="live">
                    <div className="text-center py-12">
                      <LinkIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">Live class links will appear here</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="card-elevated p-12 text-center h-full flex flex-col items-center justify-center">
                <BookOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  Select a Course
                </h3>
                <p className="text-muted-foreground">
                  Click on a course to view its content
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
