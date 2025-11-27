import prisma from "../libs/prismaClient.js";
import { emitChannelUpdate, emitNewMessage, emitReadReceipt } from "../services/socketService.js";

// ============================================================================
// GET ALL CHAT CHANNELS FOR CURRENT USER (Raw Snapshot Data)
// ============================================================================
export const getUserChatChannels = async (req, res) => {
  try {
    const userId = String(req.user.id);

    // 1️⃣ Find all channels where current user is tenant or landlord (include empty channels)
    const channels = await prisma.chatChannel.findMany({
      where: {
        OR: [{ tenantId: userId }, { landlordId: userId }],
      },
      include: {
        tenant: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true},
        },
        landlord: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true},
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 2️⃣ Return everything directly — snapshot already includes all info
    return res.status(200).json(channels);
  } catch (error) {
    console.error("Error fetching chat channels:", error);
    return res.status(500).json({ message: "Failed to fetch chat channels." });
  }
};


// ============================================================================
// SEND MESSAGE (with last sender tracking + snapshot sync)
// ============================================================================
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { channelId } = req.params;
    const { content } = req.body;

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID required" });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    // 1️⃣ Validate sender is part of the channel
    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId },
      select: { tenantId: true, landlordId: true },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isParticipant =
      senderId === channel.tenantId || senderId === channel.landlordId;
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not part of this channel" });
    }

    // 2️⃣ Create the new message
    const newMessage = await prisma.chatMessage.create({
      data: {
        channelId,
        senderId,
        content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        readAt: true,
        senderId: true,
      },
    });

    // 3️⃣ Update snapshot fields on ChatChannel
    const updatedChannel = await prisma.chatChannel.update({
      where: { id: channelId },
      data: {
        lastMessageText: content,
        lastMessageAt: newMessage.createdAt,
        lastMessageSenderId: senderId,
        updatedAt: newMessage.createdAt,
        readAt: null,
      },
      include: {
        tenant: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        landlord: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    // 4️⃣ Emit Socket.IO events
    // Emit channel update (for channel list)
    emitChannelUpdate(updatedChannel);
    
    // Emit new message (for message view)
    emitNewMessage(newMessage, channelId, channel.tenantId, channel.landlordId);

    // 5️⃣ Fire-and-forget response
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};


// ============================================================================
// SEND MESSAGE + CREATE NEW CHANNEL (Works for both tenant and landlord)
// Checks for existing channel, active lease status, etc.
// ============================================================================

export const sendMessageCreateChannel = async (req, res) => {
  try {
    const senderId = req.user.id;
    const senderRole = req.user.role;
    const { recipientId, content } = req.body;

    // 1️⃣ Validate input
    if (!recipientId) {
      return res.status(400).json({ message: "Recipient ID required" });
    }
    if (!content?.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    // 2️⃣ Verify recipient exists and has correct role
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, role: true },
    });

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // 3️⃣ Determine tenant and landlord IDs based on sender role
    let tenantId, landlordId;
    if (senderRole === "TENANT") {
      tenantId = senderId;
      landlordId = recipientId;
      if (recipient.role !== "LANDLORD") {
        return res.status(400).json({ message: "Recipient must be a landlord" });
      }
    } else if (senderRole === "LANDLORD") {
      tenantId = recipientId;
      landlordId = senderId;
      if (recipient.role !== "TENANT") {
        return res.status(400).json({ message: "Recipient must be a tenant" });
      }
    } else {
      return res.status(403).json({ message: "Invalid user role" });
    }

    // 4️⃣ Check if channel already exists
    const existingChannel = await prisma.chatChannel.findFirst({
      where: {
        tenantId,
        landlordId,
      },
    });

    let channel;
    if (existingChannel) {
      // Use existing channel
      channel = existingChannel;
    } else {
      // 5️⃣ Check if tenant has an active lease with this landlord
      const activeLease = await prisma.lease.findFirst({
        where: {
          tenantId,
          landlordId,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      // 6️⃣ Check for previous leases (not active) and set them to ENDED
      if (!activeLease) {
        const previousLeases = await prisma.lease.findMany({
          where: {
            tenantId,
            landlordId,
            status: { not: "ENDED" },
          },
          select: { id: true },
        });

        if (previousLeases.length > 0) {
          await prisma.lease.updateMany({
            where: {
              tenantId,
              landlordId,
              status: { not: "ENDED" },
            },
            data: {
              status: "ENDED",
            },
          });
        }
      }

      // 7️⃣ Determine channel status based on active lease
      const channelStatus = activeLease ? "ACTIVE" : "INQUIRY";

      // 8️⃣ Create a new chat channel
      channel = await prisma.chatChannel.create({
        data: {
          tenantId,
          landlordId,
          status: channelStatus,
        },
      });
    }

    // 9️⃣ Create the message within the channel
    const message = await prisma.chatMessage.create({
      data: {
        channelId: channel.id,
        senderId,
        content,
      },
    });

    // 🔟 Check if status needs updating (e.g., lease became active)
    const activeLeaseCheck = await prisma.lease.findFirst({
      where: {
        tenantId,
        landlordId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    const shouldBeActive = activeLeaseCheck !== null;
    const currentStatus = channel.status;
    const needsStatusUpdate = shouldBeActive && currentStatus !== "ACTIVE";

    // 1️⃣1️⃣ Update the channel's message snapshot fields and status if needed
    const updatedChannel = await prisma.chatChannel.update({
      where: { id: channel.id },
      data: {
        lastMessageText: content,
        lastMessageAt: message.createdAt,
        lastMessageSenderId: senderId,
        updatedAt: message.createdAt,
        ...(needsStatusUpdate && { status: "ACTIVE" }),
      },
      include: {
        tenant: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        landlord: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    // 1️⃣2️⃣ Emit Socket.IO events
    emitChannelUpdate(updatedChannel);
    emitNewMessage(
      {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId,
      },
      updatedChannel.id,
      tenantId,
      landlordId
    );

    // 1️⃣3️⃣ Return channel info
    return res.status(201).json({
      channelId: channel.id,
      message: existingChannel 
        ? "Message sent to existing conversation." 
        : "New chat channel created and first message sent.",
    });

  } catch (error) {
    console.error("❌ Error creating new channel and message:", error);
    return res.status(500).json({ message: "Failed to create channel and send message." });
  }
};

// ============================================================================
// SEARCH TENANTS FOR MESSAGING (by name or email)
// ============================================================================
export const searchUsersForMessaging = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    const { query } = req.query;

    console.log("🔍 Search request:", { query, currentUserId, currentUserRole });

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters." });
    }

    // Determine what role to search for based on current user
    const targetRole = currentUserRole === "LANDLORD" ? "TENANT" : "LANDLORD";

    // Search users (by first name, last name, or email)
    const users = await prisma.user.findMany({
      where: {
        role: targetRole,
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
      },
      take: 20,
      orderBy: { firstName: "asc" },
    });

    // Check for existing channels with current user
    const userIds = users.map(u => u.id);
    let existingChannels = [];
    
    if (userIds.length > 0) {
      if (currentUserRole === "LANDLORD") {
        existingChannels = await prisma.chatChannel.findMany({
          where: {
            landlordId: currentUserId,
            tenantId: { in: userIds },
          },
          select: {
            tenantId: true,
            id: true,
          },
        });
      } else {
        existingChannels = await prisma.chatChannel.findMany({
          where: {
            tenantId: currentUserId,
            landlordId: { in: userIds },
          },
          select: {
            landlordId: true,
            id: true,
          },
        });
      }
    }

    // Create a map of existing channel IDs
    const channelMap = {};
    existingChannels.forEach(ch => {
      const otherUserId = currentUserRole === "LANDLORD" ? ch.tenantId : ch.landlordId;
      channelMap[otherUserId] = ch.id;
    });

    // Add channelId to results if conversation exists
    const results = users.map(user => ({
      ...user,
      existingChannelId: channelMap[user.id] || null,
    }));

    console.log("✅ Search results:", { count: results.length, results });

    return res.status(200).json({
      users: results,
    });
  } catch (err) {
    console.error("Error searching for users:", err);
    return res.status(500).json({
      error: "Failed to search for users.",
      details: err.message,
    });
  }
};

// ============================================================================
// GET SPECIFIC CHAT CHANNEL MESSAGES
// Returns channel info + both participants + messages
// ============================================================================
export const getSpecificChannelMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { channelId } = req.params;

    // 1️⃣ Validate input
    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required." });
    }

    // 2️⃣ Fetch channel with related info
    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            email: true,
          },
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            email: true,
          },
        },
      },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found." });
    }

    // 3️⃣ Verify user participation
    const isParticipant =
      userId === channel.tenantId || userId === channel.landlordId;
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not part of this channel." });
    }

    // 4️⃣ Prepare both participants
    const participants = [
      {
        id: channel.tenant.id,
        name: `${channel.tenant.firstName || ""} ${channel.tenant.lastName || ""}`.trim(),
        avatarUrl: channel.tenant.avatarUrl || null,
        role: channel.tenant.role,
        email: channel.tenant.email,
      },
      {
        id: channel.landlord.id,
        name: `${channel.landlord.firstName || ""} ${channel.landlord.lastName || ""}`.trim(),
        avatarUrl: channel.landlord.avatarUrl || null,
        role: channel.landlord.role,
        email: channel.landlord.email,
      },
    ];

    // 5️⃣ Fetch messages in chronological order
    const messages = await prisma.chatMessage.findMany({
      where: { channelId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        readAt: true,
        senderId: true,
      },
    });

    // 6️⃣ Construct structured response
    return res.status(200).json({
      channel: {
        id: channel.id,
        status: channel.status,
        tenantId: channel.tenantId,
        landlordId: channel.landlordId,
      },
      participants, // 👥 both tenant and landlord info
      messages,
    });

  } catch (error) {
    console.error("❌ Error fetching channel messages:", error);
    return res.status(500).json({ message: "Failed to fetch messages." });
  }
};


