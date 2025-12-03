// file: listingExpiration.js

/**
 * Generates HTML for listing expiration email notification to landlord
 * @param {string} landlordName - Landlord's full name
 * @param {string} propertyTitle - Property title
 * @param {string} unitLabel - Unit label
 * @param {string} expirationDate - Formatted expiration date
 * @param {string} listingId - Listing ID
 * @returns {string} HTML string
 */
export const listingExpirationTemplate = (landlordName, propertyTitle, unitLabel, expirationDate, listingId) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Listing Expired - RentEase</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { 
      margin: 0; 
      padding: 0; 
      background-color: #f9fafb;
      font-family: 'Inter', sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .header {
      background: linear-gradient(135deg, #6b7280, #4b5563);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .content {
      padding: 40px 30px;
      color: #374151;
      line-height: 1.6;
    }
    .info-box {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border-left: 4px solid #6b7280;
    }
    .expiration-box {
      background: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 32px 0;
    }
    .expiration-text {
      font-size: 18px;
      font-weight: 600;
      color: #92400e;
      margin: 8px 0;
    }
    .expiration-date {
      font-size: 16px;
      color: #d97706;
      margin-top: 8px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #0ea5e9, #0d9488);
      color: white;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding: 24px;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    @media (max-width: 480px) {
      .content {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">RentEase</div>
        <h1 style="margin: 0; font-weight: 600;">Listing Expired</h1>
      </div>
      
      <div class="content">
        <p style="margin-top: 0;">Hello ${landlordName},</p>
        <p>We wanted to inform you that your listing has expired and is no longer visible to tenants.</p>
        
        <div class="expiration-box">
          <div class="expiration-text">Listing Expired</div>
          <div class="expiration-date">Expired on: ${expirationDate}</div>
        </div>
        
        <div class="info-box">
          <strong>Property:</strong> ${propertyTitle}<br>
          <strong>Unit:</strong> ${unitLabel}
        </div>
        
        <p>Your listing status has been automatically updated to <strong>EXPIRED</strong>. To continue receiving inquiries from potential tenants, you'll need to create a new listing for this unit.</p>
        
        <p>If you'd like to list this unit again, please visit your dashboard and create a new listing. You'll need to complete the payment process to make it visible to tenants.</p>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'https://rentease.com'}/landlord/listings" class="cta-button">
            View My Listings
          </a>
        </div>
        
        <p style="margin-bottom: 0;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      </div>
      
      <div class="footer">
        <p style="margin: 0;">This is an automated notification from RentEase.</p>
        <p style="margin: 8px 0 0; color: #9ca3af;">
          Need help? Contact us at <a href="mailto:support@rentease.com" style="color: #0ea5e9; text-decoration: none;">support@rentease.com</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

