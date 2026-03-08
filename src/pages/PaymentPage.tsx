import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { sendPaymentEmail, sendEnrollmentEmail } from "@/lib/emailUtils";
import { IndianRupee, ArrowLeft, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BatchInfo {
  id: string;
  name: string;
  fees: number;
  course: { name: string; discount_percent: number | null };
}

declare global {
  interface Window {
    Razorpay: any;
  }
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
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (batchId) fetchBatch();
    loadRazorpayScript();
  }, [batchId]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to continue with payment");
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const loadRazorpayScript = () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => toast.error("Failed to load payment gateway");
    document.body.appendChild(script);
  };

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
        setBatch({ ...data, course: data.courses as any });
      }
    } catch (error) {
      console.error("Error fetching batch:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

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

      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        toast.error("This coupon has expired");
        return;
      }

      if (data.max_uses && (data.used_count ?? 0) >= data.max_uses) {
        toast.error("This coupon has reached its usage limit");
        return;
      }

      setAppliedCoupon({ code: data.code, discount: data.discount_percent });
      toast.success(`Coupon applied! ${data.discount_percent}% discount added`);
    } catch {
      toast.error("Failed to apply coupon");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handlePayment = async () => {
    if (!user || !batch || !razorpayLoaded) return;

    setProcessing(true);
    try {
      // Create order via edge function
      const { data: orderData, error: orderErr } = await supabase.functions.invoke("razorpay-payment", {
        body: {
          action: "create_order",
          batch_id: batch.id,
          coupon_code: appliedCoupon?.code || null,
        },
      });

      if (orderErr || orderData?.error) {
        throw new Error(orderData?.error || orderErr?.message || "Failed to create order");
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: "Aspect Vision",
        description: `${orderData.course_name} - ${orderData.batch_name}`,
        order_id: orderData.order_id,
        prefill: orderData.prefill,
        theme: { color: "#6366f1" },
        handler: async (response: any) => {
          // Verify payment
          try {
            const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("razorpay-payment", {
              body: {
                action: "verify_payment",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                batch_id: batch.id,
                coupon_code: appliedCoupon?.code || null,
              },
            });

            if (verifyErr || verifyData?.error) {
              throw new Error(verifyData?.error || "Verification failed");
            }

            toast.success("Payment successful! You are now enrolled.");

            // Send confirmation emails (non-blocking)
            const userEmail = user?.email || "";
            const userName = user?.user_metadata?.full_name || "Student";
            sendPaymentEmail(userEmail, userName, orderData.amount / 100, response.razorpay_payment_id, batch.name).catch(() => {});
            sendEnrollmentEmail(userEmail, userName, batch.name, batch.course.name, batch.fees).catch(() => {});

            navigate("/dashboard/courses?payment=success");
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || "Payment failed. Please try again.");
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

                {/* Payment Method Info */}
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Razorpay Secure Payment</p>
                      <p className="text-sm text-muted-foreground">
                        Credit/Debit Card, UPI, Net Banking, Wallets
                      </p>
                    </div>
                  </div>
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

                <Button className="w-full" size="lg" onClick={handlePayment} disabled={processing || !razorpayLoaded}>
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
                  Secured by Razorpay. By proceeding, you agree to our Terms of Service.
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
