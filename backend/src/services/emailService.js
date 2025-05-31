import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailVerification = async (email, rawOTP) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'RentEase <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify Your RentEase Account',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your RentEase Account</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          body {
            background-color: #f9fbfd;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          }
          
          .header {
            background: linear-gradient(135deg, #0ea5e9, #0d9488);
            padding: 40px 20px;
            text-align: center;
          }
          
          .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
          }
          
          .logo-icon {
            background: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          
          .logo-text {
            font-size: 28px;
            font-weight: 800;
            color: white;
            letter-spacing: -0.5px;
          }
          
          .content {
            padding: 40px 30px;
            color: #334155;
            line-height: 1.6;
          }
          
          h1 {
            color: #0f172a;
            margin-bottom: 20px;
            font-weight: 700;
          }
          
          p {
            margin-bottom: 20px;
            font-size: 16px;
          }
          
          .code-container {
            background: #f1f5f9;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
          }
          
          .code {
            font-size: 42px;
            letter-spacing: 8px;
            font-weight: 800;
            background: linear-gradient(135deg, #0ea5e9, #0d9488);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin: 10px 0;
          }
          
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #0ea5e9, #0d9488);
            color: white !important;
            text-decoration: none;
            font-weight: 600;
            padding: 16px 40px;
            border-radius: 12px;
            margin: 25px 0;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
          }
          
          .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
          }
          
          .footer {
            text-align: center;
            padding: 25px;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #f1f5f9;
            background: #f8fafc;
          }
          
          .small {
            font-size: 14px;
            color: #94a3b8;
            margin-top: 30px;
          }
          
          .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 30px 0;
          }
          
          @media (max-width: 600px) {
            .content {
              padding: 30px 20px;
            }
            
            .code {
              font-size: 32px;
              letter-spacing: 5px;
            }
            
            .button {
              width: 100%;
              text-align: center;
              padding: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <div class="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #0d9488;">
                  <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="logo-text">RentEase</div>
            </div>
            <h1 style="color: white;">Verify Your Account</h1>
          </div>
          
          <div class="content">
            <h1>Welcome to RentEase!</h1>
            <p>Thank you for creating an account with us. To complete your registration and start managing your properties with ease, please verify your email address.</p>
            
            <p>Your verification code is:</p>
            
            <div class="code-container">
              <div class="code">${rawOTP}</div>
              <p>This code will expire in 15 minutes</p>
            </div>
            
            <p>Click the button below to verify your email instantly:</p>
            
            <div style="text-align: center;">
              <a href="http://localhost:5173/auth/verify-email" class="button">Verify Email Address</a>
            </div>
            
            <div class="divider"></div>
            
            <p class="small">If you did not create an account with RentEase, please ignore this email or contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentEase. All rights reserved.</p>
            <p style="margin-top: 8px;">123 Property St, Real Estate City | contact@rentease.com</p>
            <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
      `,
    });

    if (error) {
      console.error('Resend Email Error:', error);
      return {
        success: false,
        message: 'Failed to send verification email',
        errorDetails: error,
      };
    }

    console.log('Verification email sent:', data);
    return {
      success: true,
      message: 'Verification email sent successfully',
      data,
    };
  } catch (err) {
    console.error('sendEmailVerification error:', err);
    return {
      success: false,
      message: 'Internal server error while sending email',
      errorDetails: err.message || err,
    };
  }
};
