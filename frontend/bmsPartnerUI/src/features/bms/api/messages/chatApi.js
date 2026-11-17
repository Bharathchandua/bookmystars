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

export async function sendThreadMessage(threadKey, messageOrText, extraParams = {}) {
  try {
    let payload = {};
    if (typeof messageOrText === "string") {
      payload = {
        messageText: messageOrText,
        ...extraParams,
      };
    } else if (messageOrText && typeof messageOrText === "object") {
      payload = {
        ...messageOrText,
        ...extraParams,
      };
    }

    const response = await apiClient.post(`/chat/thread/${encodeURIComponent(threadKey)}/messages`, payload);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to send message"));
  }
}

export async function uploadChatMedia(threadKey, file, caption = "", extraParams = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) formData.append("caption", caption);
  if (extraParams.bookingId) formData.append("bookingId", extraParams.bookingId);
  if (extraParams.recipientId) formData.append("recipientId", extraParams.recipientId);
  if (extraParams.opportunityId) formData.append("opportunityId", extraParams.opportunityId);

  try {
    const response = await apiClient.post(
      `/chat/thread/${encodeURIComponent(threadKey)}/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload file"));
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
// CHAT CONNECTION REQUEST APIs
// ==========================================

export async function sendChatRequest(recipientId, message = "") {
  try {
    const response = await apiClient.post('/chat/request/send', {
      recipientId,
      message,
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to send chat request"));
  }
}

export async function respondToChatRequest(requestId, accept = true) {
  try {
    const response = await apiClient.post(`/chat/request/${requestId}/respond`, {
      accept,
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to respond to chat request"));
  }
}

export async function getChatRequestStatus(targetUserId) {
  try {
    const response = await apiClient.get(`/chat/request/status/${targetUserId}`);
    return response.data;
  } catch (err) {
    console.error("Failed to fetch chat request status:", err);
    return { status: "NONE" };
  }
}

export async function getIncomingChatRequests() {
  try {
    const response = await apiClient.get('/chat/requests/incoming');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Failed to fetch incoming chat requests:", err);
    return [];
  }
}

export async function getOutgoingChatRequests() {
  try {
    const response = await apiClient.get('/chat/requests/outgoing');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Failed to fetch outgoing chat requests:", err);
    return [];
  }
}

export async function cancelChatRequest(requestId) {
  try {
    const response = await apiClient.post(`/chat/request/${requestId}/cancel`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to cancel chat request"));
  }
}

export async function disconnectChat(targetUserId) {
  try {
    const response = await apiClient.post(`/chat/connection/${targetUserId}/disconnect`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to disconnect chat"));
  }
}

export async function blockUser(targetUserId) {
  try {
    const response = await apiClient.post(`/chat/user/${targetUserId}/block`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to block user"));
  }
}

export async function unblockUser(targetUserId) {
  try {
    const response = await apiClient.post(`/chat/user/${targetUserId}/unblock`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to unblock user"));
  }
}

export async function deleteChatMessage(messageId) {
  try {
    const response = await apiClient.delete(`/chat/message/${messageId}`);
    return response.data;
  } catch (err) {
    console.warn("Could not delete message on server:", err);
    return { success: true };
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
  uploadChatMedia,
  getChatMessages,
  sendChatMessage,
  deleteChatMessage,
  sendChatRequest,
  respondToChatRequest,
  getChatRequestStatus,
  getIncomingChatRequests,
  getOutgoingChatRequests,
  cancelChatRequest,
  disconnectChat,
  blockUser,
  unblockUser,
  sendHeartbeat,
  sendOffline,
  getUserPresence,
  getBatchUserPresence,
  setTypingStatus,
  getThreadTypingStatus,
};

export default chatApi;
