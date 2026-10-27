import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Public registration for commercial brand clients (Jewelry, Hardware, Fashion, etc.)
 */
export async function registerClient(clientData) {
  try {
    const response = await apiClient.post("/clients/register", clientData, {
      headers: {
        Authorization: ""
      }
    });
    return response.data;
  } catch (err) {
    // Fallback attempt via open auth prefix
    if (err.response && (err.response.status === 403 || err.response.status === 404 || err.response.status === 401)) {
      try {
        const fallbackRes = await apiClient.post("/auth/clients/register", clientData, {
          headers: {
            Authorization: ""
          }
        });
        return fallbackRes.data;
      } catch (fallbackErr) {
        const msg = fallbackErr.response?.data?.message || fallbackErr.response?.data?.error || fallbackErr.message;
        throw new Error(msg || "Client registration failed.");
      }
    }
    const msg = err.response?.data?.message || err.response?.data?.error || err.message;
    throw new Error(msg || "Client registration failed.");
  }
}

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
