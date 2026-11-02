/**
 * BookMyStars Admin Portal - Central Backend Configuration
 * Change BACKEND_ENV to 'local' or 'cloud' to switch the entire application backend.
 */
export const BACKEND_ENV = 'local'; // 'local' | 'cloud'

export const BACKENDS = {
  local: {
    admin: 'http://localhost:8081',
    users: 'http://localhost:8080',
  },
  cloud: {
    admin: 'https://kwinwsproducts.cloudjiffy.net/bmsadmin',
    users: 'https://kwinwsproducts.cloudjiffy.net/bmsuser',
  },
};

// Allows dynamic override via localStorage.setItem('bms_api_override', 'http://localhost:8081')
const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('bms_api_override') : null;

export const API_BASE_URL =
  savedOverride ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? BACKENDS.cloud.admin : BACKENDS[BACKEND_ENV].admin);

export default BACKENDS;
