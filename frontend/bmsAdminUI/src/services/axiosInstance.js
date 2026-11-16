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
    const token = localStorage.getItem("bms_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error and 401 handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token if invalid session
      if (error.response.status === 401) {
        localStorage.removeItem("bms_admin_token");
        localStorage.removeItem("bms_admin_user");
        window.dispatchEvent(new Event("bms_admin_auth_changed"));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
