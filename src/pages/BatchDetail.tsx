import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, Clock, MapPin, Users, IndianRupee, ArrowLeft, 
  BookOpen, Video, FileText, CheckCircle, Percent 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BatchDetail {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  mode: string;
  fees: number;
  schedule: string | null;
  max_students: number | null;
  course: {
    name: string;
    description: string | null;
    duration_weeks: number;
    thumbnail_url: string | null;
    discount_percent: number | null;
  };
  branch: {
    name: string;
    city: string;
    address: string | null;
  };
}

const modeConfig: Record<string, { label: string; className: string }> = {
  online: { label: "Online", className: "bg-green-100 text-green-700" },
  offline: { label: "Offline", className: "bg-blue-100 text-blue-700" },
  hybrid: { label: "Hybrid", className: "bg-purple-100 text-purple-700" },
};

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchBatch();
  }, [id]);

  const fetchBatch = async () => {
    try {
      const { data, error } = await supabase
        .from("batches")
        .select(`
          id, name, description, start_date, end_date, mode, fees, schedule, max_students,
          courses (name, description, duration_weeks, thumbnail_url, discount_percent),
          branches (name, city, address)
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      
      if (data) {
        setBatch({
          ...data,
          course: data.courses as any,
          branch: data.branches as any,
        });
      }
    } catch (error) {
      console.error("Error fetching batch:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDiscountedPrice = (price: number, discount: number | null) => {
    if (!discount || discount <= 0) return price;
    return price - (price * discount) / 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="h-8 w-32 bg-muted animate-pulse rounded mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-[400px] bg-muted animate-pulse rounded-2xl" />
                <div className="h-32 bg-muted animate-pulse rounded-xl" />
              </div>
              <div className="h-[300px] bg-muted animate-pulse rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Batch Not Found</h1>
            <p className="text-muted-foreground mb-6">The batch you're looking for doesn't exist or is no longer available.</p>
            <Link to="/batches">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                View All Batches
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discountedPrice = getDiscountedPrice(batch.fees, batch.course.discount_percent);
  const hasDiscount = batch.course.discount_percent && batch.course.discount_percent > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Button */}
          <Link to="/batches" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Batches
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <div className="aspect-video rounded-2xl overflow-hidden relative">
                <img
                  src={batch.course.thumbnail_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200"}
                  alt={batch.course.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <Badge className={modeConfig[batch.mode]?.className || "bg-muted"}>
                      {modeConfig[batch.mode]?.label || batch.mode}
                    </Badge>
                    {hasDiscount && (
                      <Badge className="ml-2 bg-destructive text-destructive-foreground">
                        <Percent className="w-3 h-3 mr-1" />
                        {batch.course.discount_percent}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm font-medium text-primary mb-2">{batch.course.name}</p>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {batch.name}
                </h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Starts {formatDate(batch.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{batch.course.duration_weeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{batch.branch.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Max {batch.max_students || 50} students</span>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Description */}
                <div className="space-y-4">
                  <h2 className="font-heading text-lg font-semibold text-foreground">About This Batch</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {batch.description || batch.course.description || "Comprehensive coaching program designed to help you succeed in your competitive examination journey. Our expert faculty and structured curriculum ensure thorough preparation."}
                  </p>
                </div>

                <Separator className="my-6" />

                {/* What's Included */}
                <div className="space-y-4">
                  <h2 className="font-heading text-lg font-semibold text-foreground">What's Included</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: Video, text: "Live Interactive Classes" },
                      { icon: FileText, text: "Comprehensive Study Material" },
                      { icon: BookOpen, text: "Previous Year Papers" },
                      { icon: CheckCircle, text: "Regular Mock Tests" },
                      { icon: Users, text: "Doubt Clearing Sessions" },
                      { icon: Clock, text: "Recorded Lectures Access" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <item.icon className="w-5 h-5 text-primary" />
                        <span className="text-sm text-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                {batch.schedule && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <h2 className="font-heading text-lg font-semibold text-foreground">Class Schedule</h2>
                      <p className="text-muted-foreground">{batch.schedule}</p>
                    </div>
                  </>
                )}

                {/* Branch Info */}
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h2 className="font-heading text-lg font-semibold text-foreground">Location</h2>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium text-foreground">{batch.branch.name}</p>
                    {batch.branch.address && (
                      <p className="text-sm text-muted-foreground mt-1">{batch.branch.address}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{batch.branch.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Pricing Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Course Fee</p>
                  {hasDiscount ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-heading text-3xl font-bold text-foreground">
                          {formatCurrency(discountedPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-muted-foreground line-through">
                          {formatCurrency(batch.fees)}
                        </span>
                        <Badge className="bg-destructive/10 text-destructive">
                          Save {formatCurrency(batch.fees - discountedPrice)}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <span className="font-heading text-3xl font-bold text-foreground">
                      {formatCurrency(batch.fees)}
                    </span>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate(`/payment/${batch.id}`)}
                >
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Instant access after payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>EMI options available</span>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Need help? Call us at{" "}
                    <a href="tel:+919472070758" className="text-primary font-medium">
                      +91 9472070758
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
