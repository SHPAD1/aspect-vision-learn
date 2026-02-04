import { useState, useEffect } from "react";
import { CreditCard, IndianRupee, Calendar, Download, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  transaction_id: string;
  notes: string;
  batch: {
    name: string;
    course: {
      name: string;
    };
  };
}

interface FeesSummary {
  totalFees: number;
  totalPaid: number;
  pending: number;
}

const StudentPayments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<FeesSummary>({
    totalFees: 0,
    totalPaid: 0,
    pending: 0,
  });

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      // Get student ID first
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!student) {
        setLoading(false);
        return;
      }

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          payment_date,
          payment_method,
          status,
          transaction_id,
          notes,
          batch:batches (
            name,
            course:courses (
              name
            )
          )
        `)
        .eq("student_id", student.id)
        .order("payment_date", { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments((paymentsData as any) || []);

      // Fetch enrollments for fee summary
      const { data: enrollments } = await supabase
        .from("student_enrollments")
        .select(`
          fees_paid,
          batch:batches (
            fees
          )
        `)
        .eq("student_id", student.id);

      if (enrollments) {
        const totalFees = enrollments.reduce((sum, e) => sum + ((e.batch as any)?.fees || 0), 0);
        const totalPaid = enrollments.reduce((sum, e) => sum + (e.fees_paid || 0), 0);
        setSummary({
          totalFees,
          totalPaid,
          pending: totalFees - totalPaid,
        });
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-success/10 text-success border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning/10 text-warning border-0">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/10 text-destructive border-0">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
        <h1 className="font-heading text-2xl font-bold text-foreground">Payments & Fees</h1>
        <p className="text-muted-foreground">View your payment history and fee details</p>
      </div>

      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <IndianRupee className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">
            ₹{summary.totalFees.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total Course Fees</p>
        </div>

        <div className="card-elevated p-5">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <p className="text-2xl font-heading font-bold text-success">
            ₹{summary.totalPaid.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Amount Paid</p>
        </div>

        <div className="card-elevated p-5">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <p className="text-2xl font-heading font-bold text-warning">
            ₹{summary.pending.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Pending Amount</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="card-elevated overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Payment History
          </h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No payment history yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {payment.batch?.course?.name || "Course Payment"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {payment.batch?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(payment.payment_date), "dd MMM yyyy")}
                        </span>
                        {payment.transaction_id && (
                          <span className="text-xs text-muted-foreground">
                            • TXN: {payment.transaction_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">
                      ₹{payment.amount.toLocaleString()}
                    </p>
                    <div className="mt-1">
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPayments;
