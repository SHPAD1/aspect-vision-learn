import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

const AppManagerBatches = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("batches").select("*").order("start_date", { ascending: false }),
      supabase.from("branches").select("id, name"),
      supabase.from("courses").select("id, name"),
    ]).then(([b, br, c]) => {
      setBatches(b.data || []);
      setBranches(br.data || []);
      setCourses(c.data || []);
    });
  }, []);

  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name || "—";
  const getCourseName = (id: string) => courses.find((c) => c.id === id)?.name || "—";

  const active = batches.filter((b) => b.is_active);
  const inactive = batches.filter((b) => !b.is_active);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Batches</p><p className="text-3xl font-bold">{batches.length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Active</p><p className="text-3xl font-bold text-success">{active.length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Inactive</p><p className="text-3xl font-bold text-destructive">{inactive.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Batches</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Course</TableHead><TableHead>Branch</TableHead>
                <TableHead>Mode</TableHead><TableHead>Start</TableHead><TableHead>Fees</TableHead>
                <TableHead>Max Students</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{getCourseName(b.course_id)}</TableCell>
                  <TableCell>{getBranchName(b.branch_id)}</TableCell>
                  <TableCell><Badge variant="secondary">{b.mode}</Badge></TableCell>
                  <TableCell>{new Date(b.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>₹{Number(b.fees).toLocaleString()}</TableCell>
                  <TableCell>{b.max_students}</TableCell>
                  <TableCell><Badge variant={b.is_active ? "default" : "secondary"}>{b.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppManagerBatches;
