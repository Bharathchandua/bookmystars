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