// ============================================================================
// MARK ALL UNREAD MESSAGES IN A CHANNEL AS READ
// (No message payload — just confirm success)
// ============================================================================
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { channelId } = req.params;

    // 1️⃣ Validate input
    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required." });
    }

    // 2️⃣ Verify that user is part of the channel
    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId },
      select: {
        id: true,
        tenantId: true,
        landlordId: true,
      },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found." });
    }

    const isParticipant =
      userId === channel.tenantId || userId === channel.landlordId;

    if (!isParticipant) {
      return res.status(403).json({ message: "You are not authorized for this channel." });
    }

    // 3️⃣ Mark all unread messages (not sent by user) as read
    const { count } = await prisma.chatMessage.updateMany({
      where: {
        channelId,
        readAt: null,
        senderId: { not: userId },
      },
      data: { readAt: new Date() },
    });

    // 4️⃣ Optionally update the channel's readAt snapshot
    if (count > 0) {
      const readAt = new Date();
      const updatedChannel = await prisma.chatChannel.update({
        where: { id: channelId },
        data: { readAt },
        include: {
          tenant: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          landlord: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      });

      // 5️⃣ Emit Socket.IO events
      // Emit channel update (for channel list)
      emitChannelUpdate(updatedChannel);
      
      // Emit read receipt (for message view)
      emitReadReceipt(channelId, channel.tenantId, channel.landlordId, readAt);
    }

    // 6️⃣ Return success with no message payload
    return res.sendStatus(204); // ✅ No Content

  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
    return res.status(500).json({ message: "Failed to mark messages as read." });
  }
};
