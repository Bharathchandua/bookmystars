import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// MEASUREMENTS APIs (/api/profile/measurements)
// ==========================================

export async function getMyMeasurements() {
  try {
    const response = await apiClient.get("/profile/measurements");
    return response.data;
  } catch (err) {
    return null;
  }
}

export async function saveMeasurements(measurementsData) {
  try {
    const response = await apiClient.put("/profile/measurements", measurementsData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to save measurements"));
  }
}

export const measurementsApi = {
  getMyMeasurements,
  saveMeasurements,
};

export default measurementsApi;
