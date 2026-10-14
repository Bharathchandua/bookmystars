// API service powered by Axios with automatic JWT token attachment and error interception
import apiClient from "../shared/services/axiosConfig";
import { API_BASE_URL, BACKEND_SERVER_URL } from "../shared/services/BaseUrl";

export { API_BASE_URL, BACKEND_SERVER_URL };

/**
 * Helper to safely extract user-friendly error messages from Axios responses
 */
function extractError(error, defaultMsg = "Operation failed") {
  const data = error?.response?.data;
  let msg = data?.message || data?.error || (typeof data === "string" ? data : null);
  if (!msg) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      msg = "Invalid email or password or unauthorized access.";
    } else {
      msg = error?.message || defaultMsg;
    }
  }
  return msg;
}

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
        localStorage.setItem("bms_profile_photo", getFullImageUrl(data.profilePhoto));
      }
      window.dispatchEvent(new Event("profile_photo_updated"));
    }

    return data;
  } catch (err) {
    let errorMsg = extractError(err, "Invalid email or password");
    if (!errorMsg || errorMsg.toLowerCase().includes("internal server error") || err?.response?.status === 401 || err?.response?.status === 403) {
      errorMsg = "Invalid email or password";
    }
    throw new Error(errorMsg);
  }
}

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

// ==========================================
// WORK EXPERIENCE APIs (/api/profile/work-experience)
// ==========================================

