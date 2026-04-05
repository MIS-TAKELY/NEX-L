import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Creates a nodemailer transporter using Gmail SMTP over port 465 (SSL).
 *
 * WHY port 465 instead of 587?
 * - Render.com blocks outbound TCP on port 25 and 587 (common SMTP ports).
 * - Port 465 (SMTPS / implicit SSL) is NOT blocked by Render.
 * - Gmail supports port 465 with `secure: true`.
 *
 * SETUP REQUIRED (one-time):
 * 1. Go to your Google Account → Security → 2-Step Verification → App passwords
 * 2. Create an App Password for "Mail" + "Other" (name it NEX-L)
 * 3. Copy the 16-character password (no spaces) into MAIL_PASS in your .env
 * 4. Set MAIL_USER to your Gmail address in .env
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Gmail App Password (16-char, no spaces)
  },
});

/**
 * Sends an email using nodemailer + Gmail SMTP.
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 */
export async function sendEmail({ to, subject, html }) {
  const startTime = Date.now();

  try {
    const info = await transporter.sendMail({
      from: `"NEX-L Support" <${process.env.MAIL_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });

    const duration = Date.now() - startTime;
    console.log(`[Mail] Email sent to ${to} in ${duration}ms. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Mail] Failed to send email to ${to} after ${duration}ms:`, error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}
