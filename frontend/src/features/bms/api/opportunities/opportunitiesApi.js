import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// OPPORTUNITIES / CASTING CALLS APIs (/api/professional/castings)
// ==========================================

export async function getMyCastingCalls() {
  try {
    const response = await apiClient.get("/professional/castings/my");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function getPublicCastingCalls(roleType = null) {
  try {
    const url = roleType ? `/professional/castings/public?roleType=${roleType}` : "/professional/castings/public";
    const response = await apiClient.get(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function uploadOpportunityMedia(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/professional/castings/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload opportunity media file"));
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

export const opportunitiesApi = {
  getMyCastingCalls,
  getPublicCastingCalls,
  uploadOpportunityMedia,
  createCastingCall,
  updateCastingCall,
  deleteCastingCall,
};

export default opportunitiesApi;
