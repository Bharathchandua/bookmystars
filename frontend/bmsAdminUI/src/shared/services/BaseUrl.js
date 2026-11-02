/**
 * Global Base URL Configuration
 * Driven by src/config/backendConfig.js (Switch between 'local' and 'cloud')
 */
import { BACKEND_ENV, BACKENDS } from "../../config/backendConfig";

export { BACKEND_ENV, BACKENDS };
export const BACKEND_SERVER_URL = BACKENDS[BACKEND_ENV]?.admin || "http://localhost:8081";
export const API_BASE_URL = BACKEND_ENV === "local" ? "/api" : `${BACKEND_SERVER_URL}/api`;
export default API_BASE_URL;
