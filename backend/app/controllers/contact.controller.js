import { sendEmail } from "../config/mail.js";

export const handleContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields",
            });
        }

        const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 20px; text-align: center;">Sent from NEXL Contact Form</p>
      </div>
    `;

        await sendEmail({
            to: process.env.MAIL_USER,
            subject: `Contact Form: ${subject}`,
            html: htmlContent,
        });

        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
        });
    } catch (error) {
        console.error("Contact Form Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to send message. Please try again later.",
        });
    }
};
