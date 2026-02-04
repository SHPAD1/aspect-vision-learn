import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  IdCard,
  MessageCircle,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  inProgress: number;
  certificates: number;
}

const StudentOverview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    inProgress: 0,
    certificates: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Get student ID
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (student) {
        // Get enrollment stats
        const { data: enrollments } = await supabase
          .from("student_enrollments")
          .select("status")
          .eq("student_id", student.id);

        if (enrollments) {
          const active = enrollments.filter(e => e.status === "active").length;
          const completed = enrollments.filter(e => e.status === "completed").length;
          
          setStats({
            enrolledCourses: enrollments.length,
            completedCourses: completed,
            inProgress: active,
            certificates: completed,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
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
      {/* Welcome Message */}
      <div className="card-elevated p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
          Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Student"}! 👋
        </h2>
        <p className="text-muted-foreground">
          Continue your learning journey. You're making great progress!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Courses", value: stats.enrolledCourses.toString(), icon: BookOpen, color: "bg-primary/10 text-primary" },
          { label: "Completed", value: stats.completedCourses.toString(), icon: CheckCircle, color: "bg-success/10 text-success" },
          { label: "In Progress", value: stats.inProgress.toString(), icon: Clock, color: "bg-warning/10 text-warning" },
          { label: "Certificates", value: stats.certificates.toString(), icon: IdCard, color: "bg-info/10 text-info" },
        ].map((stat) => (
          <div key={stat.label} className="card-elevated p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
            Continue Learning
          </h2>
          <div className="space-y-4">
            {stats.enrolledCourses === 0 ? (
              <div className="card-elevated p-8 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  You haven't enrolled in any courses yet
                </p>
                <Link to="/">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            ) : (
              [
                {
                  title: "Full Stack Web Development",
                  progress: 45,
                  nextLesson: "React Hooks Deep Dive",
                },
                {
                  title: "Data Science & Analytics",
                  progress: 20,
                  nextLesson: "Introduction to Pandas",
                },
              ].map((course) => (
                <div key={course.title} className="card-elevated p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Next: {course.nextLesson}
                      </p>
                    </div>
                    <Link to="/dashboard/courses">
                      <Button size="sm">Continue</Button>
                    </Link>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {course.progress}% complete
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/ai-tutor">
              <div className="card-interactive p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ask AI Tutor</p>
                  <p className="text-xs text-muted-foreground">Get instant help</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/id-card">
              <div className="card-interactive p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IdCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Download ID Card</p>
                  <p className="text-xs text-muted-foreground">Digital student ID</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/payments">
              <div className="card-interactive p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">View Payments</p>
                  <p className="text-xs text-muted-foreground">Fee history</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/reports">
              <div className="card-interactive p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="font-medium text-foreground">View Reports</p>
                  <p className="text-xs text-muted-foreground">Track progress</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-elevated p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            { action: "Completed lesson", detail: "React State Management", time: "2 hours ago", icon: CheckCircle, color: "text-success" },
            { action: "Started course", detail: "Data Science & Analytics", time: "1 day ago", icon: BookOpen, color: "text-primary" },
            { action: "Payment received", detail: "₹15,000 - Course fees", time: "3 days ago", icon: CreditCard, color: "text-info" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${activity.color}`}>
                <activity.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.detail}</p>
              </div>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
