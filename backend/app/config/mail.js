import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Use built-in Gmail service configuration
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Uses 16-character App Password
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  tls: {
    rejectUnauthorized: false, // Bypass potential cert issues on data center local network
  },
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
