import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BatchCard } from "./BatchCard";
import { EnrollmentModal } from "./EnrollmentModal";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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

export function BatchesSection() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

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
        .order("start_date", { ascending: true })
        .limit(6);

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
    <section id="batches" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            Upcoming Batches
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Start Learning Today
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our curated selection of industry-focused courses taught by experienced professionals.
          </p>
        </div>

        {/* Batches Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[400px] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : batches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {batches.map((batch) => (
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
            <p>No batches available at the moment. Check back soon!</p>
          </div>
        )}

        {/* View All Button */}
        {batches.length > 0 && (
          <div className="text-center">
            <Link to="/batches">
              <Button variant="outline" size="lg" className="group">
                View All Batches
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        batch={selectedBatch}
      />
    </section>
  );
}