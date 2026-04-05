import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

 
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "mailitttome@gmail.com",
    pass: "cqxaeszfinflvqot", 
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
