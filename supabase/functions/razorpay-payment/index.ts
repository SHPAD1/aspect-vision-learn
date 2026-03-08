import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: any) => {
  console.log(`[RAZORPAY] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

async function getRazorpayKeys(supabaseAdmin: any) {
  const { data, error } = await supabaseAdmin
    .from("payment_settings")
    .select("setting_key, setting_value")
    .in("setting_key", ["razorpay_key_id", "razorpay_key_secret", "razorpay_enabled"]);

  if (error) throw new Error("Failed to fetch payment settings");

  const settings: Record<string, string> = {};
  for (const row of data || []) {
    settings[row.setting_key] = row.setting_value;
  }

  if (settings.razorpay_enabled !== "true") {
    throw new Error("Razorpay payments are not enabled. Please enable from Admin Panel → Payment Settings.");
  }

  if (!settings.razorpay_key_id || !settings.razorpay_key_secret) {
    throw new Error("Razorpay API keys not configured. Please configure from Admin Panel → Payment Settings.");
  }

  return { keyId: settings.razorpay_key_id, keySecret: settings.razorpay_key_secret };
}

async function razorpayRequest(path: string, method: string, keyId: string, keySecret: string, body?: any) {
  const auth = base64Encode(`${keyId}:${keySecret}`);
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    log("Razorpay API error", data);
    throw new Error(data.error?.description || "Razorpay API error");
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { action, batch_id, coupon_code, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    log("Action", { action });

    // TEST action - verify API keys work
    if (action === "test") {
      try {
        const { keyId, keySecret } = await getRazorpayKeys(supabaseAdmin);
        // Try a simple API call to verify keys
        await razorpayRequest("/payments?count=1", "GET", keyId, keySecret);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // CREATE ORDER action
    if (action === "create_order") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Not authenticated");

      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (!userData.user) throw new Error("User not authenticated");

      log("User", { id: userData.user.id });

      // Fetch batch from DB (authoritative price)
      const { data: batch, error: batchErr } = await supabaseAdmin
        .from("batches")
        .select("id, name, fees, course_id, courses(name, discount_percent)")
        .eq("id", batch_id)
        .eq("is_active", true)
        .single();

      if (batchErr || !batch) throw new Error("Invalid or inactive batch");

      let amount = Number(batch.fees);
      const courseDiscount = (batch.courses as any)?.discount_percent || 0;
      if (courseDiscount > 0) {
        amount = amount - (amount * courseDiscount) / 100;
      }

      // Apply coupon if provided
      if (coupon_code) {
        const { data: coupon } = await supabaseAdmin
          .from("discount_coupons")
          .select("*")
          .eq("code", coupon_code.toUpperCase())
          .eq("is_active", true)
          .single();

        if (coupon) {
          const now = new Date();
          const valid = (!coupon.valid_until || new Date(coupon.valid_until) > now) &&
                        (!coupon.max_uses || (coupon.used_count || 0) < coupon.max_uses);
          if (valid) {
            amount = amount - (amount * coupon.discount_percent) / 100;
            log("Coupon applied", { code: coupon.code, discount: coupon.discount_percent });
          }
        }
      }

      amount = Math.round(amount);
      if (amount <= 0) throw new Error("Invalid payment amount");

      const { keyId, keySecret } = await getRazorpayKeys(supabaseAdmin);

      // Create Razorpay order
      const order = await razorpayRequest("/orders", "POST", keyId, keySecret, {
        amount: amount * 100, // paise
        currency: "INR",
        receipt: `batch_${batch_id.substring(0, 8)}_${Date.now()}`,
        notes: {
          batch_id,
          user_id: userData.user.id,
          batch_name: batch.name,
          course_name: (batch.courses as any)?.name || "",
        },
      });

      log("Order created", { orderId: order.id, amount });

      // Fetch profile for prefill
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email, phone")
        .eq("user_id", userData.user.id)
        .single();

      return new Response(
        JSON.stringify({
          order_id: order.id,
          amount: amount,
          currency: "INR",
          key_id: keyId,
          batch_name: batch.name,
          course_name: (batch.courses as any)?.name || "",
          prefill: {
            name: profile?.full_name || "",
            email: profile?.email || userData.user.email || "",
            contact: profile?.phone || "",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // VERIFY PAYMENT action
    if (action === "verify_payment") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Not authenticated");

      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (!userData.user) throw new Error("User not authenticated");

      const { keyId, keySecret } = await getRazorpayKeys(supabaseAdmin);

      // Verify signature using HMAC SHA256
      const encoder = new TextEncoder();
      const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
      const keyData = encoder.encode(keySecret);
      const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
      const generatedSignature = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (generatedSignature !== razorpay_signature) {
        log("Signature mismatch");
        throw new Error("Payment verification failed - signature mismatch");
      }

      log("Signature verified");

      // Fetch order details to get batch info
      const orderDetails = await razorpayRequest(`/orders/${razorpay_order_id}`, "GET", keyId, keySecret);
      const batchIdFromOrder = orderDetails.notes?.batch_id;

      if (!batchIdFromOrder) throw new Error("Batch info missing from order");

      // Get student record
      const { data: student } = await supabaseAdmin
        .from("students")
        .select("id")
        .eq("user_id", userData.user.id)
        .single();

      if (!student) throw new Error("Student record not found");

      // Record payment
      const { error: payErr } = await supabaseAdmin.from("payments").insert({
        student_id: student.id,
        batch_id: batchIdFromOrder,
        amount: orderDetails.amount / 100,
        payment_method: "razorpay",
        transaction_id: razorpay_payment_id,
        status: "completed",
        notes: `Razorpay Order: ${razorpay_order_id}`,
      });

      if (payErr) log("Payment insert error", payErr);

      // Create enrollment
      const { error: enrollErr } = await supabaseAdmin.from("student_enrollments").insert({
        student_id: student.id,
        batch_id: batchIdFromOrder,
        fees_paid: orderDetails.amount / 100,
        status: "active",
      });

      if (enrollErr) log("Enrollment insert error", enrollErr);

      // Update coupon usage if applicable
      if (coupon_code) {
        await supabaseAdmin
          .from("discount_coupons")
          .update({ used_count: supabaseAdmin.rpc ? undefined : 0 })
          .eq("code", coupon_code.toUpperCase());
      }

      log("Payment verified and recorded", { paymentId: razorpay_payment_id });

      return new Response(
        JSON.stringify({ success: true, message: "Payment verified and enrollment completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    log("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
