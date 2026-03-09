import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, DollarSign, Users, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AppManagerOverview = () => {
  const [salesRecords, setSalesRecords] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("batch_sales_records").select("*"),
      supabase.from("batches").select("*"),
      supabase.from("app_metrics").select("*"),
    ]).then(([s, b, m]) => {
      setSalesRecords(s.data || []);
      setBatches(b.data || []);
      setMetrics(m.data || []);
    });
  }, []);

  const totalSales = salesRecords.length;
  const totalRevenue = salesRecords.reduce((s, r) => s + Number(r.revenue_collected || 0), 0);
  const totalEnrolled = salesRecords.reduce((s, r) => s + (r.students_enrolled || 0), 0);
  const activeBatches = batches.filter((b) => b.is_active).length;

  const recentSales = [...salesRecords].sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()).slice(0, 5);

  const statCards = [
    { icon: ShoppingCart, label: "Total Sales Records", value: totalSales, color: "text-primary" },
    { icon: DollarSign, label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "text-success" },
    { icon: Users, label: "Students Enrolled", value: totalEnrolled, color: "text-warning" },
    { icon: Package, label: "Active Batches", value: activeBatches, color: "text-accent-foreground" },
    { icon: TrendingUp, label: "Total Batches", value: batches.length, color: "text-primary" },
    { icon: BarChart3, label: "Metrics Tracked", value: metrics.length, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted ${s.color}`}><s.icon className="h-6 w-6" /></div>
              <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Batch Sales</CardTitle></CardHeader>
        <CardContent>
          {recentSales.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No sales records yet.</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((r) => {
                const batch = batches.find((b) => b.id === r.batch_id);
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{batch?.name || "Unknown Batch"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.sale_date).toLocaleDateString()} • {r.students_enrolled} students</p>
                    </div>
                    <p className="font-bold text-success">₹{Number(r.revenue_collected).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppManagerOverview;
