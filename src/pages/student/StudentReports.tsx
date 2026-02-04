import { useState } from "react";
import { FileText, TrendingUp, Award, Clock, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const StudentReports = () => {
  // Mock data - in production, fetch from database
  const performanceData = {
    overallProgress: 68,
    coursesCompleted: 1,
    totalCourses: 3,
    averageScore: 78,
    attendanceRate: 85,
    rank: 15,
    totalStudents: 45,
  };

  const courseProgress = [
    { name: "Full Stack Web Development", progress: 75, score: 82 },
    { name: "Data Science & Analytics", progress: 45, score: 76 },
    { name: "UI/UX Design Fundamentals", progress: 100, score: 88 },
  ];

  const weeklyActivity = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3.0 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 4.0 },
    { day: "Fri", hours: 2.0 },
    { day: "Sat", hours: 5.0 },
    { day: "Sun", hours: 3.5 },
  ];

  const maxHours = Math.max(...weeklyActivity.map(d => d.hours));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Performance Reports</h1>
          <p className="text-muted-foreground">Track your learning progress and achievements</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">
            {performanceData.overallProgress}%
          </p>
          <p className="text-sm text-muted-foreground">Overall Progress</p>
        </div>

        <div className="card-elevated p-5">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
            <Award className="w-5 h-5 text-success" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">
            {performanceData.averageScore}%
          </p>
          <p className="text-sm text-muted-foreground">Average Score</p>
        </div>

        <div className="card-elevated p-5">
          <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-info" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">
            {performanceData.attendanceRate}%
          </p>
          <p className="text-sm text-muted-foreground">Attendance Rate</p>
        </div>

        <div className="card-elevated p-5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
            <BarChart3 className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">
            #{performanceData.rank}
          </p>
          <p className="text-sm text-muted-foreground">
            of {performanceData.totalStudents} students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course-wise Progress */}
        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
            Course Progress
          </h3>
          <div className="space-y-4">
            {courseProgress.map((course) => (
              <div key={course.name}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{course.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Score: {course.score}%</span>
                    <span className="text-sm font-medium text-primary">{course.progress}%</span>
                  </div>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="card-elevated p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
            Weekly Study Activity
          </h3>
          <div className="flex items-end justify-between h-48 px-2">
            {weeklyActivity.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-2">
                <div 
                  className="w-10 bg-primary/20 rounded-t-lg transition-all hover:bg-primary/30"
                  style={{ height: `${(day.hours / maxHours) * 150}px` }}
                >
                  <div 
                    className="w-full bg-primary rounded-t-lg transition-all"
                    style={{ height: `${(day.hours / maxHours) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
                <span className="text-xs font-medium text-foreground">{day.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Reports Tabs */}
      <div className="card-elevated p-6">
        <Tabs defaultValue="assessments">
          <TabsList>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="mt-6">
            <div className="space-y-3">
              {[
                { title: "React Fundamentals Quiz", date: "Jan 15, 2026", score: 85, maxScore: 100 },
                { title: "JavaScript Assignment", date: "Jan 10, 2026", score: 42, maxScore: 50 },
                { title: "HTML/CSS Project", date: "Jan 5, 2026", score: 95, maxScore: 100 },
              ].map((assessment, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{assessment.title}</p>
                      <p className="text-sm text-muted-foreground">{assessment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {assessment.score}/{assessment.maxScore}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((assessment.score / assessment.maxScore) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Attendance records will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "🏆", title: "Fast Learner", desc: "Completed 5 lessons in a day" },
                { icon: "⭐", title: "Perfect Score", desc: "100% on an assessment" },
                { icon: "🔥", title: "7-Day Streak", desc: "Studied 7 days in a row" },
                { icon: "📚", title: "Bookworm", desc: "Read all course materials" },
              ].map((badge, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/50 text-center">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className="font-medium text-foreground text-sm">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentReports;
