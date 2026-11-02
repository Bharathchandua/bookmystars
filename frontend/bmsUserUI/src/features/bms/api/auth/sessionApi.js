import { emitLiveSync } from "../../../../shared/utils/liveSync";

// Clear legacy cross-tab tokens from localStorage so each browser tab maintains its own independent session
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("bms_token");
    localStorage.removeItem("bms_user");
    localStorage.removeItem("bms_profile_photo");
  } catch (e) {}
}

/**
 * Helper to get the saved JWT token from sessionStorage
 */
export function getStoredToken() {
  return sessionStorage.getItem("bms_token");
}

export const getAuthToken = getStoredToken;

/**
 * Helper to get the saved user object from sessionStorage
 */
export function getStoredUser() {
  const user = sessionStorage.getItem("bms_user");
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Headers helper including Bearer token for authenticated requests
 */
export function getAuthHeaders() {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Headers helper for Multipart/file uploads
 */
export function getAuthUploadHeaders() {
  const token = getStoredToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Log out the user by clearing session and local storage
 */
export function logoutUser() {
  sessionStorage.removeItem("bms_token");
  sessionStorage.removeItem("bms_user");
  sessionStorage.removeItem("bms_profile_photo");
  localStorage.removeItem("bms_token");
  localStorage.removeItem("bms_user");
  localStorage.removeItem("bms_profile_photo");
  emitLiveSync("auth_changed", { action: "logout" });
}

export const sessionApi = {
  getStoredToken,
  getAuthToken,
  getStoredUser,
  getAuthHeaders,
  getAuthUploadHeaders,
  logoutUser,
};

export default sessionApi;
