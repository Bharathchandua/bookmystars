import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

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

export const workExperienceApi = {
  getMyWorkExperiences,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  uploadWorkExperienceFile,
};

export default workExperienceApi;
