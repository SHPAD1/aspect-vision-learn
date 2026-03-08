import { supabase } from "@/integrations/supabase/client";

/**
 * Send automated email on specific events
 * Called from various parts of the app when events occur
 */
export const sendEventEmail = async (
  to: string,
  subject: string,
  bodyHtml: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        action: "send_event",
        to,
        subject,
        body: bodyHtml,
      },
    });

    if (error) {
      console.error("Email send error:", error);
      return false;
    }
    return data?.success || false;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
};

// Pre-built email templates for common events

export const sendEnrollmentEmail = async (
  studentEmail: string,
  studentName: string,
  batchName: string,
  courseName: string,
  fees: number
) => {
  const body = `<p>Dear <strong>${studentName}</strong>,</p>
    <p>We are pleased to confirm your enrollment in the following course:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background-color:#f0fdfa;">
        <td style="padding:10px 16px;border:1px solid #e5e5e5;font-weight:600;">Course</td>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;">${courseName}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;font-weight:600;">Batch</td>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;">${batchName}</td>
      </tr>
      <tr style="background-color:#f0fdfa;">
        <td style="padding:10px 16px;border:1px solid #e5e5e5;font-weight:600;">Fees</td>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;">₹${fees.toLocaleString()}</td>
      </tr>
    </table>
    <p>Please ensure you complete all necessary formalities at the earliest.</p>
    <p>We wish you the very best in your learning journey.</p>`;

  return sendEventEmail(studentEmail, "Enrollment Confirmation", body);
};

export const sendPaymentEmail = async (
  studentEmail: string,
  studentName: string,
  amount: number,
  transactionId: string,
  batchName: string
) => {
  const body = `<p>Dear <strong>${studentName}</strong>,</p>
    <p>We have received your payment. Here are the details:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background-color:#f0fdfa;">
        <td style="padding:10px 16px;border:1px solid #e5e5e5;font-weight:600;">Amount</td>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;">₹${amount.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;font-weight:600;">Transaction ID</td>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;">${transactionId}</td>
      </tr>
      <tr style="background-color:#f0fdfa;">
        <td style="padding:10px 16px;border:1px solid #e5e5e5;font-weight:600;">Batch</td>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;">${batchName}</td>
      </tr>
    </table>
    <p>This email serves as your payment receipt. Please save it for your records.</p>`;

  return sendEventEmail(studentEmail, "Payment Confirmation", body);
};

export const sendIDCreationEmail = async (
  email: string,
  name: string,
  studentId: string,
  branchName: string
) => {
  const body = `<p>Dear <strong>${name}</strong>,</p>
    <p>Your Student ID has been successfully created. Here are your details:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background-color:#f0fdfa;">
        <td style="padding:10px 16px;border:1px solid #e5e5e5;font-weight:600;">Student ID</td>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;font-weight:700;color:#0d9488;">${studentId}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;font-weight:600;">Name</td>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;">${name}</td>
      </tr>
      <tr style="background-color:#f0fdfa;">
        <td style="padding:10px 16px;border:1px solid #e5e5e5;font-weight:600;">Branch</td>
        <td style="padding:10px 16px;border:1px solid #e5e5e5;">${branchName}</td>
      </tr>
    </table>
    <p>You can view and download your digital ID card from your student dashboard.</p>
    <p>Please keep your Student ID safe and present it when required.</p>`;

  return sendEventEmail(email, "Student ID Created", body);
};
