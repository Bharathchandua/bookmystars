import apiClient from "../../../shared/services/axiosConfig";

/**
 * Feature API: Dashboard Services
 */
export const dashboardApi = {
  getProfessionalStats: async () => {
    const response = await apiClient.get("/dashboard/professional/stats");
    return response.data;
  },

  getRecentBookings: async () => {
    const response = await apiClient.get("/bookings/my");
    return response.data;
  },
};

export default dashboardApi;
