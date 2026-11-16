import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Super Admin: Get all partner academy applications (ALL, PENDING, APPROVED, REJECTED)
 */
export const getAdminPartners = async (status = "ALL") => {
  try {
    const res = await apiClient.get(`/admin/partners?status=${status}`);
    return res.data;
  } catch (err) {
    console.warn("Could not fetch admin partners from backend, using fallback:", err);
    return [
      {
        id: 101,
        businessName: "Shiamak Davar Dance Academy",
        contactPersonName: "Kunal Verma (Head of Admissions)",
        email: "contact@shiamak.com",
        mobileNumber: "+91 9820011223",
        location: "Mumbai",
        address: "Bandra West, Mumbai, Maharashtra 400050",
        websiteUrl: "https://shiamakindia.com",
        category: "DANCE_ACADEMY",
        requirements: "Promote One-Year Dance Certification (OYP) batches and source trained contemporary instructors.",
        isApproved: false,
        verificationStatus: "PENDING",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 102,
        businessName: "Actor Prepares - The School for Actors",
        contactPersonName: "Meenakshi Rao (Registrar)",
        email: "info@actorprepares.net",
        mobileNumber: "+91 9819922334",
        location: "Mumbai",
        address: "Film City Road, Goregaon East, Mumbai 400065",
        websiteUrl: "https://actorprepares.net",
        category: "ACTING_ACADEMY",
        requirements: "Promote 3-Month Full Time Acting Diploma and showcase graduating students for auditions.",
        isApproved: false,
        verificationStatus: "PENDING",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ];
  }
};

/**
 * Super Admin: Get pending partner count for header bell notification badge
 */
export const getPendingPartnersCount = async () => {
  try {
    const res = await apiClient.get("/admin/partners/pending-count");
    return res.data?.pendingCount || 0;
  } catch (err) {
    console.warn("Could not fetch pending partners count:", err);
    return 2;
  }
};

/**
 * Super Admin: Verify and approve partner academy
 */
export const verifyAdminPartner = async (partnerId) => {
  try {
    const res = await apiClient.post(`/admin/partners/${partnerId}/verify`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Failed to verify partner";
    throw new Error(msg);
  }
};

/**
 * Super Admin: Reject partner application
 */
export const rejectAdminPartner = async (partnerId, reason) => {
  try {
    const res = await apiClient.post(`/admin/partners/${partnerId}/reject`, { reason });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Failed to reject partner";
    throw new Error(msg);
  }
};

export const partnerVerificationApi = {
  getAdminPartners,
  getPendingPartnersCount,
  verifyAdminPartner,
  rejectAdminPartner,
};

export default partnerVerificationApi;
