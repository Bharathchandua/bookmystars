/**
 * BookMyStars Partner Portal - Central API Configuration
 */
export const BACKEND_ENV = 'local'; // 'local' | 'cloud'

export const BACKENDS = {
  local: {
    partner: 'http://localhost:8083',
    userUi: 'http://localhost:5173',
    clientUi: 'http://localhost:5174',
  },
  cloud: {
    partner: 'https://bookmystarsproduct.cloudjiffy.net/bmspartner',
    userUi: 'https://userbms.netlify.app',
    clientUi: 'https://clientbms.netlify.app',
  },
};

const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('bms_partner_api_override') : null;

export const BACKEND_SERVER_URL =
  import.meta.env.PROD
    ? BACKENDS.cloud.partner
    : (BACKENDS[BACKEND_ENV]?.partner || 'http://localhost:8083');

export const API_BASE_URL =
  savedOverride ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? `${BACKENDS.cloud.partner}/api` : '/api');

export const USER_PORTAL_URL =
  import.meta.env.VITE_USER_UI_URL ||
  (import.meta.env.PROD ? BACKENDS.cloud.userUi : BACKENDS[BACKEND_ENV].userUi);

export const CLIENT_PORTAL_URL =
  import.meta.env.VITE_CLIENT_UI_URL ||
  (import.meta.env.PROD ? BACKENDS.cloud.clientUi : BACKENDS[BACKEND_ENV].clientUi);

export const PARTNER_PORTAL_URL = '';

export default API_BASE_URL;
