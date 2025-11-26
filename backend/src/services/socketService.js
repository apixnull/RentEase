// Socket service to emit channel updates
// This file helps avoid circular dependencies

let ioInstance = null;

export const setIoInstance = (io) => {
  ioInstance = io;
};

export const getIoInstance = () => {
  return ioInstance;
};

/**
 * Emit channel update to both tenant and landlord
 * @param {Object} channelData - Full channel data with relations
 */
export const emitChannelUpdate = (channelData) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.IO instance not initialized");
    return;
  }

  const { tenantId, landlordId } = channelData;

  // Emit full channel data to both participants (including tenantId and landlordId)
  ioInstance.to(`user-${tenantId}`).emit("chat:channel:update", channelData);
  ioInstance.to(`user-${landlordId}`).emit("chat:channel:update", channelData);

  console.log(`📡 Emitted channel update for channel ${channelData.id} to tenant ${tenantId} and landlord ${landlordId}`);
};

/**
 * Emit new message to both participants in a channel
 * @param {Object} messageData - Message data with channel info
 * @param {string} channelId - Channel ID
 * @param {string} tenantId - Tenant user ID
 * @param {string} landlordId - Landlord user ID
 */
export const emitNewMessage = (messageData, channelId, tenantId, landlordId) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.IO instance not initialized");
    return;
  }

  // Emit to both user rooms and channel room
  const eventData = { ...messageData, channelId };
  
  ioInstance.to(`user-${tenantId}`).emit("chat:message:new", eventData);
  ioInstance.to(`user-${landlordId}`).emit("chat:message:new", eventData);
  ioInstance.to(`channel-${channelId}`).emit("chat:message:new", eventData);

  console.log(`📨 Emitted new message ${messageData.id} to channel ${channelId}`);
};

/**
 * Emit read receipt update to channel participants
 * @param {string} channelId - Channel ID
 * @param {string} tenantId - Tenant user ID
 * @param {string} landlordId - Landlord user ID
 * @param {Date} readAt - Read timestamp
 */
export const emitReadReceipt = (channelId, tenantId, landlordId, readAt) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.IO instance not initialized");
    return;
  }

  const eventData = { channelId, readAt: readAt.toISOString() };

  // Emit to both user rooms and channel room
  ioInstance.to(`user-${tenantId}`).emit("chat:message:read", eventData);
  ioInstance.to(`user-${landlordId}`).emit("chat:message:read", eventData);
  ioInstance.to(`channel-${channelId}`).emit("chat:message:read", eventData);

  console.log(`✅ Emitted read receipt for channel ${channelId}`);
};

/**
 * Emit new notification to a specific user
 * @param {string} userId - User ID to notify
 * @param {Object} notificationData - Notification data
 */
export const emitNotification = (userId, notificationData) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.IO instance not initialized");
    return;
  }

  ioInstance.to(`user-${userId}`).emit("notification:new", notificationData);
  console.log(`📬 Emitted notification ${notificationData.id} to user ${userId}`);
};

