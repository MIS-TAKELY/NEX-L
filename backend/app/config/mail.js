import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_API_KEY = process.env.MAIL_PASS; // Using the API key from your env

/**
 * Sends an email using the Resend REST API (HTTPS).
 * This bypasses SMTP port blocks on hosting providers like Render.
 */
export async function sendEmail({ to, subject, html }) {
  const startTime = Date.now();
  
  try {
    const response = await axios.post(
      RESEND_API_URL,
      {
        from: "NEXL Support <onboarding@resend.dev>",
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
      },
      {
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const duration = Date.now() - startTime;
    console.log(`Email sent to ${to} via Resend API in ${duration}ms. ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`Failed to send email to ${to} via Resend API after ${duration}ms:`, errorMessage);
    throw new Error(`Email sending failed: ${errorMessage}`);
  }
}
