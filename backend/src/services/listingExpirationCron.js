// file: listingExpirationCron.js
import cron from 'node-cron';
import prisma from '../libs/prismaClient.js';
import { sendEmail } from './email/emailSender.js';
import { listingExpirationTemplate } from './email/templates/listingExpiration.js';

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
 * Process expired listings and notify landlords
 * This function checks for listings that expired today and updates their status
 * @returns {Promise<{success: boolean, processedCount: number, errorCount: number, message: string}>}
 */
export const processExpiredListings = async () => {
  try {
    console.log('🔄 Starting listing expiration cron job...');
    
    const phDate = getPHDate();
    const today = new Date(phDate);
    today.setHours(0, 0, 0, 0);
    
    // End of today
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get listings that expired today and are still in VISIBLE or HIDDEN status
    const expiredListings = await prisma.listing.findMany({
      where: {
        expiresAt: {
          gte: today,
          lte: todayEnd,
        },
        lifecycleStatus: {
          in: ['VISIBLE', 'HIDDEN'], // Only process listings that are still active
        },
      },
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            label: true,
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
    
    let processedCount = 0;
    let errorCount = 0;
    
    // Process each expired listing
    for (const listing of expiredListings) {
      try {
        // Update listing status to EXPIRED
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            lifecycleStatus: 'EXPIRED',
            expiresAt: listing.expiresAt, // Keep the original expiration date
          },
        });
        
        // Send email notification to landlord
        const landlordName = `${listing.landlord.firstName} ${listing.landlord.lastName}`;
        const expirationDateFormatted = formatDate(listing.expiresAt);
        
        const emailResult = await sendEmail({
          to: listing.landlord.email,
          subject: `Your Listing Has Expired - ${listing.unit.property.title}`,
          html: listingExpirationTemplate(
            landlordName,
            listing.unit.property.title,
            listing.unit.label,
            expirationDateFormatted,
            listing.id
          ),
        });
        
        if (emailResult.success) {
          processedCount++;
          console.log(`✅ Processed expired listing ${listing.id} and notified landlord ${listing.landlord.email}`);
        } else {
          errorCount++;
          console.error(`❌ Failed to send expiration email for listing ${listing.id}:`, emailResult.error);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing expired listing ${listing.id}:`, error);
      }
    }
    
    console.log(`✅ Listing expiration cron job completed. Processed: ${processedCount}, Errors: ${errorCount}`);
    
    return {
      success: true,
      processedCount,
      errorCount,
      message: `Processed ${processedCount + errorCount} listings. Updated: ${processedCount}, Errors: ${errorCount}`,
    };
  } catch (error) {
    console.error('❌ Error in listing expiration cron job:', error);
    return {
      success: false,
      processedCount: 0,
      errorCount: 0,
      message: `Error: ${error.message}`,
    };
  }
};

/**
 * Initialize and start the cron job
 * Runs daily at 8:00 AM Philippines time (00:00 UTC = 8:00 AM PH time)
 */
export const startListingExpirationCron = () => {
  // Cron expression: Run at 00:00 UTC (8:00 AM PH time) every day
  // Format: minute hour day month day-of-week
  // '0 0 * * *' = every day at midnight UTC (8 AM PH time)
  cron.schedule('0 0 * * *', async () => {
    await processExpiredListings();
  }, {
    scheduled: true,
    timezone: 'Asia/Manila', // Use Philippines timezone
  });
  
  console.log('✅ Listing expiration cron job scheduled (runs daily at 8:00 AM PH time)');
  
  // Optional: Run immediately on startup for testing (comment out in production)
  // await processExpiredListings();
};

