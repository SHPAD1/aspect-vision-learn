import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getEmailSettings(supabaseAdmin: any) {
  const { data, error } = await supabaseAdmin
    .from("payment_settings")
    .select("setting_key, setting_value")
    .in("setting_key", [
      "smtp_email",
      "smtp_app_password",
      "company_name",
      "company_signature",
      "email_enabled",
    ]);

  if (error) throw new Error("Failed to fetch email settings");

  const settings: Record<string, string> = {};
  for (const row of data || []) {
    settings[row.setting_key] = row.setting_value;
  }

  if (!settings.smtp_email || !settings.smtp_app_password) {
    throw new Error("Email not configured. Please set up SMTP credentials in Admin → Email Settings.");
  }

  if (settings.email_enabled !== "true") {
    throw new Error("Email service is disabled. Enable it in Admin → Email Settings.");
  }

  return settings;
}

function buildFormalTemplate(
  subject: string,
  body: string,
  companyName: string,
  signature: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#0d9488;padding:24px 32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;">${companyName}</h1>
            </td>
          </tr>
          <!-- Subject Bar -->
          <tr>
            <td style="padding:20px 32px 0 32px;">
              <h2 style="color:#1a1a2e;margin:0 0 4px 0;font-size:18px;font-weight:600;">${subject}</h2>
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:12px 0;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:8px 32px 20px 32px;color:#333333;font-size:14px;line-height:1.7;">
              ${body}
            </td>
          </tr>
          <!-- Signature -->
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 16px 0;" />
              <p style="color:#666666;font-size:13px;line-height:1.6;margin:0;white-space:pre-line;">${signature}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e5e5;">
              <p style="color:#999999;font-size:11px;margin:0;">
                This is an automated email from ${companyName}. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, to, subject, body, recipients, email_type } = await req.json();

    const settings = await getEmailSettings(supabaseAdmin);
    const companyName = settings.company_name || "Aspect Vision";
    const signature = settings.company_signature || "Best Regards,\nAspect Vision Team";

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: settings.smtp_email,
          password: settings.smtp_app_password,
        },
      },
    });

    if (action === "test") {
      const html = buildFormalTemplate(
        "Test Email - Configuration Verified",
        `<p>Dear Administrator,</p>
        <p>This is a test email to confirm that your email configuration is working correctly.</p>
        <p>Your SMTP settings have been verified successfully. All automated emails will be sent from <strong>${settings.smtp_email}</strong>.</p>
        <p>Email features now active:</p>
        <ul style="color:#333333;">
          <li>Student ID Creation Notifications</li>
          <li>Enrollment Confirmation Emails</li>
          <li>Payment Receipt Emails</li>
          <li>Notice & Announcement Emails</li>
        </ul>`,
        companyName,
        signature
      );

      await client.send({
        from: settings.smtp_email,
        to: to,
        subject: `[${companyName}] Test Email - Configuration Verified`,
        html: html,
      });

      await client.close();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send_notice") {
      const html = buildFormalTemplate(subject, body, companyName, signature);
      const toList = Array.isArray(recipients) ? recipients : [to];

      for (const recipient of toList) {
        if (!recipient) continue;
        try {
          await client.send({
            from: settings.smtp_email,
            to: recipient,
            subject: `[${companyName}] ${subject}`,
            html: html,
          });
        } catch (err) {
          console.error(`Failed to send to ${recipient}:`, err);
        }
      }

      await client.close();
      return new Response(
        JSON.stringify({ success: true, sent_to: toList.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "send_event") {
      // For automated event emails (enrollment, payment, ID creation)
      const html = buildFormalTemplate(subject, body, companyName, signature);

      await client.send({
        from: settings.smtp_email,
        to: to,
        subject: `[${companyName}] ${subject}`,
        html: html,
      });

      await client.close();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await client.close();
    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
