/**
 * Global Base URL Configuration
 * Driven by src/config/backendConfig.js (Switch between 'local' and 'cloud')
 */
import { BACKEND_ENV, BACKENDS } from "../../config/backendConfig";

export { BACKEND_ENV, BACKENDS };

export const BACKEND_SERVER_URL =
  import.meta.env.PROD
    ? BACKENDS.cloud.admin
    : (BACKENDS[BACKEND_ENV]?.admin || "http://localhost:8081");

export const API_BASE_URL =
  typeof window !== "undefined" && localStorage.getItem("bms_api_override")
    ? `${localStorage.getItem("bms_api_override")}/api`
    : "/api";

export default API_BASE_URL;
