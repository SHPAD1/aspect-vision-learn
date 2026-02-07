import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  Eye,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  CreditCard,
  FileText,
  Download,
  BookOpen,
  Calendar,
  IdCard,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  code: string;
}

interface Student {
  id: string;
  student_id: string;
  user_id: string;
  enrollment_date: string;
  is_active: boolean;
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    city: string | null;
  };
}

interface Enrollment {
  id: string;
  batch_id: string;
  enrollment_date: string;
  status: string;
  fees_paid: number;
  batch?: {
    name: string;
    fees: number;
    course?: {
      name: string;
    };
  };
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  status: string;
  payment_method: string | null;
  batch?: {
    name: string;
  };
}

const BranchStudentSection = () => {
  const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
  const [view, setView] = useState<"list" | "detail">("list");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [branchInfo]);

  const fetchStudents = async () => {
    if (!branchInfo?.id) return;

    try {
      const { data: studentsData } = await supabase
        .from("students")
        .select("*")
        .eq("branch_id", branchInfo.id)
        .order("created_at", { ascending: false });

      if (studentsData && studentsData.length > 0) {
        const userIds = studentsData.map((s) => s.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, phone, avatar_url, city")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
        const studentsWithProfiles = studentsData.map((s) => ({
          ...s,
          profile: profileMap.get(s.user_id),
        }));
        setStudents(studentsWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (student: Student) => {
    try {
      // Fetch enrollments
      const { data: enrollmentsData } = await supabase
        .from("student_enrollments")
        .select(`
          *,
          batches:batch_id (
            name,
            fees,
            courses:course_id (name)
          )
        `)
        .eq("student_id", student.id);

      if (enrollmentsData) {
        const formatted = enrollmentsData.map((e: any) => ({
          ...e,
          batch: {
            name: e.batches?.name,
            fees: e.batches?.fees,
            course: e.batches?.courses,
          },
        }));
        setEnrollments(formatted);
      }

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select(`
          *,
          batches:batch_id (name)
        `)
        .eq("student_id", student.id)
        .order("payment_date", { ascending: false });

      if (paymentsData) {
        const formatted = paymentsData.map((p: any) => ({
          ...p,
          batch: p.batches,
        }));
        setPayments(formatted);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    fetchStudentDetails(student);
    setView("detail");
  };

  const filteredStudents = students.filter(
    (s) =>
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStudentList = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.filter((s) => s.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {students.filter((s) => {
                    const date = new Date(s.enrollment_date);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by name, ID, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Student List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No students found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {student.profile?.full_name?.charAt(0) || "S"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.profile?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{student.profile?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.student_id}</Badge>
                    </TableCell>
                    <TableCell>
                      {student.profile?.phone || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(student.enrollment_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge className={student.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleViewStudent(student)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentDetail = () => {
    if (!selectedStudent) return null;

    const totalFees = enrollments.reduce((sum, e) => sum + (e.batch?.fees || 0), 0);
    const totalPaid = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setView("list")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Button>

        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold text-primary">
                  {selectedStudent.profile?.full_name?.charAt(0) || "S"}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-2xl font-bold">{selectedStudent.profile?.full_name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge variant="outline">{selectedStudent.student_id}</Badge>
                  <Badge className={selectedStudent.is_active ? "bg-success/10 text-success" : "bg-muted"}>
                    {selectedStudent.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedStudent.profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{selectedStudent.profile?.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Enrolled On</p>
                    <p className="text-sm font-medium">{format(new Date(selectedStudent.enrollment_date), "MMM d, yyyy")}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm">
                  <IdCard className="w-4 h-4 mr-2" /> Generate ID Card
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" /> Progress Report
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" /> View Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{enrollments.length}</p>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold">₹{(totalFees - totalPaid).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-info" />
              <p className="text-2xl font-bold">{payments.length}</p>
              <p className="text-sm text-muted-foreground">Payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Enrolled Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No enrollments found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Enrolled On</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.batch?.course?.name || "Unknown Course"}
                      </TableCell>
                      <TableCell>{enrollment.batch?.name || "-"}</TableCell>
                      <TableCell>₹{enrollment.batch?.fees?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-success">₹{enrollment.fees_paid?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(enrollment.enrollment_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={enrollment.status === "active" ? "bg-success/10 text-success" : "bg-muted"}>
                          {enrollment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-success" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No payments found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {format(new Date(payment.payment_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-semibold">₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.batch?.name || "-"}</TableCell>
                      <TableCell className="capitalize">{payment.payment_method || "Cash"}</TableCell>
                      <TableCell>
                        <Badge className={
                          payment.status === "completed" ? "bg-success/10 text-success" :
                          payment.status === "pending" ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        }>
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div>
      {view === "list" && renderStudentList()}
      {view === "detail" && renderStudentDetail()}
    </div>
  );
};

export default BranchStudentSection;
