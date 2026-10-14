import apiClient from "./axiosConfig";

/**
 * Authentication API Service (Login, Register, Logout)
 */
export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("bms_token");
    localStorage.removeItem("bms_user");
    localStorage.removeItem("bms_profile_photo");
  },
};

export default authApi;
