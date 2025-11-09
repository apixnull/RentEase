import { Router } from "express";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";
import { getUserChatChannels, sendMessage, sendMessageCreateChannel, getSpecificChannelMessages, markMessagesAsRead } from "../controllers/chatController.js";

const router = Router();

// ----------------------------------------------------- CHATS
router.get("/channels", requireAuthentication(["TENANT","LANDLORD"]), getUserChatChannels);
router.post("/:channelId/send", requireAuthentication(["TENANT","LANDLORD"]), sendMessage);
router.post("/channels/new", requireAuthentication(["TENANT", "LANDLORD"]), sendMessageCreateChannel);
router.get("/:channelId/messages", requireAuthentication(["TENANT","LANDLORD"]), getSpecificChannelMessages);
router.post("/:channelId/read", requireAuthentication(["TENANT","LANDLORD"]), markMessagesAsRead);

export default router;
