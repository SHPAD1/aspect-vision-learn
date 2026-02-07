import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BranchInfo {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  employee_id: string;
  user_id: string;
  designation: string | null;
  joining_date: string;
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

const BranchTeacherSection = () => {
  const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, [branchInfo]);

  const fetchTeachers = async () => {
    if (!branchInfo?.id) return;

    try {
      const { data: employees } = await supabase
        .from("employees")
        .select("*")
        .eq("branch_id", branchInfo.id)
        .eq("department", "teaching")
        .eq("is_active", true);

      if (employees && employees.length > 0) {
        const userIds = employees.map((e) => e.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, phone")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
        const teachersWithProfiles = employees.map((e) => ({
          ...e,
          profile: profileMap.get(e.user_id),
        }));
        setTeachers(teachersWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.length}</p>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Active Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Classes Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Faculty Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-heading text-lg font-semibold mb-2">No Teachers Found</h3>
              <p className="text-muted-foreground">
                Teacher management section is under development.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact admin to add teachers to this branch.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {teacher.profile?.full_name?.charAt(0) || "T"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{teacher.profile?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{teacher.profile?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{teacher.employee_id}</Badge>
                    </TableCell>
                    <TableCell>{teacher.designation || "Faculty"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(teacher.joining_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-success/10 text-success">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="p-6 rounded-xl border border-dashed border-border bg-muted/30 text-center">
        <GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <h4 className="font-heading font-semibold mb-2">Coming Soon</h4>
        <p className="text-sm text-muted-foreground">
          Advanced teacher management features including class schedules, 
          attendance tracking, and performance analytics are under development.
        </p>
      </div>
    </div>
  );
};

export default BranchTeacherSection;
