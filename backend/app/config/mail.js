import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // your gmail
    pass: process.env.MAIL_PASS, // Gmail App Password (NOT your normal password)
  },
});

export async function sendEmail({ to, subject, Component, props }) {
  // const html = renderEmail(Component, props);

  await transporter.sendMail({
    from: `"Your App" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: "hello",
  });

  console.log("Email sent to", to);
}
