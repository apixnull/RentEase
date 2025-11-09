import prisma from "../libs/prismaClient.js";

// ============================================================================
// GET ALL CHAT CHANNELS FOR CURRENT USER (Raw Snapshot Data)
// ============================================================================
export const getUserChatChannels = async (req, res) => {
  try {
    const userId = String(req.user.id);

    // 1️⃣ Find all channels where current user is tenant or landlord
    const channels = await prisma.chatChannel.findMany({
      where: {
        OR: [{ tenantId: userId }, { landlordId: userId }],
        messages: { some: {} }, // ✅ only include channels that have messages
      },
      include: {
        tenant: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true},
        },
        landlord: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true},
        },
        unit: {
          select: {
            id: true,
            label: true,
            property: { select: { id: true, title: true } },
          },
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
    });

    // 3️⃣ Update snapshot fields on ChatChannel
    await prisma.chatChannel.update({
      where: { id: channelId },
      data: {
        lastMessageText: content,
        lastMessageAt: newMessage.createdAt,
        lastMessageSenderId: senderId,
        updatedAt: newMessage.createdAt,
        readAt: null,
      },
    });


    // 5️⃣ Fire-and-forget response
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};


// ============================================================================
// SEND MESSAGE + CREATE NEW CHANNEL (Creates new one with first message)
// ============================================================================

export const sendMessageCreateChannel = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { landlordId, unitId, content } = req.body;

    // 1️⃣ Validate input
    if (!landlordId) return res.status(400).json({ message: "Landlord ID required" });
    if (!unitId) return res.status(400).json({ message: "Unit ID required" });
    if (!content?.trim()) return res.status(400).json({ message: "Message content required" });

    // 2️⃣ Create a new chat channel
    const channel = await prisma.chatChannel.create({
      data: {
        tenantId: senderId,
        landlordId,
        unitId,
        status: "INQUIRY",
      },
    });

    // 3️⃣ Create the first message within that new channel
    const message = await prisma.chatMessage.create({
      data: {
        channelId: channel.id,
        senderId,
        content,
      },
    });

    // 4️⃣ Update the channel’s message snapshot fields
    await prisma.chatChannel.update({
      where: { id: channel.id },
      data: {
        lastMessageText: content,
        lastMessageAt: message.createdAt,
        lastMessageSenderId: senderId,
        updatedAt: message.createdAt,
      },
    });

    // 5️⃣ Return new channel info (you can adjust this depending on your frontend needs)
    return res.status(201).json({
      channelId: channel.id,
      message: "New chat channel created and first message sent.",
    });

  } catch (error) {
    console.error("❌ Error creating new channel and message:", error);
    return res.status(500).json({ message: "Failed to create channel and send message." });
  }
};
// ============================================================================
// GET SPECIFIC CHAT CHANNEL MESSAGES
// Returns channel info + related unit/property + both participants + messages
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
        unit: {
          id: channel.unit.id,
          label: channel.unit.label,
          mainImageUrl: channel.unit.mainImageUrl,
          property: {
            id: channel.unit.property.id,
            title: channel.unit.property.title,
          },
        },
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

    // 4️⃣ Optionally update the channel’s readAt snapshot
    if (count > 0) {
      await prisma.chatChannel.update({
        where: { id: channelId },
        data: { readAt: new Date() },
      });
    }

    // 5️⃣ Return success with no message payload
    return res.sendStatus(204); // ✅ No Content

  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
    return res.status(500).json({ message: "Failed to mark messages as read." });
  }
};
