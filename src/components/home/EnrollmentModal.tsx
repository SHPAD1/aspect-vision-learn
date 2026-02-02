import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: {
    id: string;
    name: string;
    course_name: string;
  } | null;
}

const enrollmentSchema = z.object({
  studentName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email is too long"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Invalid phone number (10 digits starting with 6-9)"),
  city: z.string().trim().min(2, "City must be at least 2 characters").max(100, "City is too long"),
});

export function EnrollmentModal({ isOpen, onClose, batch }: EnrollmentModalProps) {
  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    phone: "",
    city: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  if (!isOpen || !batch) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = enrollmentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("enrollment_leads").insert({
        batch_id: batch.id,
        student_name: formData.studentName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        status: "new",
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Enrollment Submitted!",
        description: "Our team will contact you shortly.",
      });

      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ studentName: "", email: "", phone: "", city: "" });
        onClose();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">
              Thank You!
            </h3>
            <p className="text-muted-foreground">
              Your enrollment request has been submitted. We'll contact you soon!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold text-foreground mb-1">
                Enroll Now
              </h3>
              <p className="text-sm text-muted-foreground">
                {batch.course_name} - {batch.name}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="studentName">Full Name *</Label>
                <Input
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.studentName ? "border-destructive" : ""}
                />
                {errors.studentName && (
                  <p className="text-xs text-destructive mt-1">{errors.studentName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Mobile Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Your city"
                  className={errors.city ? "border-destructive" : ""}
                />
                {errors.city && (
                  <p className="text-xs text-destructive mt-1">{errors.city}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Enrollment"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By submitting, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}