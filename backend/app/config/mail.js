import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.MAIL_USER, // 'resend'
    pass: process.env.MAIL_PASS, // Your Resend API Key
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

// Verify connection configuration - non-blocking to avoid startup timeouts on Render
transporter.verify()
  .then(() => console.log("Resend SMTP is ready to take our messages"))
  .catch((error) => console.warn("Resend connection warning:", error.message));

export async function sendEmail({ to, subject, html }) {
  const startTime = Date.now();
  await transporter.sendMail({
    from: "NEXL Support <onboarding@resend.dev>", // Using onboarding address for free tier
    to,
    subject,
    html,
  });

  const duration = Date.now() - startTime;
  console.log(`Email sent to ${to} via Resend in ${duration}ms`);
}
