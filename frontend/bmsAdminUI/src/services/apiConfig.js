/**
 * BookMyStars Admin Portal - Central Environment-Aware API Configuration
 */

export const BACKEND_ENV = 'local'; // 'local' | 'cloud'

export const BACKENDS = {
  local: {
    admin: 'http://localhost:8081',
    users: 'http://localhost:8080',
    partner: 'http://localhost:8083',
    client: 'http://localhost:8084',
  },
  cloud: {
    admin: 'https://bookmystarsproduct.cloudjiffy.net/bmsadmin',
    users: 'https://bookmystarsproduct.cloudjiffy.net/bmsuser',
    partner: 'https://bookmystarsproduct.cloudjiffy.net/bmspartner',
    client: 'https://bookmystarsproduct.cloudjiffy.net/bmsclient',
  },
};

const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('bms_api_override') : null;

export const API_BASE_URL =
  savedOverride ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? BACKENDS.cloud.admin : BACKENDS[BACKEND_ENV].admin);

export default {
  API_BASE_URL,
  BACKENDS,
  BACKEND_ENV,
};
