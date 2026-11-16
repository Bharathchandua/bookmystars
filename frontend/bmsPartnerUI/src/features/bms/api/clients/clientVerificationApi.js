import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Super Admin: Fetch all registered client brands
 */
export async function getAdminClients(status = "ALL") {
  try {
    const res = await apiClient.get(`/admin/clients?status=${status}`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch client brands:", err);
    throw err;
  }
}

/**
 * Super Admin: Get count of client brands pending review
 */
export async function getPendingClientsCount() {
  try {
    const res = await apiClient.get("/admin/clients/pending-count");
    return res.data?.pendingCount || 0;
  } catch (err) {
    console.warn("Could not fetch pending clients count:", err);
    return 0;
  }
}

/**
 * Super Admin: Approve a client brand account
 */
export async function verifyAdminClient(clientId) {
  try {
    const res = await apiClient.post(`/admin/clients/${clientId}/verify`);
    return res.data;
  } catch (err) {
    console.error("Failed to verify client:", err);
    throw err;
  }
}

/**
 * Super Admin: Reject a client brand account with an optional reason note
 */
export async function rejectAdminClient(clientId, reason) {
  try {
    const res = await apiClient.post(`/admin/clients/${clientId}/reject`, { reason });
    return res.data;
  } catch (err) {
    console.error("Failed to reject client:", err);
    throw err;
  }
}

export const clientVerificationApi = {
  getAdminClients,
  getPendingClientsCount,
  verifyAdminClient,
  rejectAdminClient,
};

export default clientVerificationApi;