export async function getMyWorkExperiences() {
  try {
    const response = await apiClient.get("/profile/work-experience");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function addWorkExperience(experienceData) {
  try {
    const response = await apiClient.post("/profile/work-experience", experienceData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to add work experience"));
  }
}

export async function updateWorkExperience(id, experienceData) {
  try {
    const response = await apiClient.put(`/profile/work-experience/${id}`, experienceData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update work experience"));
  }
}

export async function deleteWorkExperience(id) {
  try {
    await apiClient.delete(`/profile/work-experience/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Upload an attachment / proof file for work experience
 * Stored on backend at uploads/work-experience/
 */
export async function uploadWorkExperienceFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await apiClient.post("/profile/work-experience/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload work experience file"));
  }
}

// ==========================================
// PORTFOLIO APIs (/api/profile/portfolio)
// ==========================================

export async function getMyPortfolio() {
  try {
    const response = await apiClient.get("/profile/portfolio");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function uploadPortfolioPhoto(file, title = "", category = "") {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (category) formData.append("category", category);

  try {
    const response = await apiClient.post("/profile/portfolio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload photo"));
  }
}

export async function updatePortfolioPhoto(id, { title, category, file } = {}) {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (title !== undefined) formData.append("title", title);
  if (category !== undefined) formData.append("category", category);

  try {
    const response = await apiClient.put(`/profile/portfolio/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update portfolio photo"));
  }
}

export async function deletePortfolioPhoto(id) {
  try {
    await apiClient.delete(`/profile/portfolio/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Resolves relative uploaded image URLs (e.g. /uploads/portfolio/...)
 * to full backend server URLs (http://localhost:8080/uploads/...)
 */
export function getFullImageUrl(url) {
  if (!url) return "";
  if (typeof url !== "string") {
    if (url && typeof url.photoUrl === "string") {
      url = url.photoUrl;
    } else if (url && typeof url.url === "string") {
      url = url.url;
    } else {
      return "";
    }
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
}

// ==========================================
// MEASUREMENTS APIs (/api/profile/measurements)
// ==========================================

export async function getMyMeasurements() {
  try {
    const response = await apiClient.get("/profile/measurements");
    return response.data;
  } catch (err) {
    return null;
  }
}

export async function saveMeasurements(measurementsData) {
  try {
    const response = await apiClient.put("/profile/measurements", measurementsData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to save measurements"));
  }
}

// ==========================================
// VIDEOS APIs (/api/profile/videos)
// ==========================================

export async function getMyVideos() {
  try {
    const response = await apiClient.get("/profile/videos");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function addVideo(videoData) {
  try {
    const response = await apiClient.post("/profile/videos", videoData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to add video"));
  }
}

export async function uploadVideoFile({ file, title, category, duration, year }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("category", category || "Showreel");
  if (duration) formData.append("duration", duration);
  if (year) formData.append("year", year);

  try {
    const response = await apiClient.post("/profile/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload video from local storage"));
  }
}

export async function updateVideoWithFile(id, { file, title, category, duration, year, videoUrl, thumbnailUrl } = {}) {
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("category", category || "Showreel");
    if (duration) formData.append("duration", duration);
    if (year) formData.append("year", year);

    try {
      const response = await apiClient.put(`/profile/videos/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      throw new Error(extractError(err, "Failed to update video with file"));
    }
  } else {
    return await updateVideo(id, { title, category, duration, year, videoUrl, thumbnailUrl });
  }
}

export async function updateVideo(id, videoData) {
  try {
    const response = await apiClient.put(`/profile/videos/${id}`, videoData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update video"));
  }
}

export async function deleteVideo(id) {
  try {
    await apiClient.delete(`/profile/videos/${id}`);
    return true;
  } catch (err) {
    return false;
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

// ==========================================
// AUDIO APIs (/api/profile/audios)
// ==========================================

export async function getMyAudios() {
  try {
    const response = await apiClient.get("/profile/audios");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function uploadAudioFile({ file, title, category, duration }) {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (category) formData.append("category", category || "Voice Sample");
  if (duration) formData.append("duration", duration);

  try {
    const response = await apiClient.post("/profile/audios/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload audio file"));
  }
}

export async function deleteAudio(id) {
  try {
    await apiClient.delete(`/profile/audios/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

// ==========================================
// DOCUMENT APIs (/api/profile/documents)
// ==========================================

export async function getMyDocuments() {
  try {
    const response = await apiClient.get("/profile/documents");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function uploadDocumentFile({ file, title, category }) {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (category) formData.append("category", category || "Resume / CV");

  try {
    const response = await apiClient.post("/profile/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload document"));
  }
}

export async function deleteDocument(id) {
  try {
    await apiClient.delete(`/profile/documents/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

// ==========================================
// AVAILABILITY APIs (/api/profile/availability)
// ==========================================

export async function getMyAvailability() {
  try {
    const response = await apiClient.get("/profile/availability/my");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function getUserAvailability(userId) {
  try {
    const response = await apiClient.get(`/profile/availability/user/${userId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function saveAvailabilitySlot({ availabilityDate, status, description, startTime, endTime }) {
  const payload = {
    availabilityDate,
    status: status || "AVAILABLE",
    description: description || null,
    startTime: startTime ? (startTime.length === 5 ? `${startTime}:00` : startTime) : null,
    endTime: endTime ? (endTime.length === 5 ? `${endTime}:00` : endTime) : null,
  };

  try {
    const response = await apiClient.post("/profile/availability", payload);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to save availability slot"));
  }
}

export async function deleteAvailabilitySlot(id) {
  try {
    await apiClient.delete(`/profile/availability/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

export async function deleteAvailabilityByDate(dateStr) {
  try {
    await apiClient.delete(`/profile/availability/date/${dateStr}`);
    return true;
  } catch (err) {
    return false;
  }
}

// ==========================================
// PROFESSIONAL & CASTING APIs
// ==========================================

export async function getProfessionalStats() {
  try {
    const response = await apiClient.get("/professional/dashboard/stats");
    return response.data;
  } catch (err) {
    return null;
  }
}

export async function getProfessionalProfile() {
  try {
    const response = await apiClient.get("/professional/dashboard/profile");
    return response.data;
  } catch (err) {
    return null;
  }
}

export async function updateProfessionalProfile(data) {
  try {
    const response = await apiClient.put("/professional/dashboard/profile", data);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update professional profile"));
  }
}

export async function getMyCastingCalls() {
  try {
    const response = await apiClient.get("/professional/castings/my");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function createCastingCall(data) {
  try {
    const response = await apiClient.post("/professional/castings", data);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to create casting call"));
  }
}

export async function updateCastingCall(id, data) {
  try {
    const response = await apiClient.put(`/professional/castings/${id}`, data);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update casting call"));
  }
}

export async function deleteCastingCall(id) {
  try {
    await apiClient.delete(`/professional/castings/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

export async function getApplicantsForCasting(castingCallId) {
  try {
    const response = await apiClient.get(`/professional/applications/casting/${castingCallId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function updateApplicantStatus(applicationId, status) {
  try {
    const response = await apiClient.put(`/professional/applications/${applicationId}/status?status=${status}`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update applicant status"));
  }
}

export async function getTalentsDirectory({ type, query } = {}) {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (query) params.append("query", query);

  const url = `/professional/talents${params.toString() ? `?${params.toString()}` : ""}`;
  try {
    const response = await apiClient.get(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function createBookingRequest(data) {
  try {
    const response = await apiClient.post("/bookings/requests", data);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to send booking request"));
  }
}

export async function getIncomingBookingRequests() {
  try {
    const response = await apiClient.get("/bookings/requests/incoming");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function getSentBookingRequests() {
  try {
    const response = await apiClient.get("/bookings/requests/sent");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function updateBookingRequestStatus(requestId, status) {
  try {
    const response = await apiClient.put(`/bookings/requests/${requestId}/status?status=${status}`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update booking status"));
  }
}

// ==========================================
// CHAT APIs (/api/chat)
// ==========================================

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
// USER SKILLS MANAGEMENT
// ==========================================

export function getUserSkills(userId) {
  const key = `bms_skills_${userId || "current"}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveUserSkills(userId, skills) {
  const key = `bms_skills_${userId || "current"}`;
  localStorage.setItem(key, JSON.stringify(skills));
  window.dispatchEvent(new Event("skills_updated"));
  // Persist directly to backend database
  updateUserProfile({ skills }).catch((err) => {
    console.warn("Could not sync skills to backend database:", err);
  });
}

export function syncUserSkillsFromProfile(skills, userId) {
  if (Array.isArray(skills)) {
    const key = `bms_skills_${userId || "current"}`;
    localStorage.setItem(key, JSON.stringify(skills));
    window.dispatchEvent(new Event("skills_updated"));
    return skills;
  }
  return getUserSkills(userId);
}

export function addUserSkill(userId, newSkill) {
  const current = getUserSkills(userId);
  if (!current.includes(newSkill)) {
    const updated = [...current, newSkill];
    saveUserSkills(userId, updated);
    return updated;
  }
  return current;
}

export function removeUserSkill(userId, skillToRemove) {
  const current = getUserSkills(userId);
  const updated = current.filter((s) => s !== skillToRemove);
  saveUserSkills(userId, updated);
  return updated;
}
