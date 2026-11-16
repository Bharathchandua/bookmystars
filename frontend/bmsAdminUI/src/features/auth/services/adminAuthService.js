import axiosInstance from "../../../services/axiosInstance";

export const getStoredAdmin = () => {
  try {
    const raw = localStorage.getItem("bms_admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

export const getAdminToken = () => {
  return localStorage.getItem("bms_admin_token");
};

export const setStoredAdmin = (adminUser, token) => {
  if (token) localStorage.setItem("bms_admin_token", token);
  if (adminUser) localStorage.setItem("bms_admin_user", JSON.stringify(adminUser));
  window.dispatchEvent(new Event("bms_admin_auth_changed"));
};

export const logoutAdminUser = () => {
  localStorage.removeItem("bms_admin_token");
  localStorage.removeItem("bms_admin_user");
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
