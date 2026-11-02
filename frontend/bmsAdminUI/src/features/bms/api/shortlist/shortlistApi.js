import apiClient from "../../../../shared/services/axiosConfig";

export async function getMyShortlistIds() {
  try {
    const response = await apiClient.get("/shortlist/my");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.warn("Could not fetch shortlist from server:", err);
    return [];
  }
}

export async function getMyShortlistedTalents() {
  try {
    const response = await apiClient.get("/shortlist/my/details");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.warn("Could not fetch shortlist details from server:", err);
    return [];
  }
}

export async function toggleShortlist(talentId) {
  try {
    const response = await apiClient.post(`/shortlist/${talentId}/toggle`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Failed to toggle shortlist on server:", err);
    throw err;
  }
}

export async function addToShortlist(talentId) {
  const response = await apiClient.post(`/shortlist/${talentId}`);
  return Array.isArray(response.data) ? response.data : [];
}

export async function removeFromShortlist(talentId) {
  const response = await apiClient.delete(`/shortlist/${talentId}`);
  return Array.isArray(response.data) ? response.data : [];
}

export const shortlistApi = {
  getMyShortlistIds,
  getMyShortlistedTalents,
  toggleShortlist,
  addToShortlist,
  removeFromShortlist,
};

export default shortlistApi;
