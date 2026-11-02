import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// BOOKINGS APIs (/api/bookings)
// ==========================================

export async function createBookingRequest(data) {
  try {
    const response = await apiClient.post("/bookings/requests", data);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to send booking request"));
  }
}

export async function getIncomingBookingRequests() {
  try {
    const response = await apiClient.get("/bookings/requests/incoming");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function getSentBookingRequests() {
  try {
    const response = await apiClient.get("/bookings/requests/sent");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function updateBookingRequestStatus(requestId, status) {
  try {
    const response = await apiClient.put(`/bookings/requests/${requestId}/status?status=${status}`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update booking status"));
  }
}

export async function getMyBookings() {
  try {
    const response = await apiClient.get("/bookings/my");
    return response.data;
  } catch (err) {
    return [];
  }
}

export async function createBooking(payload) {
  try {
    const response = await apiClient.post("/bookings", payload);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to create booking"));
  }
}

export async function updateBookingStatus(id, status) {
  try {
    const response = await apiClient.patch(`/bookings/${id}/status`, { status });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update booking status"));
  }
}

export const bookingsApi = {
  createBookingRequest,
  getIncomingBookingRequests,
  getSentBookingRequests,
  updateBookingRequestStatus,
  getMyBookings,
  createBooking,
  updateBookingStatus,
};

export default bookingsApi;
