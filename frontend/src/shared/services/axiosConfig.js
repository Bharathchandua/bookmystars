import axios from "axios";
import { API_BASE_URL } from "./BaseUrl";

/**
 * Pre-configured Axios instance with automatic JWT Authorization header injection
 * and centralized error interception.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle global errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized request: session may have expired.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
