import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const metricTypes = ["daily_visits", "conversion_rate", "bounce_rate", "avg_session_duration", "page_views", "new_users", "active_users", "revenue", "leads_generated", "custom"];

const AppManagerMetrics = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMetric, setEditMetric] = useState<any>(null);
  const [form, setForm] = useState({ metric_type: "daily_visits", metric_value: 0, metric_date: new Date().toISOString().split("T")[0], branch_id: "", notes: "" });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [m, b] = await Promise.all([
      supabase.from("app_metrics").select("*").order("metric_date", { ascending: false }),
      supabase.from("branches").select("id, name").eq("is_active", true),
    ]);
    setMetrics(m.data || []);
    setBranches(b.data || []);
  };

  const resetForm = () => setForm({ metric_type: "daily_visits", metric_value: 0, metric_date: new Date().toISOString().split("T")[0], branch_id: "", notes: "" });

  const handleSave = async () => {
    const payload = { metric_type: form.metric_type, metric_value: Number(form.metric_value), metric_date: form.metric_date, branch_id: form.branch_id || null, notes: form.notes || null, recorded_by: user?.id };
    let error;
    if (editMetric) {
      ({ error } = await supabase.from("app_metrics").update(payload).eq("id", editMetric.id));
    } else {
      ({ error } = await supabase.from("app_metrics").insert(payload));
    }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Saved" });
    setDialogOpen(false); setEditMetric(null); resetForm(); fetchAll();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("app_metrics").delete().eq("id", id);
    fetchAll();
  };

  const getBranchName = (id: string | null) => id ? branches.find((b) => b.id === id)?.name || "—" : "Global";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">App Metrics</h2>
        <Button onClick={() => { resetForm(); setEditMetric(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Metric</Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Date</TableHead>
                <TableHead>Branch</TableHead><TableHead>Notes</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No metrics</TableCell></TableRow>
              ) : metrics.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.metric_type.replace(/_/g, " ")}</TableCell>
                  <TableCell className="font-bold">{Number(m.metric_value).toLocaleString()}</TableCell>
                  <TableCell>{new Date(m.metric_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getBranchName(m.branch_id)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{m.notes || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditMetric(m); setForm({ metric_type: m.metric_type, metric_value: m.metric_value, metric_date: m.metric_date, branch_id: m.branch_id || "", notes: m.notes || "" }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editMetric ? "Edit" : "Add"} Metric</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Metric Type</Label>
              <Select value={form.metric_type} onValueChange={(v) => setForm({ ...form, metric_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{metricTypes.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Value</Label><Input type="number" value={form.metric_value} onChange={(e) => setForm({ ...form, metric_value: Number(e.target.value) })} /></div>
            <div><Label>Date</Label><Input type="date" value={form.metric_date} onChange={(e) => setForm({ ...form, metric_date: e.target.value })} /></div>
            <div><Label>Branch</Label>
              <Select value={form.branch_id || "global"} onValueChange={(v) => setForm({ ...form, branch_id: v === "global" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="global">Global</SelectItem>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button className="w-full" onClick={handleSave}>{editMetric ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppManagerMetrics;
