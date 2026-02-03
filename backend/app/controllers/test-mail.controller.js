import { sendEmail } from "../config/mail.js";

export const testMail = async (req, res) => {
  try {
    const to = "mailitttome@gmail.com";
    const subject = "Test mail";

    await sendEmail({
      to,
      subject,
    });

    return res.status(200).json({
      success: true,
      message: "Mail sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to send mail",
    });
  }
};
