import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to attach JWT admin token
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("bms_admin_token") ||
      sessionStorage.getItem("bms_token") ||
      localStorage.getItem("bms_admin_token") ||
      localStorage.getItem("bms_token");
    if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error and 401 handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only clear admin token if the unauthorized request was strictly an admin operational endpoint
      const reqUrl = error.config?.url || "";
      if (reqUrl.includes("/admin/")) {
        sessionStorage.removeItem("bms_admin_token");
        sessionStorage.removeItem("bms_token");
        sessionStorage.removeItem("bms_admin_user");
        sessionStorage.removeItem("bms_admin_logged_in");
        localStorage.removeItem("bms_admin_token");
        localStorage.removeItem("bms_token");
        localStorage.removeItem("bms_admin_user");
        localStorage.removeItem("bms_admin_logged_in");
        window.dispatchEvent(new Event("bms_admin_auth_changed"));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
