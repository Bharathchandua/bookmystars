import apiClient from "../../../shared/services/axiosConfig";

/**
 * Feature API: Profile & Work Experience Services
 */
export const profileApi = {
  getProfile: async () => {
    const response = await apiClient.get("/profile");
    return response.data;
  },

  updateProfile: async (payload) => {
    const response = await apiClient.put("/profile", payload);
    return response.data;
  },

  getWorkExperiences: async () => {
    const response = await apiClient.get("/work-experience/my");
    return response.data;
  },

  addWorkExperience: async (payload) => {
    const response = await apiClient.post("/work-experience", payload);
    return response.data;
  },

  updateWorkExperience: async (id, payload) => {
    const response = await apiClient.put(`/work-experience/${id}`, payload);
    return response.data;
  },

  deleteWorkExperience: async (id) => {
    const response = await apiClient.delete(`/work-experience/${id}`);
    return response.data;
  },
};

export default profileApi;
