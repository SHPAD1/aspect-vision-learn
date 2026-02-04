import { useState, useEffect } from "react";
import { FileText, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfWeek, endOfWeek } from "date-fns";

const SalesReport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({
    totalLeads: 0,
    contacted: 0,
    enrolled: 0,
    pending: 0,
  });
  const [formData, setFormData] = useState({
    calls_made: "",
    demos_given: "",
    challenges: "",
    next_week_plan: "",
    additional_notes: "",
  });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  useEffect(() => {
    fetchWeeklyStats();
  }, []);

  const fetchWeeklyStats = async () => {
    try {
      const { data: leads, error } = await supabase
        .from("enrollment_leads")
        .select("*")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString());

      if (error) throw error;

      const allLeads = leads || [];
      setWeeklyStats({
        totalLeads: allLeads.length,
        contacted: allLeads.filter(
          (l) => l.status === "contacted" || l.status === "follow_up"
        ).length,
        enrolled: allLeads.filter((l) => l.status === "enrolled").length,
        pending: allLeads.filter((l) => l.status === "new").length,
      });
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.calls_made || !formData.demos_given) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // In a real app, you would save this to a reports table
    // For now, we'll just simulate the submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Report Submitted",
        description: "Your weekly report has been submitted successfully",
      });
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Weekly Report
          </h2>
        </div>

        <div className="card-elevated p-12 text-center max-w-2xl mx-auto">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-foreground mb-2">
            Report Submitted Successfully!
          </h3>
          <p className="text-muted-foreground mb-6">
            Your weekly report for {format(weekStart, "dd MMM")} -{" "}
            {format(weekEnd, "dd MMM yyyy")} has been submitted.
          </p>
          <Button onClick={() => setSubmitted(false)}>
            Submit Another Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Weekly Report
        </h2>
        <p className="text-muted-foreground">
          Week of {format(weekStart, "dd MMM")} - {format(weekEnd, "dd MMM yyyy")}
        </p>
      </div>

      {/* Auto Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {weeklyStats.totalLeads}
          </p>
          <p className="text-sm text-muted-foreground">Total Leads</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl font-bold text-warning">
            {weeklyStats.contacted}
          </p>
          <p className="text-sm text-muted-foreground">Contacted</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl font-bold text-success">
            {weeklyStats.enrolled}
          </p>
          <p className="text-sm text-muted-foreground">Enrolled</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl font-bold text-info">{weeklyStats.pending}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
      </div>

      {/* Report Form */}
      <div className="card-elevated p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calls_made">Total Calls Made *</Label>
              <Input
                id="calls_made"
                type="number"
                value={formData.calls_made}
                onChange={(e) =>
                  setFormData({ ...formData, calls_made: e.target.value })
                }
                placeholder="Enter number"
              />
            </div>
            <div>
              <Label htmlFor="demos_given">Demos/Counseling Given *</Label>
              <Input
                id="demos_given"
                type="number"
                value={formData.demos_given}
                onChange={(e) =>
                  setFormData({ ...formData, demos_given: e.target.value })
                }
                placeholder="Enter number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="challenges">Challenges Faced</Label>
            <Textarea
              id="challenges"
              value={formData.challenges}
              onChange={(e) =>
                setFormData({ ...formData, challenges: e.target.value })
              }
              placeholder="Describe any challenges you faced this week..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="next_week_plan">Next Week Plan</Label>
            <Textarea
              id="next_week_plan"
              value={formData.next_week_plan}
              onChange={(e) =>
                setFormData({ ...formData, next_week_plan: e.target.value })
              }
              placeholder="What's your plan for next week?"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="additional_notes">Additional Notes</Label>
            <Textarea
              id="additional_notes"
              value={formData.additional_notes}
              onChange={(e) =>
                setFormData({ ...formData, additional_notes: e.target.value })
              }
              placeholder="Any other comments or feedback..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Submit Weekly Report
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SalesReport;
