// file: paymentReminder.js

/**
 * Generates HTML for payment reminder email (2 days before due date)
 * @param {string} tenantName - Tenant's full name
 * @param {number} amount - Payment amount
 * @param {string} dueDate - Formatted due date
 * @param {string} propertyTitle - Property title
 * @param {string} unitLabel - Unit label
 * @param {string} paymentType - Payment type (RENT, ADVANCE_PAYMENT, etc.)
 * @returns {string} HTML string
 */
export const paymentReminderTemplate = (tenantName, amount, dueDate, propertyTitle, unitLabel, paymentType) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Payment Reminder - RentEase</title>
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
      background: linear-gradient(135deg, #f59e0b, #d97706);
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
    .amount-box {
      background: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 32px 0;
    }
    .amount {
      font-size: 36px;
      font-weight: 700;
      color: #92400e;
      margin: 8px 0;
    }
    .due-date {
      font-size: 18px;
      font-weight: 600;
      color: #d97706;
      margin-top: 8px;
    }
    .payment-type {
      font-size: 14px;
      color: #92400e;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .info-box {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border-left: 4px solid #f59e0b;
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
        <h1 style="margin: 0; font-weight: 600;">Payment Reminder</h1>
      </div>
      
      <div class="content">
        <p style="margin-top: 0;">Hello ${tenantName},</p>
        <p>This is a friendly reminder that your payment is due in <strong>2 days</strong>.</p>
        
        <div class="amount-box">
          <div class="payment-type">${paymentType || 'RENT'}</div>
          <div style="font-size: 14px; color: #92400e; font-weight: 600;">Amount Due</div>
          <div class="amount">₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="due-date">Due Date: ${dueDate}</div>
        </div>
        
        <div class="info-box">
          <strong>Property:</strong> ${propertyTitle}<br>
          <strong>Unit:</strong> ${unitLabel}
        </div>
        
        <p>Please ensure your payment is made on or before the due date to avoid any late fees or penalties.</p>
        
        <p style="margin-bottom: 0;">Thank you for your prompt attention to this matter.</p>
      </div>
      
      <div class="footer">
        <p style="margin: 0;">This is an automated reminder from RentEase.</p>
        <p style="margin: 8px 0 0 0;">If you have already made this payment, please ignore this email.</p>
        <p style="margin: 8px 0 0; color: #9ca3af;">
          Need help? Contact us at <a href="mailto:support@rentease.com" style="color: #d97706; text-decoration: none;">support@rentease.com</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Generates HTML for payment due today email
 * @param {string} tenantName - Tenant's full name
 * @param {number} amount - Payment amount
 * @param {string} dueDate - Formatted due date
 * @param {string} propertyTitle - Property title
 * @param {string} unitLabel - Unit label
 * @param {string} paymentType - Payment type (RENT, ADVANCE_PAYMENT, etc.)
 * @returns {string} HTML string
 */
export const paymentDueTodayTemplate = (tenantName, amount, dueDate, propertyTitle, unitLabel, paymentType) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Payment Due Today - RentEase</title>
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
      background: linear-gradient(135deg, #ef4444, #dc2626);
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
    .amount-box {
      background: #fee2e2;
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 32px 0;
    }
    .amount {
      font-size: 36px;
      font-weight: 700;
      color: #991b1b;
      margin: 8px 0;
    }
    .due-date {
      font-size: 18px;
      font-weight: 600;
      color: #dc2626;
      margin-top: 8px;
    }
    .payment-type {
      font-size: 14px;
      color: #991b1b;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .info-box {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border-left: 4px solid #ef4444;
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
        <h1 style="margin: 0; font-weight: 600;">Payment Due Today</h1>
      </div>
      
      <div class="content">
        <p style="margin-top: 0;">Hello ${tenantName},</p>
        <p><strong>Your payment is due TODAY.</strong></p>
        
        <div class="amount-box">
          <div class="payment-type">${paymentType || 'RENT'}</div>
          <div style="font-size: 14px; color: #991b1b; font-weight: 600;">Amount Due</div>
          <div class="amount">₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="due-date">Due Date: ${dueDate}</div>
        </div>
        
        <div class="info-box">
          <strong>Property:</strong> ${propertyTitle}<br>
          <strong>Unit:</strong> ${unitLabel}
        </div>
        
        <p>Please make your payment as soon as possible to avoid any late fees or penalties.</p>
        
        <p style="margin-bottom: 0;">Thank you for your prompt attention to this matter.</p>
      </div>
      
      <div class="footer">
        <p style="margin: 0;">This is an automated reminder from RentEase.</p>
        <p style="margin: 8px 0 0 0;">If you have already made this payment, please ignore this email.</p>
        <p style="margin: 8px 0 0; color: #9ca3af;">
          Need help? Contact us at <a href="mailto:support@rentease.com" style="color: #dc2626; text-decoration: none;">support@rentease.com</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

