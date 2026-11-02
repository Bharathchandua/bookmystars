import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// PORTFOLIO APIs (/api/profile/portfolio)
// ==========================================

export async function getMyPortfolio() {
  try {
    const response = await apiClient.get("/profile/portfolio");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function uploadPortfolioPhoto(file, title = "", category = "") {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (category) formData.append("category", category);

  try {
    const response = await apiClient.post("/profile/portfolio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload photo"));
  }
}

export async function updatePortfolioPhoto(id, { title, category, file } = {}) {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (title !== undefined) formData.append("title", title);
  if (category !== undefined) formData.append("category", category);

  try {
    const response = await apiClient.put(`/profile/portfolio/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to update portfolio photo"));
  }
}

export async function deletePortfolioPhoto(id) {
  try {
    await apiClient.delete(`/profile/portfolio/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Resolves relative uploaded image URLs (e.g. /uploads/portfolio/...)
 * to full backend server URLs (http://localhost:8080/uploads/...)
 */
export function getFullImageUrl(url) {
  if (!url) return "";
  if (typeof url !== "string") {
    if (url && typeof url.photoUrl === "string") {
      url = url.photoUrl;
    } else if (url && typeof url.url === "string") {
      url = url.url;
    } else {
      return "";
    }
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
}

export const portfolioApi = {
  getMyPortfolio,
  uploadPortfolioPhoto,
  updatePortfolioPhoto,
  deletePortfolioPhoto,
  getFullImageUrl,
};

export default portfolioApi;
