import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generic email sender using Resend (Onboarding style)
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 * @returns {Promise<{ success: boolean, error?: any }>}
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { error } = await resend.emails.send({
      from: 'RentEase Onboarding <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('📧 Email send error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('📧 Unexpected email send failure:', err);
    return { success: false, error: err };
  }
};
