// file: paymentReminderCron.js
import cron from 'node-cron';
import prisma from '../libs/prismaClient.js';
import { sendEmail } from './email/emailSender.js';
import { paymentReminderTemplate, paymentDueTodayTemplate } from './email/templates/paymentReminder.js';

/**
 * Get current date in Philippines timezone (UTC+8)
 * @returns {Date} Current date in PH timezone
 */
const getPHDate = () => {
  const now = new Date();
  // Convert to PH time (UTC+8)
  const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  return phTime;
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'Asia/Manila'
  });
};

/**
 * Send payment reminder emails
 * This function checks for payments that need reminders and sends emails
 * @returns {Promise<{success: boolean, sentCount: number, errorCount: number, message: string}>}
 */
export const sendPaymentReminders = async () => {
  try {
    console.log('🔄 Starting payment reminder cron job...');
    
    const phDate = getPHDate();
    const today = new Date(phDate);
    today.setHours(0, 0, 0, 0);
    
    // Calculate 2 days from now
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);
    
    // End of 2 days from now
    const twoDaysFromNowEnd = new Date(twoDaysFromNow);
    twoDaysFromNowEnd.setHours(23, 59, 59, 999);
    
    // End of today
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get payments due in 2 days that haven't been reminded yet
    const paymentsDueIn2Days = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        reminderStage: 0,
        dueDate: {
          gte: twoDaysFromNow,
          lte: twoDaysFromNowEnd,
        },
      },
      include: {
        lease: {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            property: {
              select: {
                title: true,
              },
            },
            unit: {
              select: {
                label: true,
              },
            },
          },
        },
      },
    });
    
    // Get payments due today with reminderStage = 0 (missed the 2-day reminder, set directly to 2)
    const paymentsDueTodayStage0 = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        reminderStage: 0,
        dueDate: {
          gte: today,
          lte: todayEnd,
        },
      },
      include: {
        lease: {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            property: {
              select: {
                title: true,
              },
            },
            unit: {
              select: {
                label: true,
              },
            },
          },
        },
      },
    });
    
    // Get payments due today that already got the 2-day reminder
    const paymentsDueToday = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        reminderStage: 1,
        dueDate: {
          gte: today,
          lte: todayEnd,
        },
      },
      include: {
        lease: {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            property: {
              select: {
                title: true,
              },
            },
            unit: {
              select: {
                label: true,
              },
            },
          },
        },
      },
    });
    
    let sentCount = 0;
    let errorCount = 0;
    
    // Send 2-day reminders
    for (const payment of paymentsDueIn2Days) {
      try {
        const tenantName = `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`;
        const dueDateFormatted = formatDate(payment.dueDate);
        const paymentType = payment.type || 'RENT';
        
        // Update reminderStage optimistically (assume email will succeed)
        await prisma.payment.update({
          where: { id: payment.id },
          data: { reminderStage: 1 },
        });
        sentCount++;
        
        // Send email (non-blocking)
        sendEmail({
          to: payment.lease.tenant.email,
          subject: `Payment Reminder: ${paymentType} Due in 2 Days - ${payment.lease.property.title}`,
          html: paymentReminderTemplate(
            tenantName,
            payment.amount,
            dueDateFormatted,
            payment.lease.property.title,
            payment.lease.unit.label,
            paymentType
          ),
        }).then((emailResult) => {
          if (emailResult.success) {
            console.log(`✅ Sent 2-day reminder for payment ${payment.id} to ${payment.lease.tenant.email}`);
          } else {
            console.error(`❌ Failed to send 2-day reminder for payment ${payment.id}:`, emailResult.error);
          }
        }).catch((error) => {
          console.error(`❌ Error sending 2-day reminder for payment ${payment.id}:`, error);
        });
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing 2-day reminder for payment ${payment.id}:`, error);
      }
    }
    
    // Send due today reminders for payments that missed the 2-day reminder (reminderStage = 0, due today)
    // Set directly to reminderStage = 2 to avoid sending another reminder
    for (const payment of paymentsDueTodayStage0) {
      try {
        const tenantName = `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`;
        const dueDateFormatted = formatDate(payment.dueDate);
        const paymentType = payment.type || 'RENT';
        
        // Update reminderStage optimistically (assume email will succeed)
        await prisma.payment.update({
          where: { id: payment.id },
          data: { reminderStage: 2 },
        });
        sentCount++;
        
        // Send email (non-blocking)
        sendEmail({
          to: payment.lease.tenant.email,
          subject: `Payment Due Today: ${paymentType} - ${payment.lease.property.title}`,
          html: paymentDueTodayTemplate(
            tenantName,
            payment.amount,
            dueDateFormatted,
            payment.lease.property.title,
            payment.lease.unit.label,
            paymentType
          ),
        }).then((emailResult) => {
          if (emailResult.success) {
            console.log(`✅ Sent due today reminder (skipped 2-day) for payment ${payment.id} to ${payment.lease.tenant.email}`);
          } else {
            console.error(`❌ Failed to send due today reminder for payment ${payment.id}:`, emailResult.error);
          }
        }).catch((error) => {
          console.error(`❌ Error sending due today reminder for payment ${payment.id}:`, error);
        });
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing due today reminder for payment ${payment.id}:`, error);
      }
    }
    
    // Send due today reminders for payments that already got the 2-day reminder
    for (const payment of paymentsDueToday) {
      try {
        const tenantName = `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`;
        const dueDateFormatted = formatDate(payment.dueDate);
        const paymentType = payment.type || 'RENT';
        
        // Update reminderStage optimistically (assume email will succeed)
        await prisma.payment.update({
          where: { id: payment.id },
          data: { reminderStage: 2 },
        });
        sentCount++;
        
        // Send email (non-blocking)
        sendEmail({
          to: payment.lease.tenant.email,
          subject: `Payment Due Today: ${paymentType} - ${payment.lease.property.title}`,
          html: paymentDueTodayTemplate(
            tenantName,
            payment.amount,
            dueDateFormatted,
            payment.lease.property.title,
            payment.lease.unit.label,
            paymentType
          ),
        }).then((emailResult) => {
          if (emailResult.success) {
            console.log(`✅ Sent due today reminder for payment ${payment.id} to ${payment.lease.tenant.email}`);
          } else {
            console.error(`❌ Failed to send due today reminder for payment ${payment.id}:`, emailResult.error);
          }
        }).catch((error) => {
          console.error(`❌ Error sending due today reminder for payment ${payment.id}:`, error);
        });
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing due today reminder for payment ${payment.id}:`, error);
      }
    }
    
    console.log(`✅ Payment reminder cron job completed. Sent: ${sentCount}, Errors: ${errorCount}`);
    
    return {
      success: true,
      sentCount,
      errorCount,
      message: `Processed ${sentCount + errorCount} payments. Sent: ${sentCount}, Errors: ${errorCount}`,
    };
  } catch (error) {
    console.error('❌ Error in payment reminder cron job:', error);
    return {
      success: false,
      sentCount: 0,
      errorCount: 0,
      message: `Error: ${error.message}`,
    };
  }
};

/**
 * Initialize and start the cron job
 * Runs daily at 8:00 AM Philippines time (00:00 UTC = 8:00 AM PH time)
 */
export const startPaymentReminderCron = () => {
  // Cron expression: Run at 00:00 UTC (8:00 AM PH time) every day
  // Format: minute hour day month day-of-week
  // '0 0 * * *' = every day at midnight UTC (8 AM PH time)
  cron.schedule('0 0 * * *', async () => {
    await sendPaymentReminders();
  }, {
    scheduled: true,
    timezone: 'Asia/Manila', // Use Philippines timezone
  });
  
  console.log('✅ Payment reminder cron job scheduled (runs daily at 8:00 AM PH time)');
  
  // Optional: Run immediately on startup for testing (comment out in production)
  // await sendPaymentReminders();
};

