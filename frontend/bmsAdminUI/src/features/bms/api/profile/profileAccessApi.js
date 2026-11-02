import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

/**
 * Toggle talent account privacy mode (Instagram-style Public vs Private)
 */
export async function updateProfilePrivacy(isPrivate) {
  try {
    const response = await apiClient.patch(`/profile/privacy?isPrivate=${isPrivate}`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update profile privacy"));
  }
}

/**
 * Request access to view a private talent profile
 */
export async function requestProfileAccess(talentUserId, requestData = {}) {
  try {
    const response = await apiClient.post(`/profile/access-request/${talentUserId}`, requestData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to request profile access"));
  }
}

/**
 * Get all incoming profile view requests for the authenticated talent
 */
export async function getProfileAccessRequests() {
  try {
    const response = await apiClient.get("/profile/access-requests");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

/**
 * Approve or reject a profile view access request
 */
export async function respondToProfileAccessRequest(requestId, approved) {
  try {
    const response = await apiClient.put(`/profile/access-requests/${requestId}/status?approved=${approved}`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to respond to access request"));
  }
}

export const profileAccessApi = {
  updateProfilePrivacy,
  requestProfileAccess,
  getProfileAccessRequests,
  respondToProfileAccessRequest,
};

export default profileAccessApi;
