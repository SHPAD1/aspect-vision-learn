import { useState, useEffect, useRef } from "react";
import { IdCard, Download, QrCode, User, Calendar, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface StudentData {
  student_id: string;
  enrollment_date: string;
  branch?: {
    name: string;
    city: string;
  };
  profile?: {
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string;
  };
}

const StudentIDCard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const { data: student, error } = await supabase
        .from("students")
        .select(`
          student_id,
          enrollment_date,
          branch:branches (
            name,
            city
          )
        `)
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone, avatar_url")
        .eq("user_id", user?.id)
        .single();

      if (student) {
        setStudentData({
          ...student,
          profile: profile || {
            full_name: user?.user_metadata?.full_name || "Student",
            email: user?.email || "",
            phone: "",
            avatar_url: "",
          },
        } as StudentData);
      } else {
        // No student record, use profile data
        setStudentData({
          student_id: "TEMP-" + user?.id?.slice(0, 8).toUpperCase(),
          enrollment_date: new Date().toISOString(),
          profile: profile || {
            full_name: user?.user_metadata?.full_name || "Student",
            email: user?.email || "",
            phone: "",
            avatar_url: "",
          },
        } as StudentData);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // In production, use html2canvas or similar to generate image
    alert("Download functionality would generate a PNG/PDF of the ID card");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Student ID Card</h1>
        <p className="text-muted-foreground">Your digital student identification</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ID Card - Front */}
        <div className="w-full max-w-md">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Front</h3>
          <div
            ref={cardRef}
            className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-2xl aspect-[1.6/1] overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <IdCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold">Aspect Vision</p>
                    <p className="text-xs opacity-80">Student ID Card</p>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center">
                  {/* QR Code placeholder */}
                  <QrCode className="w-12 h-12 text-primary" />
                </div>
              </div>

              {/* Student Info */}
              <div className="flex items-end gap-4">
                <div className="w-20 h-24 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden">
                  {studentData?.profile?.avatar_url ? (
                    <img 
                      src={studentData.profile.avatar_url} 
                      alt="Student" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-heading text-xl font-bold truncate">
                    {studentData?.profile?.full_name}
                  </p>
                  <p className="text-sm opacity-80 mb-1">
                    ID: {studentData?.student_id}
                  </p>
                  <div className="flex items-center gap-4 text-xs opacity-80">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {studentData?.enrollment_date && 
                        format(new Date(studentData.enrollment_date), "MMM yyyy")}
                    </span>
                    {studentData?.branch && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {studentData.branch.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ID Card - Back */}
        <div className="w-full max-w-md">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Back</h3>
          <div className="relative bg-muted rounded-2xl p-6 shadow-lg aspect-[1.6/1] border border-border">
            <div className="h-full flex flex-col justify-between">
              {/* Info Section */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium text-foreground">
                    {studentData?.profile?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <span className="text-sm font-medium text-foreground">
                    {studentData?.profile?.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Branch:</span>
                  <span className="text-sm font-medium text-foreground">
                    {studentData?.branch?.name || "Online"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valid Till:</span>
                  <span className="text-sm font-medium text-foreground">
                    Dec 2026
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  This card is the property of Aspect Vision. If found, please return to the nearest branch or contact support@aspectvision.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download as PNG
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download as PDF
        </Button>
      </div>

      {/* Instructions */}
      <div className="card-elevated p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
          About Your ID Card
        </h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Your digital ID card can be used for identity verification at any Aspect Vision branch
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            The QR code contains your unique student ID for quick verification
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Download and save the card on your phone for easy access
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Report lost or stolen ID cards immediately to support
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StudentIDCard;
