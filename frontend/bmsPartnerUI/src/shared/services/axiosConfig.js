import axios from "axios";
import { API_BASE_URL } from "./BaseUrl";
import { logger } from "../utils/logger";

/**
 * Pre-configured Axios instance with automatic JWT Authorization header injection,
 * request/response telemetry, and centralized error logging.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token and record start time
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };

    const token =
      sessionStorage.getItem("bms_admin_token") ||
      sessionStorage.getItem("bms_token") ||
      localStorage.getItem("bms_token");
    if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    const method = config.method?.toUpperCase() || "GET";
    logger.debug(`[HTTP REQ] ${method} ${config.url}`);

    return config;
  },
  (error) => {
    logger.error("[HTTP REQ ERR]", error);
    return Promise.reject(error);
  }
);

// Response interceptor: log latency and handle errors
apiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config?.metadata?.startTime || Date.now());
    const method = response.config?.method?.toUpperCase() || "GET";
    logger.debug(`[HTTP RES] ${response.status} ${method} ${response.config?.url} (${duration}ms)`);
    return response;
  },
  (error) => {
    const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
    const method = error.config?.method?.toUpperCase() || "HTTP";
    const status = error.response?.status || "NET_ERR";

    if (error.response && error.response.status === 401) {
      logger.warn(`[HTTP AUTH] Session expired or unauthorized (${status}) on ${method} ${error.config?.url}`);
    } else {
      logger.error(`[HTTP ERR] ${status} ${method} ${error.config?.url} (${duration}ms):`, error.response?.data?.message || error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
