import { useState, useEffect } from "react";
import { Plus, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Batch {
  id: string;
  name: string;
  course: { name: string } | null;
}

const SalesEntry = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_name: "",
    email: "",
    phone: "",
    city: "",
    batch_id: "",
    notes: "",
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from("batches")
        .select("id, name, courses(name)")
        .eq("is_active", true);

      if (error) throw error;
      setBatches(
        (data || []).map((b) => ({
          ...b,
          course: b.courses,
        }))
      );
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_name || !formData.email || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Name, email, and phone are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("enrollment_leads").insert({
        student_name: formData.student_name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city || null,
        batch_id: formData.batch_id || null,
        notes: formData.notes || null,
        status: "new",
        assigned_to: user?.id || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Lead added successfully" });
      setFormData({
        student_name: "",
        email: "",
        phone: "",
        city: "",
        batch_id: "",
        notes: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add lead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <Plus className="w-6 h-6 text-primary" />
          Sales Entry
        </h2>
        <p className="text-muted-foreground">Add a new lead manually</p>
      </div>

      <div className="card-elevated p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student_name">Student Name *</Label>
              <Input
                id="student_name"
                value={formData.student_name}
                onChange={(e) =>
                  setFormData({ ...formData, student_name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="student@example.com"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Enter city"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="batch">Interested Batch</Label>
            <Select
              value={formData.batch_id}
              onValueChange={(value) =>
                setFormData({ ...formData, batch_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select batch (optional)" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.course?.name} - {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any notes about this lead..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Lead
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SalesEntry;
