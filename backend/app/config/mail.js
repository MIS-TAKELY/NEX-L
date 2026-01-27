const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Shortcut for Gmail's SMTP settings - see Well-Known Services
  auth: {
    type: "OAuth2",
    user: "me@gmail.com",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

export async function sendEmail({ to, subject, Component, props }) {
  //   const html = renderEmail(Component, props);

  await transporter.sendMail({
    from: '"Your App" <your.email@gmail.com>',
    to,
    subject,
    html: `hello`,
  });

  console.log("Email sent to", to);
}
