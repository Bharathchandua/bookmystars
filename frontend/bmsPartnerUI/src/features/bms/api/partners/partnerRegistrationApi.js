import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

/**
 * Public Partner Registration (from Become a Partner page)
 * Sends public request without stale tokens and supports dual fallback endpoint
 */
export const registerPartner = async (partnerData) => {
  try {
    const res = await apiClient.post("/partners/register", partnerData, {
      headers: { Authorization: "" }
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 403 || err.response?.status === 401 || err.response?.status === 404) {
      try {
        const fallbackRes = await apiClient.post("/auth/partners/register", partnerData, {
          headers: { Authorization: "" }
        });
        return fallbackRes.data;
      } catch (fallbackErr) {
        throw new Error(extractError(fallbackErr, extractError(err, "Partner registration failed")));
      }
    }
    throw new Error(extractError(err, "Failed to submit partner application"));
  }
};

export const partnerRegistrationApi = {
  registerPartner,
};

export default partnerRegistrationApi;
