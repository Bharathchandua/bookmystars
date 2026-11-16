import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";
import { getStoredUser } from "../auth/authApi";
import {
  updateProfilePrivacy,
  requestProfileAccess,
  getProfileAccessRequests,
  respondToProfileAccessRequest,
} from "./profileAccessApi";

export {
  updateProfilePrivacy,
  requestProfileAccess,
  getProfileAccessRequests,
  respondToProfileAccessRequest,
};

/**
 * Fetch the authenticated user's profile
 */
export async function getCurrentUserProfile() {
  try {
    const response = await apiClient.get("/profile");
    const data = response.data;
    if (data?.customProfession) {
      const user = getStoredUser();
      if (user) {
        localStorage.setItem("bms_user", JSON.stringify({ ...user, customProfession: data.customProfession }));
        if (user.email) {
          localStorage.setItem(`bms_custom_profession_${user.email.toLowerCase()}`, data.customProfession);
        }
      }
    }
    return data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to load profile."));
  }
}

/**
 * Update authenticated user's profile
 */
export async function updateUserProfile(profileData) {
  try {
    const response = await apiClient.put("/profile", profileData);
    const data = response.data;
    const user = getStoredUser();
    if (user) {
      if (profileData.customProfession) {
        localStorage.setItem("bms_user", JSON.stringify({ ...user, customProfession: profileData.customProfession }));
        if (user.email) {
          localStorage.setItem(`bms_custom_profession_${user.email.toLowerCase()}`, profileData.customProfession);
        }
      } else {
        localStorage.setItem("bms_user", JSON.stringify({ ...user, customProfession: "" }));
        if (user.email) {
          localStorage.removeItem(`bms_custom_profession_${user.email.toLowerCase()}`);
        }
      }
    }
    return data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update profile"));
  }
}

/**
 * Upload profile avatar/photo to backend storage
 */
export async function uploadProfilePhoto(fileOrBlob) {
  const formData = new FormData();
  formData.append("file", fileOrBlob, "avatar.jpg");

  try {
    const response = await apiClient.post("/profile/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload profile photo"));
  }
}

/**
 * Fetch a user's full public profile by userId
 */
export async function getPublicUserProfile(userId, viewerEmail) {
  const query = viewerEmail ? `?viewerEmail=${encodeURIComponent(viewerEmail)}` : "";
  try {
    const response = await apiClient.get(`/profile/public/${userId}${query}`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to load public profile"));
  }
}

/**
 * Fetch backend-generated share metadata for the authenticated user
 */
export async function getShareProfileData() {
  try {
    const response = await apiClient.get("/profile/share");
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to load share data"));
  }
}

export const profileApi = {
  getCurrentUserProfile,
  updateUserProfile,
  uploadProfilePhoto,
  getPublicUserProfile,
  updateProfilePrivacy,
  requestProfileAccess,
  getProfileAccessRequests,
  respondToProfileAccessRequest,
  getShareProfileData,
};

export default profileApi;
