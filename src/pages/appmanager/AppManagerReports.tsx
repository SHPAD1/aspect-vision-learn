import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AppManagerReports = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("batch_sales_records").select("*"),
      supabase.from("batches").select("id, name, fees, is_active, branch_id"),
      supabase.from("branches").select("id, name"),
    ]).then(([s, b, br]) => {
      setSales(s.data || []);
      setBatches(b.data || []);
      setBranches(br.data || []);
    });
  }, []);

  const branchReports = branches.map((br) => {
    const branchSales = sales.filter((s) => s.branch_id === br.id);
    const branchBatches = batches.filter((b) => b.branch_id === br.id);
    return {
      name: br.name,
      totalSales: branchSales.length,
      totalRevenue: branchSales.reduce((s, r) => s + Number(r.revenue_collected || 0), 0),
      totalStudents: branchSales.reduce((s, r) => s + (r.students_enrolled || 0), 0),
      totalDiscount: branchSales.reduce((s, r) => s + Number(r.discount_given || 0), 0),
      activeBatches: branchBatches.filter((b) => b.is_active).length,
      totalBatches: branchBatches.length,
    };
  });

  const grandTotal = {
    revenue: branchReports.reduce((s, r) => s + r.totalRevenue, 0),
    students: branchReports.reduce((s, r) => s + r.totalStudents, 0),
    sales: branchReports.reduce((s, r) => s + r.totalSales, 0),
    discount: branchReports.reduce((s, r) => s + r.totalDiscount, 0),
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Overall Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">₹{grandTotal.revenue.toLocaleString()}</p></div>
            <div className="text-center p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Total Students</p><p className="text-2xl font-bold">{grandTotal.students}</p></div>
            <div className="text-center p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Total Sales</p><p className="text-2xl font-bold">{grandTotal.sales}</p></div>
            <div className="text-center p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Total Discount</p><p className="text-2xl font-bold">₹{grandTotal.discount.toLocaleString()}</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branchReports.map((r) => (
          <Card key={r.name}>
            <CardHeader><CardTitle className="text-base">{r.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Revenue:</span> <span className="font-bold">₹{r.totalRevenue.toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">Students:</span> <span className="font-bold">{r.totalStudents}</span></div>
                <div><span className="text-muted-foreground">Sales Records:</span> <span className="font-bold">{r.totalSales}</span></div>
                <div><span className="text-muted-foreground">Discount Given:</span> <span className="font-bold">₹{r.totalDiscount.toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">Active Batches:</span> <span className="font-bold text-success">{r.activeBatches}</span></div>
                <div><span className="text-muted-foreground">Total Batches:</span> <span className="font-bold">{r.totalBatches}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AppManagerReports;
