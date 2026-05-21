import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


export const SUPPORT_EMAIL = "mailitttome@gmail.com";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: SUPPORT_EMAIL,
    pass: "cqxaeszfinflvqot",
  },
});

export async function sendEmail({ to, subject, html }) {
  const startTime = Date.now();

  try {
    const info = await transporter.sendMail({
      from: `"NEX-L Support" <${process.env.MAIL_USER || SUPPORT_EMAIL}>`,
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