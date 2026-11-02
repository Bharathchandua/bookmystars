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

export const chatApi = {
  getMyConversations,
  getThreadMessages,
  sendThreadMessage,
  getChatMessages,
  sendChatMessage,
};

export default chatApi;
