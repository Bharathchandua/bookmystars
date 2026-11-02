import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// AVAILABILITY APIs (/api/profile/availability)
// ==========================================

export async function getMyAvailability() {
  try {
    const response = await apiClient.get("/profile/availability/my");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function getUserAvailability(userId) {
  try {
    const response = await apiClient.get(`/profile/availability/user/${userId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function saveAvailabilitySlot({ availabilityDate, status, description, startTime, endTime }) {
  const payload = {
    availabilityDate,
    status: status || "AVAILABLE",
    description: description || null,
    startTime: startTime ? (startTime.length === 5 ? `${startTime}:00` : startTime) : null,
    endTime: endTime ? (endTime.length === 5 ? `${endTime}:00` : endTime) : null,
  };

  try {
    const response = await apiClient.post("/profile/availability", payload);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to save availability slot"));
  }
}

export async function deleteAvailabilitySlot(id) {
  try {
    await apiClient.delete(`/profile/availability/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

export async function deleteAvailabilityByDate(dateStr) {
  try {
    await apiClient.delete(`/profile/availability/date/${dateStr}`);
    return true;
  } catch (err) {
    return false;
  }
}

export const availabilityApi = {
  getMyAvailability,
  getUserAvailability,
  saveAvailabilitySlot,
  deleteAvailabilitySlot,
  deleteAvailabilityByDate,
};

export default availabilityApi;
