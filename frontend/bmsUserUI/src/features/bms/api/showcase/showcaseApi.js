import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Upload physical image or video file for showcase works
 */
export async function uploadShowcaseMedia(file, mediaType = "PHOTO") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mediaType", mediaType);

  const res = await apiClient.post("/showcase/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
}

/**
 * Submit a new showcase item for Admin review (enters PENDING)
 */
export async function createShowcaseItem(data) {
  const res = await apiClient.post("/showcase", data);
  return res.data;
}

/**
 * Get current logged-in client or partner's showcase works
 */
export async function getMyShowcaseItems() {
  const res = await apiClient.get("/showcase/my");
  return res.data || [];
}

/**
 * Delete own showcase item
 */
export async function deleteMyShowcaseItem(id) {
  const res = await apiClient.delete(`/showcase/${id}`);
  return res.data;
}

/**
 * Public read-only: Get approved showcase works for a company/partner
 */
export async function getPublicApprovedShowcase(userId) {
  const res = await apiClient.get(`/public/showcase/${userId}`);
  return res.data || [];
}

/**
 * Public read-only: Full company or academy dossier with approved showcase works & active briefs
 */
export async function getPublicCompanyProfile(userId) {
  const res = await apiClient.get(`/public/showcase/company-profile/${userId}`);
  return res.data;
}

/**
 * Admin: Get showcase works for moderation desk
 */
export async function getAdminShowcaseItems(type = "ALL", status = "ALL") {
  const params = new URLSearchParams();
  if (type && type !== "ALL") params.append("type", type);
  if (status && status !== "ALL") params.append("status", status);
  const res = await apiClient.get(`/admin/showcase?${params.toString()}`);
  return res.data || [];
}

/**
 * Admin: Approve showcase work to go live
 */
export async function approveShowcaseItem(id) {
  const res = await apiClient.post(`/admin/showcase/${id}/approve`);
  return res.data;
}

/**
 * Admin: Reject showcase work with reason
 */
export async function rejectShowcaseItem(id, reason) {
  const res = await apiClient.post(`/admin/showcase/${id}/reject`, { reason });
  return res.data;
}

/**
 * Admin: Delete showcase work permanently
 */
export async function deleteShowcaseItemByAdmin(id) {
  const res = await apiClient.delete(`/admin/showcase/${id}`);
  return res.data;
}

export const showcaseApi = {
  uploadShowcaseMedia,
  createShowcaseItem,
  getMyShowcaseItems,
  deleteMyShowcaseItem,
  getPublicApprovedShowcase,
  getPublicCompanyProfile,
  getAdminShowcaseItems,
  approveShowcaseItem,
  rejectShowcaseItem,
  deleteShowcaseItemByAdmin
};

export default showcaseApi;
