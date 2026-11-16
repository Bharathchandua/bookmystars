import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// AUDIO APIs (/api/profile/audios)
// ==========================================

export async function getMyAudios() {
  try {
    const response = await apiClient.get("/profile/audios");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function uploadAudioFile({ file, title, category, duration }) {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (category) formData.append("category", category || "Voice Sample");
  if (duration) formData.append("duration", duration);

  try {
    const response = await apiClient.post("/profile/audios/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload audio file"));
  }
}

export async function deleteAudio(id) {
  try {
    await apiClient.delete(`/profile/audios/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

export const audioApi = {
  getMyAudios,
  uploadAudioFile,
  deleteAudio,
};

export default audioApi;
