import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Super Admin Talent KYC, Identity Verification & Profile Moderation API
 */

/**
 * Get Talent KYC & Verification queue from PostgreSQL
 */
export const getAdminTalentsKyc = async () => {
  try {
    const res = await apiClient.get("/admin/talents/kyc");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch talents KYC from backend:", err);
    return null;
  }
};

/**
 * Verify identity documents and award blue checkmark badge in PostgreSQL
 */
export const awardVerifiedBadge = async (userId) => {
  try {
    const res = await apiClient.post(`/admin/talents/${userId}/verify`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Revoke Verified Star Badge and return KYC status to pending in PostgreSQL
 */
export const revokeVerifiedBadge = async (userId) => {
  try {
    const res = await apiClient.post(`/admin/talents/${userId}/unverify`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Update talent details, credentials, and verification as platform administrator
 */
export const updateAdminTalent = async (userId, updates) => {
  try {
    const res = await apiClient.put(`/admin/talents/${userId}`, updates);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Permanently delete a user account and all profile data from database
 */
export const deleteUserAccount = async (userId) => {
  try {
    const res = await apiClient.delete(`/admin/users/${userId}`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Get all pending talent media (photos, videos, audios) awaiting admin review
 */
export const getPendingTalentMedia = async () => {
  try {
    const res = await apiClient.get("/admin/talent-media/pending");
    return res.data || [];
  } catch (err) {
    console.warn("Failed to fetch pending talent media from backend:", err);
    return [];
  }
};

/**
 * Get all media items for a specific talent user
 */
export const getTalentMediaByUser = async (userId) => {
  try {
    const res = await apiClient.get(`/admin/talent-media/user/${userId}`);
    return res.data || [];
  } catch (err) {
    console.warn(`Failed to fetch media for user ${userId}:`, err);
    return [];
  }
};

/**
 * Review talent media (approve or reject with reason)
 */
export const reviewTalentMedia = async (mediaType, id, status, rejectionReason = "") => {
  try {
    const res = await apiClient.put(`/admin/talent-media/${mediaType}/${id}/review`, {
      status,
      rejectionReason,
    });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};
