// services/email/emailSender.js
import resend from "../../libs/resendClient.js";

export const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    return { success: false, error: "Missing required email fields" };
  }

  try {
    const response = await resend.emails.send({
      from: "RentEase <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};
