// file: listingExpirationController.js
import { processExpiredListings } from '../../services/listingExpirationCron.js';

/**
 * @desc Manually trigger listing expiration process (for testing)
 * @route POST /api/admin/listing-expiration/trigger
 * @access Private (ADMIN only)
 */
export const triggerListingExpiration = async (req, res) => {
  try {
    console.log('🔄 Manual trigger: Starting listing expiration process...');
    
    const result = await processExpiredListings();
    
    return res.status(200).json({
      success: true,
      message: 'Listing expiration processed successfully',
      processedCount: result.processedCount || 0,
      errorCount: result.errorCount || 0,
    });
  } catch (error) {
    console.error('❌ Error in manual listing expiration trigger:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to trigger listing expiration',
      details: error.message,
    });
  }
};

