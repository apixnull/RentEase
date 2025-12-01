// file: paymentReminderController.js
import { sendPaymentReminders } from '../../services/paymentReminderCron.js';

/**
 * @desc Manually trigger payment reminder emails (for testing)
 * @route POST /api/admin/payment-reminders/trigger
 * @access Private (ADMIN only)
 */
export const triggerPaymentReminders = async (req, res) => {
  try {
    console.log('🔄 Manual trigger: Starting payment reminder process...');
    
    const result = await sendPaymentReminders();
    
    return res.status(200).json({
      success: true,
      message: 'Payment reminders processed successfully',
      sentCount: result.sentCount || 0,
      errorCount: result.errorCount || 0,
    });
  } catch (error) {
    console.error('❌ Error in manual payment reminder trigger:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to trigger payment reminders',
      details: error.message,
    });
  }
};

