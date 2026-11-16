import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";
import { emitLiveSync } from "../../../../shared/utils/liveSync";

/**
 * Helper to format relative image URL to full URL
 */
export function resolveImageUrl(url) {
  if (!url) return "";
  if (typeof url !== "string") {
    if (url && typeof url.photoUrl === "string") url = url.photoUrl;
    else if (url && typeof url.url === "string") url = url.url;
    else return "";
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
}

/**
 * Log in an existing user
 * Saves the token and user info into sessionStorage upon success
 */
export async function loginUser(email, password, portal = null) {
  try {
    const payload = {
      email: email.trim(),
      password: password,
    };
    if (portal) {
      payload.portal = portal;
    }
    const response = await apiClient.post("/auth/login", payload);

    const data = response.data;

    if (portal && data) {
      const userType = (data.accountType || "").toUpperCase();
      const expected = portal.toUpperCase();
      let mismatch = false;
      let targetRole = "";
      let targetLink = "";

      if (expected === "PARTNER" && userType !== "PARTNER") {
        mismatch = true;
      } else if (expected === "CLIENT" && userType !== "CLIENT") {
        mismatch = true;
      } else if ((expected === "TALENT" || expected === "PROFESSIONAL") && (userType === "PARTNER" || userType === "CLIENT")) {
        mismatch = true;
      }

      if (mismatch) {
        localStorage.removeItem("bms_token");
        localStorage.removeItem("bms_user");
        localStorage.removeItem("bms_profile_photo");

        if (userType === "PARTNER") {
          targetRole = "Partner Academy";
          targetLink = "/partner/signin";
        } else if (userType === "CLIENT") {
          targetRole = "Client Brand";
          targetLink = "/client/signin";
        } else {
          targetRole = "Talent/Professional";
          targetLink = "/signin";
        }
        const mismatchError = new Error(`This account is registered as ${targetRole}. Please use the ${targetRole} sign-in portal.`);
        mismatchError.targetRole = targetRole;
        mismatchError.targetLink = targetLink;
        throw mismatchError;
      }
    }

    if (data?.token) {
      // Purge any stale session data from previous user
      localStorage.removeItem("bms_token");
      localStorage.removeItem("bms_user");
      localStorage.removeItem("bms_profile_photo");

      const savedCustomProf = data.customProfession || localStorage.getItem(`bms_custom_profession_${email.trim().toLowerCase()}`);
      if (savedCustomProf) {
        localStorage.setItem(`bms_custom_profession_${email.trim().toLowerCase()}`, savedCustomProf);
      }
      sessionStorage.setItem("bms_token", data.token);
      localStorage.removeItem("bms_token");
      sessionStorage.setItem(
        "bms_user",
        JSON.stringify({
          userId: data.userId,
          email: data.email,
          fullName: data.fullName,
          accountType: data.accountType,
          customProfession: savedCustomProf || null,
        })
      );
      if (data.profilePhoto) {
        sessionStorage.setItem("bms_profile_photo", resolveImageUrl(data.profilePhoto));
      }
      window.dispatchEvent(new Event("profile_photo_updated"));
      emitLiveSync("auth_changed", { action: "login", user: data });
    }

    return data;
  } catch (err) {
    if (err.targetLink || err.targetRole) {
      throw err;
    }
    let errorMsg = extractError(err, "Invalid email or password");
    // Preserve custom verification, role mismatch or partner/client status messages returned from backend
    const isCustomMsg = errorMsg && (
      errorMsg.toLowerCase().includes("verification") || 
      errorMsg.toLowerCase().includes("partner") || 
      errorMsg.toLowerCase().includes("client") || 
      errorMsg.toLowerCase().includes("talent") || 
      errorMsg.toLowerCase().includes("portal") || 
      errorMsg.toLowerCase().includes("registered") || 
      errorMsg.toLowerCase().includes("sign-in") || 
      errorMsg.toLowerCase().includes("pending") || 
      errorMsg.toLowerCase().includes("rejected") || 
      errorMsg.toLowerCase().includes("approved") ||
      errorMsg.toLowerCase().includes("waiting")
    );
    if (!isCustomMsg && (!errorMsg || errorMsg.toLowerCase().includes("internal server error") || err?.response?.status === 401 || err?.response?.status === 403)) {
      errorMsg = "Invalid email or password";
    }
    throw new Error(errorMsg);
  }
}

export const loginApi = {
  loginUser,
  resolveImageUrl,
};

export default loginApi;
