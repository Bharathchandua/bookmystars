import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// PROFESSIONAL & AGENCY PROFILE APIs
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

export const professionalApi = {
  getProfessionalStats,
  getProfessionalProfile,
  updateProfessionalProfile,
};

export default professionalApi;
