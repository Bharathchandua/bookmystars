import apiClient from "../../../../shared/services/axiosConfig";

export async function getPartnerProfile() {
  try {
    const response = await apiClient.get("/partners/profile/me");
    return response.data;
  } catch (err) {
    console.warn("Could not fetch partner profile from server, falling back:", err);
    return null;
  }
}

export async function updatePartnerProfile(profileData) {
  const response = await apiClient.put("/partners/profile/me", profileData);
  return response.data;
}

export const partnerProfileApi = {
  getPartnerProfile,
  updatePartnerProfile,
};

export default partnerProfileApi;
