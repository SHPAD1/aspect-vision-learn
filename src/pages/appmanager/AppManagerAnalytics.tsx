import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

const AppManagerAnalytics = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("batch_sales_records").select("*"),
      supabase.from("batches").select("id, name, branch_id"),
      supabase.from("branches").select("id, name"),
    ]).then(([s, b, br]) => {
      setSales(s.data || []);
      setBatches(b.data || []);
      setBranches(br.data || []);
    });
  }, []);

  const branchRevenue = branches.map((br) => ({
    name: br.name,
    revenue: sales.filter((s) => s.branch_id === br.id).reduce((sum, s) => sum + Number(s.revenue_collected || 0), 0),
    students: sales.filter((s) => s.branch_id === br.id).reduce((sum, s) => sum + (s.students_enrolled || 0), 0),
  })).filter((b) => b.revenue > 0);

  const monthlyRevenue = Object.entries(
    sales.reduce((acc: Record<string, { revenue: number; students: number }>, s) => {
      const m = new Date(s.sale_date).toLocaleDateString("en-IN", { year: "numeric", month: "short" });
      if (!acc[m]) acc[m] = { revenue: 0, students: 0 };
      acc[m].revenue += Number(s.revenue_collected || 0);
      acc[m].students += s.students_enrolled || 0;
      return acc;
    }, {})
  ).map(([month, d]) => ({ month, revenue: d.revenue, students: d.students }));

  const paymentModeData = Object.entries(
    sales.reduce((acc: Record<string, number>, s) => { acc[s.payment_mode || "other"] = (acc[s.payment_mode || "other"] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Revenue by Branch</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (₹)" />
                <Bar dataKey="students" fill="hsl(var(--destructive))" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payment Modes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={paymentModeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {paymentModeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Monthly Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" name="Revenue (₹)" />
              <Line type="monotone" dataKey="students" stroke="hsl(var(--destructive))" name="Students" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppManagerAnalytics;
