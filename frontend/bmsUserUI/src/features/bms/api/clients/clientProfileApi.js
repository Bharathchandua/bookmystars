import apiClient from "../../../../shared/services/axiosConfig";

export async function getClientProfile() {
  try {
    const response = await apiClient.get("/clients/profile/me");
    return response.data;
  } catch (err) {
    console.warn("Could not fetch client profile from server, falling back:", err);
    return null;
  }
}

export async function updateClientProfile(profileData) {
  const response = await apiClient.put("/clients/profile/me", profileData);
  return response.data;
}

export const clientProfileApi = {
  getClientProfile,
  updateClientProfile,
};

export default clientProfileApi;
