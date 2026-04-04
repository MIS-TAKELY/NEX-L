import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  pool: true, // Use connection pooling for reused SMTP connections
  host: "smtp.gmail.com",
  port: 465, // Use port 465 for SSL/TLS as it's more reliable on Render
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 10000, // 10 seconds timeout for initial connection
  greetingTimeout: 10000, // 10 seconds timeout for server greeting
});

// Verify connection configuration - non-blocking to avoid startup timeouts on Render
transporter.verify()
  .then(() => console.log("Transporter is ready to take our messages"))
  .catch((error) => console.warn("Transporter connection warning (Check SMTP ports on Render):", error.message));

export async function sendEmail({ to, subject, html }) {
  const startTime = Date.now();
  await transporter.sendMail({
    from: `"NEXL Support" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });

  const duration = Date.now() - startTime;
  console.log(`Email sent to ${to} in ${duration}ms`);
}
