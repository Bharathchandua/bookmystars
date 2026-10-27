import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// CASTING APPLICATIONS APIs (/api/professional/applications)
// ==========================================

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

export async function applyForCastingCall(data) {
  try {
    const response = await apiClient.post("/professional/applications", data);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to submit audition application"));
  }
}

export async function getMyCastingApplications() {
  try {
    const response = await apiClient.get("/professional/applications/my");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function getReceivedCastingApplications() {
  try {
    const response = await apiClient.get("/professional/applications/received");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export const castingApplicationsApi = {
  getApplicantsForCasting,
  updateApplicantStatus,
  applyForCastingCall,
  getMyCastingApplications,
  getReceivedCastingApplications,
};

export default castingApplicationsApi;
