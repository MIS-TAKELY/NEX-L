import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify connection configuration - non-blocking to avoid startup timeouts on Render
transporter.verify()
  .then(() => console.log("Transporter is ready to take our messages"))
  .catch((error) => console.warn("Transporter connection warning (Check SMTP ports on Render):", error.message));

export async function sendEmail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"NEXL Support" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Email sent to", to);
}
