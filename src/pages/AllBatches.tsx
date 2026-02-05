 import { useState, useEffect } from "react";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { BatchCard } from "@/components/home/BatchCard";
 import { EnrollmentModal } from "@/components/home/EnrollmentModal";
 import { supabase } from "@/integrations/supabase/client";
 import { Input } from "@/components/ui/input";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Search } from "lucide-react";
 
 interface Batch {
   id: string;
   name: string;
   course_name: string;
   branch_name: string;
   start_date: string;
   duration_weeks: number;
   mode: "online" | "offline" | "hybrid";
   fees: number;
   description: string;
   schedule: string;
   thumbnail_url?: string;
 }
 
 export default function AllBatches() {
   const [batches, setBatches] = useState<Batch[]>([]);
   const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
   const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const [modeFilter, setModeFilter] = useState("all");
 
   useEffect(() => {
     fetchBatches();
   }, []);
 
   useEffect(() => {
     let filtered = batches;
     
     if (searchTerm) {
       filtered = filtered.filter(
         (batch) =>
           batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           batch.course_name.toLowerCase().includes(searchTerm.toLowerCase())
       );
     }
     
     if (modeFilter !== "all") {
       filtered = filtered.filter((batch) => batch.mode === modeFilter);
     }
     
     setFilteredBatches(filtered);
   }, [searchTerm, modeFilter, batches]);
 
   const fetchBatches = async () => {
     try {
       const { data, error } = await supabase
         .from("batches")
         .select(`
           id,
           name,
           start_date,
           mode,
           fees,
           description,
           schedule,
           courses (
             name,
             duration_weeks,
             thumbnail_url
           ),
           branches (
             name
           )
         `)
         .eq("is_active", true)
         .order("start_date", { ascending: true });
 
       if (error) throw error;
 
       const formattedBatches: Batch[] = (data || []).map((batch: any) => ({
         id: batch.id,
         name: batch.name,
         course_name: batch.courses?.name || "Course",
         branch_name: batch.branches?.name || "Branch",
         start_date: batch.start_date,
         duration_weeks: batch.courses?.duration_weeks || 12,
         mode: batch.mode as "online" | "offline" | "hybrid",
         fees: parseFloat(batch.fees),
         description: batch.description || "",
         schedule: batch.schedule || "TBD",
         thumbnail_url: batch.courses?.thumbnail_url,
       }));
 
       setBatches(formattedBatches);
       setFilteredBatches(formattedBatches);
     } catch (error) {
       console.error("Error fetching batches:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const handleViewDetails = (id: string) => {
     window.location.href = `/batch/${id}`;
   };
 
   const handleEnroll = (id: string) => {
     const batch = batches.find((b) => b.id === id);
     if (batch) {
       setSelectedBatch(batch);
       setIsEnrollModalOpen(true);
     }
   };
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
       <main className="pt-24 pb-16">
         <div className="container mx-auto px-4 lg:px-8">
           {/* Header */}
           <div className="text-center mb-12">
             <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
               Explore Programs
             </span>
             <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
               All Batches
             </h1>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
               Choose from our comprehensive selection of exam preparation batches
             </p>
           </div>
 
           {/* Filters */}
           <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-xl mx-auto">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input
                 placeholder="Search batches..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10"
               />
             </div>
             <Select value={modeFilter} onValueChange={setModeFilter}>
               <SelectTrigger className="w-full sm:w-[150px]">
                 <SelectValue placeholder="Mode" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Modes</SelectItem>
                 <SelectItem value="online">Online</SelectItem>
                 <SelectItem value="offline">Offline</SelectItem>
                 <SelectItem value="hybrid">Hybrid</SelectItem>
               </SelectContent>
             </Select>
           </div>
 
           {/* Batches Grid */}
           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="h-[400px] rounded-xl bg-muted animate-pulse" />
               ))}
             </div>
           ) : filteredBatches.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredBatches.map((batch) => (
                 <BatchCard
                   key={batch.id}
                   batch={batch}
                   onViewDetails={handleViewDetails}
                   onEnroll={handleEnroll}
                 />
               ))}
             </div>
           ) : (
             <div className="text-center py-16 text-muted-foreground">
               <p>No batches found matching your criteria.</p>
             </div>
           )}
         </div>
       </main>
       <Footer />
 
       <EnrollmentModal
         isOpen={isEnrollModalOpen}
         onClose={() => setIsEnrollModalOpen(false)}
         batch={selectedBatch}
       />
     </div>
   );
 }