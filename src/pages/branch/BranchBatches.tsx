 import { useState, useEffect } from "react";
 import { useOutletContext } from "react-router-dom";
 import {
   BookOpen,
   Plus,
   Search,
   Edit2,
   Calendar,
   Users,
   IndianRupee,
   Loader2,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from "@/components/ui/dialog";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { Badge } from "@/components/ui/badge";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import { format } from "date-fns";
 
 interface BranchInfo {
   id: string;
   name: string;
   code: string;
   city: string;
 }
 
 interface Course {
   id: string;
   name: string;
 }
 
 interface Batch {
   id: string;
   name: string;
   course_id: string;
   course_name?: string;
   mode: string;
   start_date: string;
   end_date: string | null;
   fees: number;
   max_students: number;
   schedule: string | null;
   description: string | null;
   is_active: boolean;
   student_count?: number;
 }
 
 const BranchBatches = () => {
   const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
   const [batches, setBatches] = useState<Batch[]>([]);
   const [courses, setCourses] = useState<Course[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
   const [formLoading, setFormLoading] = useState(false);
   const [formData, setFormData] = useState({
     name: "",
     course_id: "",
     mode: "offline",
     start_date: "",
     end_date: "",
     fees: "",
     max_students: "50",
     schedule: "",
     description: "",
   });
   const { toast } = useToast();
 
   useEffect(() => {
     fetchBatches();
     fetchCourses();
   }, [branchInfo]);
 
   const fetchCourses = async () => {
     const { data } = await supabase
       .from("courses")
       .select("id, name")
       .eq("is_active", true)
       .order("name");
     setCourses(data || []);
   };
 
   const fetchBatches = async () => {
     if (!branchInfo?.id) return;
 
     try {
       const { data, error } = await supabase
         .from("batches")
         .select(`
           *,
           courses(name)
         `)
         .eq("branch_id", branchInfo.id)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
 
       const batchesWithCourse = (data || []).map((b: any) => ({
         ...b,
         course_name: b.courses?.name,
       }));
 
       setBatches(batchesWithCourse);
     } catch (error) {
       console.error("Error fetching batches:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const resetForm = () => {
     setFormData({
       name: "",
       course_id: "",
       mode: "offline",
       start_date: "",
       end_date: "",
       fees: "",
       max_students: "50",
       schedule: "",
       description: "",
     });
     setEditingBatch(null);
   };
 
   const handleEdit = (batch: Batch) => {
     setEditingBatch(batch);
     setFormData({
       name: batch.name,
       course_id: batch.course_id,
       mode: batch.mode,
       start_date: batch.start_date,
       end_date: batch.end_date || "",
       fees: batch.fees.toString(),
       max_students: (batch.max_students || 50).toString(),
       schedule: batch.schedule || "",
       description: batch.description || "",
     });
     setIsDialogOpen(true);
   };
 
   const handleSubmit = async () => {
     if (!branchInfo?.id) return;
     if (!formData.name || !formData.course_id || !formData.start_date || !formData.fees) {
       toast({
         title: "Validation Error",
         description: "Please fill all required fields",
         variant: "destructive",
       });
       return;
     }
 
     setFormLoading(true);
     try {
       const batchData = {
         name: formData.name,
         course_id: formData.course_id,
         branch_id: branchInfo.id,
         mode: formData.mode,
         start_date: formData.start_date,
         end_date: formData.end_date || null,
         fees: parseFloat(formData.fees),
         max_students: parseInt(formData.max_students) || 50,
         schedule: formData.schedule || null,
         description: formData.description || null,
       };
 
       if (editingBatch) {
         const { error } = await supabase
           .from("batches")
           .update(batchData)
           .eq("id", editingBatch.id);
         if (error) throw error;
         toast({ title: "Success", description: "Batch updated successfully" });
       } else {
         const { error } = await supabase.from("batches").insert(batchData);
         if (error) throw error;
         toast({ title: "Success", description: "Batch created successfully" });
       }
 
       setIsDialogOpen(false);
       resetForm();
       fetchBatches();
     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message || "Failed to save batch",
         variant: "destructive",
       });
     } finally {
       setFormLoading(false);
     }
   };
 
   const filteredBatches = batches.filter(
     (b) =>
       b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       b.course_name?.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   if (loading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between gap-4">
         <div>
           <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
             <BookOpen className="w-6 h-6 text-primary" />
             Batch Management
           </h2>
           <p className="text-muted-foreground">Create and manage batches for your branch</p>
         </div>
         <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
           <Plus className="w-4 h-4 mr-2" />
           Add Batch
         </Button>
       </div>
 
       {/* Search */}
       <div className="relative max-w-md">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
         <Input
           placeholder="Search batches..."
           className="pl-10"
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
         />
       </div>
 
       {/* Batches Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filteredBatches.length === 0 ? (
           <div className="col-span-full text-center py-12">
             <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
             <p className="text-muted-foreground">No batches found</p>
           </div>
         ) : (
           filteredBatches.map((batch) => (
             <div key={batch.id} className="card-elevated p-5 space-y-4">
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="font-heading font-semibold text-foreground">{batch.name}</h3>
                   <p className="text-sm text-muted-foreground">{batch.course_name}</p>
                 </div>
                 <Badge variant={batch.is_active ? "default" : "secondary"}>
                   {batch.is_active ? "Active" : "Inactive"}
                 </Badge>
               </div>
 
               <div className="space-y-2 text-sm">
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Calendar className="w-4 h-4" />
                   <span>Starts: {format(new Date(batch.start_date), "MMM d, yyyy")}</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <IndianRupee className="w-4 h-4" />
                   <span>₹{batch.fees.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Users className="w-4 h-4" />
                   <span>Max {batch.max_students} students</span>
                 </div>
               </div>
 
               <Badge variant="outline" className="capitalize">{batch.mode}</Badge>
 
               <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(batch)}>
                 <Edit2 className="w-4 h-4 mr-2" />
                 Edit Batch
               </Button>
             </div>
           ))
         )}
       </div>
 
       {/* Add/Edit Dialog */}
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>{editingBatch ? "Edit Batch" : "Add New Batch"}</DialogTitle>
           </DialogHeader>
 
           <div className="space-y-4">
             <div>
               <Label>Batch Name *</Label>
               <Input
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 placeholder="e.g. Web Development - Batch 1"
               />
             </div>
 
             <div>
               <Label>Course *</Label>
               <Select
                 value={formData.course_id}
                 onValueChange={(value) => setFormData({ ...formData, course_id: value })}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Select course" />
                 </SelectTrigger>
                 <SelectContent>
                   {courses.map((course) => (
                     <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Mode *</Label>
                 <Select
                   value={formData.mode}
                   onValueChange={(value) => setFormData({ ...formData, mode: value })}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="offline">Offline</SelectItem>
                     <SelectItem value="online">Online</SelectItem>
                     <SelectItem value="hybrid">Hybrid</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label>Fees (₹) *</Label>
                 <Input
                   type="number"
                   value={formData.fees}
                   onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                   placeholder="25000"
                 />
               </div>
             </div>
 
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Start Date *</Label>
                 <Input
                   type="date"
                   value={formData.start_date}
                   onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                 />
               </div>
               <div>
                 <Label>End Date</Label>
                 <Input
                   type="date"
                   value={formData.end_date}
                   onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                 />
               </div>
             </div>
 
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Max Students</Label>
                 <Input
                   type="number"
                   value={formData.max_students}
                   onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                 />
               </div>
               <div>
                 <Label>Schedule</Label>
                 <Input
                   value={formData.schedule}
                   onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                   placeholder="Mon-Fri, 10AM-1PM"
                 />
               </div>
             </div>
 
             <div>
               <Label>Description</Label>
               <Textarea
                 value={formData.description}
                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                 placeholder="Batch details..."
                 rows={3}
               />
             </div>
           </div>
 
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
             <Button onClick={handleSubmit} disabled={formLoading}>
               {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingBatch ? "Update" : "Create"}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default BranchBatches;