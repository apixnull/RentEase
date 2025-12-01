// file: emailSender.js

// services/email/emailSender.js
import transporter from "../../libs/nodemailerClient.js";

export const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("Missing required email fields");
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "RentEase <noreply@rentease.com>",
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || err };
  }
};
