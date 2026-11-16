import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Super Admin Authentication & Session Management API
 */

// Dummy Super Admin credentials for internal testing
export const DUMMY_SUPER_ADMIN = {
  email: "admin@bookmystars.com",
  password: "Admin@123",
  user: {
    userId: "admin-master-001",
    name: "Bharath",
    email: "admin@bookmystars.com",
    avatar: null,
    role: "SUPER_ADMIN",
    accountType: "ADMIN",
    roles: ["SUPER_ADMIN"],
    permissions: ["VIEW", "CREATE", "EDIT"]
  }
};

export const getStoredAdmin = () => {
  const isLogged = 
    sessionStorage.getItem("bms_admin_logged_in") === "true" || 
    localStorage.getItem("bms_admin_logged_in") === "true";
  if (!isLogged) return null;
  const userStr = 
    sessionStorage.getItem("bms_admin_user") || 
    localStorage.getItem("bms_admin_user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return DUMMY_SUPER_ADMIN.user;
    }
  }
  return DUMMY_SUPER_ADMIN.user;
};

export const loginAdminUser = async (email, password) => {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPass = (password || "").trim();

  try {
    const res = await apiClient.post("/admin/auth/login", {
      email: cleanEmail,
      password: cleanPass
    });

    if (res.data && res.data.token) {
      const { token, user } = res.data;
      sessionStorage.setItem("bms_admin_logged_in", "true");
      sessionStorage.setItem("bms_admin_user", JSON.stringify(user));
      sessionStorage.setItem("bms_token", token);
      localStorage.removeItem("bms_admin_logged_in");
      localStorage.removeItem("bms_admin_user");
      localStorage.removeItem("bms_token");
      window.dispatchEvent(new Event("bms_admin_auth_changed"));
      return { success: true, user };
    }
    throw new Error("Invalid response from authorization server.");
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Invalid administrator credentials.";
    throw new Error(msg);
  }
};

export const logoutAdminUser = () => {
  sessionStorage.removeItem("bms_admin_logged_in");
  sessionStorage.removeItem("bms_admin_user");
  sessionStorage.removeItem("bms_token");
  localStorage.removeItem("bms_admin_logged_in");
  localStorage.removeItem("bms_admin_user");
  localStorage.removeItem("bms_token");
  window.dispatchEvent(new Event("bms_admin_auth_changed"));
};

/**
 * Fetch and sync current authenticated admin profile and live permissions from DB
 */
export const fetchCurrentAdmin = async () => {
  try {
    const res = await apiClient.get("/admin/auth/me");
    if (res.data) {
      localStorage.setItem("bms_admin_user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("bms_admin_auth_changed"));
      return res.data;
    }
  } catch (err) {
    // Graceful fallback
  }
  return null;
};
