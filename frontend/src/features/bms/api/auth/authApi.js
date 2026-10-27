import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";
import { emitLiveSync } from "../../../../shared/utils/liveSync";

/**
 * Helper to get the saved JWT token from localStorage
 */
export function getStoredToken() {
  return localStorage.getItem("bms_token");
}

export const getAuthToken = getStoredToken;

/**
 * Helper to get the saved user object from localStorage
 */
export function getStoredUser() {
  const user = localStorage.getItem("bms_user");
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
 * Log out the user by clearing localStorage
 */
export function logoutUser() {
  localStorage.removeItem("bms_token");
  localStorage.removeItem("bms_user");
  localStorage.removeItem("bms_profile_photo");
  emitLiveSync("auth_changed", { action: "logout" });
}

/**
 * Helper to format relative image URL to full URL
 */
function resolveImageUrl(url) {
  if (!url) return "";
  if (typeof url !== "string") {
    if (url && typeof url.photoUrl === "string") url = url.photoUrl;
    else if (url && typeof url.url === "string") url = url.url;
    else return "";
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
}

/**
 * Register a new user
 * Formats the data to match the Spring Boot RegistrationRequest DTO
 */
export async function registerUser(formData) {
  let genderEnum = (formData.gender || "").toUpperCase();
  if (genderEnum === "PREFER-NOT-TO-SAY" || !["MALE", "FEMALE"].includes(genderEnum)) {
    genderEnum = "OTHER";
  }

  const profileTypes = (formData.selectedProfiles || []).map((type) => {
    const upper = (type || "").toUpperCase().replace(/\s+/g, "_");
    if (["ACTOR", "MODEL", "DANCER", "SINGER", "DIRECTOR", "PRODUCER"].includes(upper)) {
      return upper;
    }
    if (upper.includes("DIRECTOR")) return "DIRECTOR";
    if (upper.includes("PRODUCER") || upper.includes("PRODUCTION")) return "PRODUCER";
    return "OTHER";
  });

  if (formData.customProfession) {
    localStorage.setItem(`bms_custom_profession_${(formData.email || "").toLowerCase().trim()}`, formData.customProfession.trim());
  }

  const payload = {
    accountType: (formData.accountType || "talent").toUpperCase(),
    fullName: (formData.fullName || "").trim(),
    stageName: formData.stageName ? formData.stageName.trim() : null,
    email: (formData.email || "").trim(),
    mobileNumber: (formData.mobileNumber || "").trim(),
    password: formData.password,
    dateOfBirth: formData.dob,
    gender: genderEnum,
    location: (formData.location || "").trim(),
    profileTypes: profileTypes.length > 0 ? profileTypes : ["OTHER"],
    referralSource: formData.howHeard || null,
    termsAccepted: Boolean(formData.agreeTerms),
    customProfession: (formData.primaryProfession || (formData.selectedProfiles && formData.selectedProfiles[0]) || formData.customProfession || "").trim(),
    primaryProfession: (formData.primaryProfession || (formData.selectedProfiles && formData.selectedProfiles[0]) || formData.customProfession || "").trim(),
    languages: Array.isArray(formData.languages) ? formData.languages.join(", ") : (formData.languages || ""),
    actingLanguages: Array.isArray(formData.actingLanguages) ? formData.actingLanguages.join(", ") : (formData.actingLanguages || ""),
    talentCategory: formData.talentCategory || "ACTING",
  };

  try {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Registration failed. Please check your inputs."));
  }
}

/**
 * Log in an existing user
 * Saves the token and user info into localStorage upon success
 */
export async function loginUser(email, password) {
  try {
    const response = await apiClient.post("/auth/login", {
      email: email.trim(),
      password: password,
    });

    const data = response.data;

    if (data?.token) {
      // Purge any stale session data from previous user
      localStorage.removeItem("bms_token");
      localStorage.removeItem("bms_user");
      localStorage.removeItem("bms_profile_photo");

      const savedCustomProf = data.customProfession || localStorage.getItem(`bms_custom_profession_${email.trim().toLowerCase()}`);
      if (savedCustomProf) {
        localStorage.setItem(`bms_custom_profession_${email.trim().toLowerCase()}`, savedCustomProf);
      }
      localStorage.setItem("bms_token", data.token);
      localStorage.setItem(
        "bms_user",
        JSON.stringify({
          userId: data.userId,
          email: data.email,
          fullName: data.fullName,
          accountType: data.accountType,
          customProfession: savedCustomProf || null,
        })
      );
      if (data.profilePhoto) {
        localStorage.setItem("bms_profile_photo", resolveImageUrl(data.profilePhoto));
      }
      window.dispatchEvent(new Event("profile_photo_updated"));
      emitLiveSync("auth_changed", { action: "login", user: data });
    }

    return data;
  } catch (err) {
    let errorMsg = extractError(err, "Invalid email or password");
    // Preserve custom verification or partner status messages returned from backend
    const isVerificationMsg = errorMsg && (
      errorMsg.toLowerCase().includes("verification") || 
      errorMsg.toLowerCase().includes("partner") || 
      errorMsg.toLowerCase().includes("pending") ||
      errorMsg.toLowerCase().includes("rejected") ||
      errorMsg.toLowerCase().includes("approved")
    );
    if (!isVerificationMsg && (!errorMsg || errorMsg.toLowerCase().includes("internal server error") || err?.response?.status === 401 || err?.response?.status === 403)) {
      errorMsg = "Invalid email or password";
    }
    throw new Error(errorMsg);
  }
}

export const authApi = {
  getStoredToken,
  getAuthToken,
  getStoredUser,
  getAuthHeaders,
  getAuthUploadHeaders,
  logoutUser,
  registerUser,
  loginUser,
};

export default authApi;
