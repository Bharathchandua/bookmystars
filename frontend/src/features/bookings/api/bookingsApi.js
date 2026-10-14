import apiClient from "../../../shared/services/axiosConfig";

/**
 * Feature API: Bookings Services
 */
export const bookingsApi = {
  getMyBookings: async () => {
    const response = await apiClient.get("/bookings/my");
    return response.data;
  },

  createBooking: async (payload) => {
    const response = await apiClient.post("/bookings", payload);
    return response.data;
  },

  updateBookingStatus: async (id, status) => {
    const response = await apiClient.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },
};

export default bookingsApi;
