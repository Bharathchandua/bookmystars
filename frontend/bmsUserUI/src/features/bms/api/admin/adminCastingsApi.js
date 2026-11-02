import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Super Admin Casting Notices & Shoot Briefs Moderation API
 */

/**
 * Get list of casting calls for administrative moderation
 */
export const getAdminCastings = async (status = "ALL") => {
  try {
    const res = await apiClient.get(`/admin/castings?status=${status}`);
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch admin castings from backend, using fallback:", err);
    return null;
  }
};

/**
 * Get list of pending casting submissions
 */
export const getPendingCastingsQueue = async () => {
  try {
    const res = await apiClient.get("/admin/castings?status=IN_REVIEW");
    return res.data;
  } catch (err) {
    return [
      {
        id: "OPP-9402",
        title: "Web Series - Lead Role",
        projectType: "FEATURE FILM",
        productionHouse: "DreamWorks & Dharma Productions",
        budget: "₹4,50,000",
        date: "24",
        month: "MAY",
        location: "Mumbai",
        status: "Confirmed",
        escrowVerified: true
      },
      {
        id: "OPP-9403",
        title: "Feature Film - Supporting Role",
        projectType: "WEB SERIES",
        productionHouse: "Silver Screen Entertainment",
        budget: "₹1,80,000",
        date: "28",
        month: "MAY",
        location: "Hyderabad",
        status: "Pending",
        escrowVerified: true
      },
      {
        id: "OPP-9404",
        title: "TV Commercial - Lead",
        projectType: "COMMERCIAL TVC",
        productionHouse: "Bright Ads & Red Chillies",
        budget: "₹2,40,000",
        date: "02",
        month: "JUN",
        location: "Mumbai",
        status: "Shortlisted",
        escrowVerified: true
      }
    ];
  }
};

/**
 * Approve a casting call and publish it live into PostgreSQL
 */
export const approveCastingNotice = async (castingId) => {
  try {
    const res = await apiClient.post(`/admin/castings/${castingId}/approve`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Reject or flag a casting call with feedback
 */
export const rejectCastingNotice = async (castingId, reason = "Does not meet editorial guidelines") => {
  try {
    const res = await apiClient.post(`/admin/castings/${castingId}/reject`, { reason });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Permanently delete a casting call from PostgreSQL database
 */
export const deleteCastingNotice = async (castingId) => {
  try {
    const res = await apiClient.delete(`/admin/castings/${castingId}`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};
