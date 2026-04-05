import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  const startTime = Date.now();

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || "NEX-L Support <onboarding@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    const duration = Date.now() - startTime;
    console.log(`[Mail] Email sent to ${to} in ${duration}ms. Id: ${data.id}`);
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Mail] Failed to send email to ${to} after ${duration}ms:`, error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}
