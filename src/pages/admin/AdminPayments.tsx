import { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Calendar,
  IndianRupee,
  Loader2,
  TrendingUp,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  status: string;
  transaction_id: string | null;
  student_id: string;
  notes: string | null;
  student?: {
    student_id: string;
    profile?: {
      full_name: string;
    };
  };
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [todayCollection, setTodayCollection] = useState(0);
  const [monthlyCollection, setMonthlyCollection] = useState(0);
  const [totalCollection, setTotalCollection] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

      // Fetch all payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("payment_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch student info
      const studentIds = [...new Set(paymentsData?.map((p) => p.student_id) || [])];
      const { data: studentsData } = await supabase
        .from("students")
        .select("id, student_id, user_id")
        .in("id", studentIds);

      // Fetch profiles
      const userIds = studentsData?.map((s) => s.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      // Enrich payments with student info
      const enrichedPayments = (paymentsData || []).map((payment) => {
        const student = studentsData?.find((s) => s.id === payment.student_id);
        const profile = profilesData?.find((p) => p.user_id === student?.user_id);
        return {
          ...payment,
          student: student
            ? {
                student_id: student.student_id,
                profile: profile ? { full_name: profile.full_name } : undefined,
              }
            : undefined,
        };
      });

      // Calculate stats
      const completedPayments = paymentsData?.filter(
        (p) => p.status === "completed"
      ) || [];
      
      const todayTotal = completedPayments
        .filter((p) => p.payment_date === today)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const monthlyTotal = completedPayments
        .filter((p) => p.payment_date >= monthStart && p.payment_date <= monthEnd)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const total = completedPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      setPayments(enrichedPayments);
      setTodayCollection(todayTotal);
      setMonthlyCollection(monthlyTotal);
      setTotalCollection(total);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.student?.profile?.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.student?.student_id
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-success/10 text-success">Completed</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning/10 text-warning">Pending</Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/10 text-destructive">Failed</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Payments
          </h2>
          <p className="text-muted-foreground">
            Track and manage all fee payments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{todayCollection.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Today's Collection</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{monthlyCollection.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Collection</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{totalCollection.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Collection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, ID, or transaction..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No payments found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">
                    {payment.transaction_id || "-"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {payment.student?.profile?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.student?.student_id || "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-success">
                      ₹{Number(payment.amount).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.payment_date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">
                      {payment.payment_method || "-"}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminPayments;
