import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Transporter connection error:", error);
  } else {
    console.log("Transporter is ready to take our messages");
  }
});

export async function sendEmail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"NEXL Support" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Email sent to", to);
}
