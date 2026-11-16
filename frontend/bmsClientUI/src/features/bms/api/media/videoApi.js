import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// VIDEOS APIs (/api/profile/videos)
// ==========================================

export async function getMyVideos() {
  try {
    const response = await apiClient.get("/profile/videos");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function addVideo(videoData) {
  try {
    const response = await apiClient.post("/profile/videos", videoData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to add video"));
  }
}

export async function uploadVideoFile({ file, title, category, duration, year }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("category", category || "Showreel");
  if (duration) formData.append("duration", duration);
  if (year) formData.append("year", year);

  try {
    const response = await apiClient.post("/profile/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload video from local storage"));
  }
}

export async function updateVideo(id, videoData) {
  try {
    const response = await apiClient.put(`/profile/videos/${id}`, videoData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update video"));
  }
}

export async function updateVideoWithFile(id, { file, title, category, duration, year, videoUrl, thumbnailUrl } = {}) {
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("category", category || "Showreel");
    if (duration) formData.append("duration", duration);
    if (year) formData.append("year", year);

    try {
      const response = await apiClient.put(`/profile/videos/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      throw new Error(extractError(err, "Failed to update video with file"));
    }
  } else {
    return await updateVideo(id, { title, category, duration, year, videoUrl, thumbnailUrl });
  }
}

export async function deleteVideo(id) {
  try {
    await apiClient.delete(`/profile/videos/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

export const videoApi = {
  getMyVideos,
  addVideo,
  uploadVideoFile,
  updateVideoWithFile,
  updateVideo,
  deleteVideo,
};

export default videoApi;
