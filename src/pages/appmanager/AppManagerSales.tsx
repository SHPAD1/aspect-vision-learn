import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const AppManagerSales = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form, setForm] = useState({ batch_id: "", branch_id: "", students_enrolled: 0, revenue_collected: 0, discount_given: 0, payment_mode: "mixed", status: "confirmed", notes: "", sale_date: new Date().toISOString().split("T")[0] });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [s, b, br] = await Promise.all([
      supabase.from("batch_sales_records").select("*").order("sale_date", { ascending: false }),
      supabase.from("batches").select("id, name, branch_id"),
      supabase.from("branches").select("id, name").eq("is_active", true),
    ]);
    setRecords(s.data || []);
    setBatches(b.data || []);
    setBranches(br.data || []);
  };

  const resetForm = () => setForm({ batch_id: "", branch_id: "", students_enrolled: 0, revenue_collected: 0, discount_given: 0, payment_mode: "mixed", status: "confirmed", notes: "", sale_date: new Date().toISOString().split("T")[0] });

  const handleSave = async () => {
    if (!form.batch_id || !form.branch_id) { toast({ title: "Error", description: "Batch and Branch required.", variant: "destructive" }); return; }
    const payload = { ...form, students_enrolled: Number(form.students_enrolled), revenue_collected: Number(form.revenue_collected), discount_given: Number(form.discount_given), recorded_by: user?.id };
    let error;
    if (editRecord) {
      ({ error } = await supabase.from("batch_sales_records").update(payload).eq("id", editRecord.id));
    } else {
      ({ error } = await supabase.from("batch_sales_records").insert(payload));
    }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editRecord ? "Updated" : "Added", description: "Sale record saved." });
    setDialogOpen(false);
    setEditRecord(null);
    resetForm();
    fetchAll();
  };

  const handleEdit = (r: any) => {
    setEditRecord(r);
    setForm({ batch_id: r.batch_id, branch_id: r.branch_id, students_enrolled: r.students_enrolled, revenue_collected: r.revenue_collected, discount_given: r.discount_given || 0, payment_mode: r.payment_mode || "mixed", status: r.status, notes: r.notes || "", sale_date: r.sale_date });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("batch_sales_records").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" }); fetchAll();
  };

  const getBatchName = (id: string) => batches.find((b) => b.id === id)?.name || "—";
  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Batch Sales Records</h2>
        <Button onClick={() => { resetForm(); setEditRecord(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Sale</Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead><TableHead>Branch</TableHead><TableHead>Date</TableHead>
                <TableHead>Students</TableHead><TableHead>Revenue</TableHead><TableHead>Discount</TableHead>
                <TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No records</TableCell></TableRow>
              ) : records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{getBatchName(r.batch_id)}</TableCell>
                  <TableCell>{getBranchName(r.branch_id)}</TableCell>
                  <TableCell>{new Date(r.sale_date).toLocaleDateString()}</TableCell>
                  <TableCell>{r.students_enrolled}</TableCell>
                  <TableCell className="font-bold">₹{Number(r.revenue_collected).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(r.discount_given || 0).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="secondary">{r.payment_mode}</Badge></TableCell>
                  <TableCell><Badge variant={r.status === "confirmed" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editRecord ? "Edit" : "Add"} Sale Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Batch *</Label>
              <Select value={form.batch_id} onValueChange={(v) => { const batch = batches.find((b) => b.id === v); setForm({ ...form, batch_id: v, branch_id: batch?.branch_id || form.branch_id }); }}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>{batches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Branch *</Label>
              <Select value={form.branch_id} onValueChange={(v) => setForm({ ...form, branch_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Sale Date</Label><Input type="date" value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} /></div>
            <div><Label>Students Enrolled</Label><Input type="number" value={form.students_enrolled} onChange={(e) => setForm({ ...form, students_enrolled: Number(e.target.value) })} /></div>
            <div><Label>Revenue (₹)</Label><Input type="number" value={form.revenue_collected} onChange={(e) => setForm({ ...form, revenue_collected: Number(e.target.value) })} /></div>
            <div><Label>Discount (₹)</Label><Input type="number" value={form.discount_given} onChange={(e) => setForm({ ...form, discount_given: Number(e.target.value) })} /></div>
            <div>
              <Label>Payment Mode</Label>
              <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem><SelectItem value="online">Online</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem><SelectItem value="emi">EMI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="col-span-2"><Button className="w-full" onClick={handleSave}>{editRecord ? "Update" : "Add"} Record</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppManagerSales;
