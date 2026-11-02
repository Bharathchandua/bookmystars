import apiClient from "../../../../shared/services/axiosConfig";

export async function getReceivedApplications() {
  try {
    const response = await apiClient.get("/professional/applications/received");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.warn("Could not fetch received applications:", err);
    return [];
  }
}

export async function getApplicantsForBrief(briefId) {
  try {
    const response = await apiClient.get(`/professional/applications/casting/${briefId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.warn(`Could not fetch applicants for brief ${briefId}:`, err);
    return [];
  }
}

export async function updateApplicationStatus(applicationId, status) {
  const response = await apiClient.put(`/professional/applications/${applicationId}/status?status=${status}`);
  return response.data;
}

export const applicationsApi = {
  getReceivedApplications,
  getApplicantsForBrief,
  updateApplicationStatus,
};

export default applicationsApi;
