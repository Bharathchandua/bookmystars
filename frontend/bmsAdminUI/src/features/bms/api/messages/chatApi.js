import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// CHAT & MESSAGES APIs (/api/chat)
// ==========================================

export async function getMyConversations() {
  try {
    const response = await apiClient.get('/chat/my-conversations');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Failed to fetch conversations:", err);
    return [];
  }
}

export async function getThreadMessages(threadKey) {
  try {
    const response = await apiClient.get(`/chat/thread/${encodeURIComponent(threadKey)}/messages`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Failed to fetch thread messages:", err);
    return [];
  }
}

export async function sendThreadMessage(threadKey, text, extraParams = {}) {
  try {
    const response = await apiClient.post(`/chat/thread/${encodeURIComponent(threadKey)}/messages`, {
      messageText: text,
      ...extraParams,
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to send message"));
  }
}

export async function getChatMessages(bookingId) {
  try {
    const response = await apiClient.get(`/chat/${bookingId}/messages`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function sendChatMessage(bookingId, text) {
  try {
    const response = await apiClient.post(`/chat/${bookingId}/messages`, { messageText: text });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to send message"));
  }
}

// ==========================================
// REAL-TIME PRESENCE & TYPING APIs
// ==========================================

export async function sendHeartbeat() {
  try {
    const response = await apiClient.post('/chat/presence/heartbeat');
    return response.data;
  } catch (err) {
    return { status: "ERROR" };
  }
}

export async function sendOffline() {
  try {
    const response = await apiClient.post('/chat/presence/offline');
    return response.data;
  } catch (err) {
    return { status: "ERROR" };
  }
}

export async function getUserPresence(targetUserId) {
  if (!targetUserId) return { userId: targetUserId, isOnline: false };
  try {
    const response = await apiClient.get(`/chat/presence/status/${targetUserId}`);
    return response.data;
  } catch (err) {
    return { userId: targetUserId, isOnline: false };
  }
}

export async function getBatchUserPresence(userIds = []) {
  if (!userIds || userIds.length === 0) return {};
  try {
    const response = await apiClient.post('/chat/presence/batch-status', userIds);
    return response.data || {};
  } catch (err) {
    return {};
  }
}

export async function setTypingStatus(threadKey, isTyping = true) {
  if (!threadKey) return;
  try {
    await apiClient.post(`/chat/thread/${encodeURIComponent(threadKey)}/typing?isTyping=${isTyping}`);
  } catch (err) {
    // Ignore transient network errors on typing pings
  }
}

export async function getThreadTypingStatus(threadKey) {
  if (!threadKey) return { isTyping: false };
  try {
    const response = await apiClient.get(`/chat/thread/${encodeURIComponent(threadKey)}/typing`);
    return response.data || { isTyping: false };
  } catch (err) {
    return { isTyping: false };
  }
}

export const chatApi = {
  getMyConversations,
  getThreadMessages,
  sendThreadMessage,
  getChatMessages,
  sendChatMessage,
  sendHeartbeat,
  sendOffline,
  getUserPresence,
  getBatchUserPresence,
  setTypingStatus,
  getThreadTypingStatus,
};

export default chatApi;
