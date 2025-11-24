import { privateApi } from "./axios";

// ------------------------------------------------------------
// GET ALL CHAT CHANNELS OF THE USER
// ------------------------------------------------------------
export const getUserChatChannelsRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get("/chat/channels", { signal: options?.signal });

// ------------------------------------------------------------
// GET MESSAGES OF SPECIFIC CHANNEL
// ------------------------------------------------------------
export const getChannelMessagesRequest = (channelId: string, options?: { signal?: AbortSignal }) =>
  privateApi.get(`/chat/${channelId}/messages`, { signal: options?.signal });

// ------------------------------------------------------------
// SEND MESSAGE TO SPECIFIC CHANNEL
// ------------------------------------------------------------
export const sendMessageRequest = (channelId: string, data: { content: string }, options?: { signal?: AbortSignal }) =>
  privateApi.post(`/chat/${channelId}/send`, data, { signal: options?.signal });

// ------------------------------------------------------------
// SEND MESSAGE AND CREATE NEW CHANNEL (Works for both tenant and landlord)
// ------------------------------------------------------------
export const sendAndCreateChannelRequest = (data: { recipientId: string; content: string }, options?: { signal?: AbortSignal }) =>
  privateApi.post("/chat/channels/new", data, { signal: options?.signal });

// ------------------------------------------------------------
// SEARCH USERS FOR MESSAGING (Tenants for landlords, Landlords for tenants)
// ------------------------------------------------------------
export const searchUsersForMessagingRequest = (query: string, options?: { signal?: AbortSignal }) =>
  privateApi.get("/chat/users/search", {
    params: { query },
    signal: options?.signal,
  });

// ------------------------------------------------------------
// MARK MESSAGES AS READ
// ------------------------------------------------------------
export const markMessagesAsReadRequest = (channelId: string, options?: { signal?: AbortSignal }) =>
  privateApi.post(`/chat/${channelId}/read`, {}, { signal: options?.signal });

 