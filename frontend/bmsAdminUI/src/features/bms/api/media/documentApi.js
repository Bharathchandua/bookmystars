import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

// ==========================================
// DOCUMENT APIs (/api/profile/documents)
// ==========================================

export async function getMyDocuments() {
  try {
    const response = await apiClient.get("/profile/documents");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export async function uploadDocumentFile({ file, title, category }) {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (category) formData.append("category", category || "Resume / CV");

  try {
    const response = await apiClient.post("/profile/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Failed to upload document"));
  }
}

export async function deleteDocument(id) {
  try {
    await apiClient.delete(`/profile/documents/${id}`);
    return true;
  } catch (err) {
    return false;
  }
}

export const documentApi = {
  getMyDocuments,
  uploadDocumentFile,
  deleteDocument,
};

export default documentApi;
