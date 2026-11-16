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

export const clientRegistrationApi = {
  registerClient,
};

export default clientRegistrationApi;
