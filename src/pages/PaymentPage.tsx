import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { IndianRupee, ArrowLeft, CreditCard, Wallet, Building2, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface BatchInfo {
  id: string;
  name: string;
  fees: number;
  course: { name: string; discount_percent: number | null };
}

export default function PaymentPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [batch, setBatch] = useState<BatchInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("online");

  useEffect(() => {
    if (batchId) fetchBatch();
  }, [batchId]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to continue with payment");
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const fetchBatch = async () => {
    try {
      const { data, error } = await supabase
        .from("batches")
        .select(`id, name, fees, courses (name, discount_percent)`)
        .eq("id", batchId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      if (data) {
        setBatch({
          ...data,
          course: data.courses as any,
        });
      }
    } catch (error) {
      console.error("Error fetching batch:", error);
    } finally {
      setLoading(false);
    }
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

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("discount_coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error("Invalid or expired coupon code");
        return;
      }

      // Check if coupon is still valid
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        toast.error("This coupon has expired");
        return;
      }

      // Check usage limit
      if (data.max_uses && data.used_count >= data.max_uses) {
        toast.error("This coupon has reached its usage limit");
        return;
      }

      setAppliedCoupon({ code: data.code, discount: data.discount_percent });
      toast.success(`Coupon applied! ${data.discount_percent}% discount added`);
    } catch (error) {
      toast.error("Failed to apply coupon");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handlePayment = async () => {
    if (!user || !batch) return;

    setProcessing(true);
    try {
      // Calculate final amount
      let amount = getDiscountedPrice(batch.fees, batch.course.discount_percent);
      if (appliedCoupon) {
        amount = amount - (amount * appliedCoupon.discount) / 100;
      }

      // For demo purposes, we'll create a pending payment record
      // In production, integrate with payment gateway like Razorpay
      
      toast.success("Redirecting to payment gateway...");
      
      // Simulate payment gateway redirect
      setTimeout(() => {
        toast.success("Payment successful! You are now enrolled.");
        navigate("/dashboard/courses");
      }, 2000);
      
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="h-[400px] bg-muted animate-pulse rounded-2xl" />
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

  const basePrice = batch.fees;
  const courseDiscount = batch.course.discount_percent || 0;
  const priceAfterCourseDiscount = getDiscountedPrice(basePrice, courseDiscount);
  const couponDiscountAmount = appliedCoupon ? (priceAfterCourseDiscount * appliedCoupon.discount) / 100 : 0;
  const finalPrice = priceAfterCourseDiscount - couponDiscountAmount;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Back Button */}
          <Link to={`/batch/${batchId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Batch Details
          </Link>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
                  Complete Your Enrollment
                </h1>

                {/* Coupon Code */}
                <div className="space-y-4 mb-6">
                  <Label>Have a coupon code?</Label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">
                          {appliedCoupon.code} - {appliedCoupon.discount}% off applied
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={removeCoupon}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={applyCoupon}>
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <Label>Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer">
                      <RadioGroupItem value="online" id="online" />
                      <label htmlFor="online" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">Online Payment</p>
                            <p className="text-sm text-muted-foreground">Credit/Debit Card, UPI, Net Banking</p>
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <label htmlFor="wallet" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">UPI / Wallet</p>
                            <p className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm</p>
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer">
                      <RadioGroupItem value="emi" id="emi" />
                      <label htmlFor="emi" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">EMI Options</p>
                            <p className="text-sm text-muted-foreground">Easy monthly installments</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-heading text-lg font-semibold text-foreground">Order Summary</h2>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">{batch.course.name}</p>
                  <p className="font-medium text-foreground">{batch.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course Fee</span>
                    <span className="text-foreground">{formatCurrency(basePrice)}</span>
                  </div>
                  
                  {courseDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Course Discount ({courseDiscount}%)</span>
                      <span className="text-green-600">-{formatCurrency(basePrice - priceAfterCourseDiscount)}</span>
                    </div>
                  )}
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Coupon ({appliedCoupon.discount}%)</span>
                      <span className="text-green-600">-{formatCurrency(couponDiscountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-heading text-2xl font-bold text-primary">
                      {formatCurrency(finalPrice)}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IndianRupee className="w-4 h-4 mr-2" />
                      Pay {formatCurrency(finalPrice)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By proceeding, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
