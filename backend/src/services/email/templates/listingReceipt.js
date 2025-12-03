// file: listingReceipt.js

/**
 * Generates HTML for listing payment receipt email
 * @param {string} landlordName - Landlord's full name
 * @param {number} amount - Payment amount
 * @param {string} paymentDate - Formatted payment date
 * @param {string} propertyTitle - Property title
 * @param {string} unitLabel - Unit label
 * @param {string} listingId - Listing ID
 * @param {boolean} isFeatured - Whether listing is featured
 * @param {string} providerName - Payment provider name
 * @returns {string} HTML string
 */
export const listingReceiptTemplate = (
  landlordName,
  amount,
  paymentDate,
  propertyTitle,
  unitLabel,
  listingId,
  isFeatured,
  providerName
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Payment Receipt - RentEase</title>
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
      background: linear-gradient(135deg, #10b981, #059669);
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
    .success-icon {
      text-align: center;
      font-size: 48px;
      margin-bottom: 16px;
    }
    .amount-box {
      background: #d1fae5;
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 32px 0;
    }
    .amount {
      font-size: 36px;
      font-weight: 700;
      color: #065f46;
      margin: 8px 0;
    }
    .payment-date {
      font-size: 16px;
      font-weight: 600;
      color: #059669;
      margin-top: 8px;
    }
    .info-box {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border-left: 4px solid #10b981;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
    }
    .info-value {
      color: #111827;
      text-align: right;
    }
    .featured-badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
    }
    .footer {
      text-align: center;
      padding: 24px;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    @media (max-width: 480px) {
      .amount {
        font-size: 28px;
      }
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
        <h1 style="margin: 0; font-weight: 600;">Payment Receipt</h1>
      </div>
      
      <div class="content">
        <div class="success-icon">✅</div>
        <p style="margin-top: 0; text-align: center; font-size: 18px; font-weight: 600; color: #10b981;">
          Payment Successful!
        </p>
        
        <p style="margin-top: 0;">Hello ${landlordName},</p>
        <p>Thank you for your payment. Your listing has been successfully created and is now being processed.</p>
        
        <div class="amount-box">
          <div style="font-size: 14px; color: #065f46; font-weight: 600;">Amount Paid</div>
          <div class="amount">₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="payment-date">Paid on: ${paymentDate}</div>
        </div>
        
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Listing ID:</span>
            <span class="info-value">${listingId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Property:</span>
            <span class="info-value">${propertyTitle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Unit:</span>
            <span class="info-value">${unitLabel}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${providerName || 'GCASH'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Listing Type:</span>
            <span class="info-value">
              Standard Listing${isFeatured ? '<span class="featured-badge">FEATURED</span>' : ''}
            </span>
          </div>
        </div>
        
        <p><strong>What's Next?</strong></p>
        <p>Your listing is currently under review. Once approved, it will be visible to tenants on our platform. You will receive a notification when your listing is approved.</p>
        
        <p style="margin-bottom: 0;">Thank you for choosing RentEase!</p>
      </div>
      
      <div class="footer">
        <p style="margin: 0;">This is an automated receipt from RentEase.</p>
        <p style="margin: 8px 0 0; color: #9ca3af;">
          Need help? Contact us at <a href="mailto:support@rentease.com" style="color: #10b981; text-decoration: none;">support@rentease.com</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

