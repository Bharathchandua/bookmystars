import apiClient from "../../../../shared/services/axiosConfig";
import { getProfessionalStats } from "../professional/professionalApi";

/**
 * Feature API: Dashboard Services
 */
export { getProfessionalStats };

export async function getRecentBookings() {
  const response = await apiClient.get("/bookings/my");
  return response.data;
}

export const dashboardApi = {
  getProfessionalStats,
  getRecentBookings,
};

export default dashboardApi;
