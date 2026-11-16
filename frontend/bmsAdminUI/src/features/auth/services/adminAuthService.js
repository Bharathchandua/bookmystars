import axiosInstance from "../../../services/axiosInstance";

export const getStoredAdmin = () => {
  try {
    const raw =
      sessionStorage.getItem("bms_admin_user") ||
      localStorage.getItem("bms_admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

export const getAdminToken = () => {
  return (
    sessionStorage.getItem("bms_admin_token") ||
    sessionStorage.getItem("bms_token") ||
    localStorage.getItem("bms_admin_token") ||
    localStorage.getItem("bms_token")
  );
};

export const setStoredAdmin = (adminUser, token) => {
  if (token) {
    sessionStorage.setItem("bms_admin_token", token);
    sessionStorage.setItem("bms_token", token);
    localStorage.setItem("bms_admin_token", token);
    localStorage.setItem("bms_token", token);
  }
  if (adminUser) {
    sessionStorage.setItem("bms_admin_user", JSON.stringify(adminUser));
    sessionStorage.setItem("bms_admin_logged_in", "true");
    localStorage.setItem("bms_admin_user", JSON.stringify(adminUser));
    localStorage.setItem("bms_admin_logged_in", "true");
  }
  window.dispatchEvent(new Event("bms_admin_auth_changed"));
};

export const logoutAdminUser = () => {
  sessionStorage.removeItem("bms_admin_token");
  sessionStorage.removeItem("bms_token");
  sessionStorage.removeItem("bms_admin_user");
  sessionStorage.removeItem("bms_admin_logged_in");
  localStorage.removeItem("bms_admin_token");
  localStorage.removeItem("bms_token");
  localStorage.removeItem("bms_admin_user");
  localStorage.removeItem("bms_admin_logged_in");
  window.dispatchEvent(new Event("bms_admin_auth_changed"));
};

export const loginAdmin = async (email, password) => {
  const response = await axiosInstance.post("/api/admin/auth/login", { email, password });
  const data = response.data;
  if (data?.token) {
    setStoredAdmin(data.admin || data.user || data, data.token);
  }
  return data;
};

export default {
  getStoredAdmin,
  getAdminToken,
  setStoredAdmin,
  logoutAdminUser,
  loginAdmin,
};
