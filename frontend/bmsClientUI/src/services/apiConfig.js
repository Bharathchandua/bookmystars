/**
 * BookMyStars Client Portal - Central API Configuration
 */
export const BACKEND_ENV = 'local'; // 'local' | 'cloud'

export const BACKENDS = {
  local: {
    client: 'http://localhost:8084',
    userUi: 'http://localhost:5173',
    partnerUi: 'http://localhost:5175',
  },
  cloud: {
    client: 'https://kwinwsproducts.cloudjiffy.net/bmsclient',
    userUi: 'https://bmsuserui.netlify.app',
    partnerUi: 'https://bmspartnerui.netlify.app',
  },
};

const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('bms_client_api_override') : null;

export const BACKEND_SERVER_URL =
  import.meta.env.PROD
    ? BACKENDS.cloud.client
    : (BACKENDS[BACKEND_ENV]?.client || 'http://localhost:8084');

export const API_BASE_URL =
  savedOverride ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? `${BACKENDS.cloud.client}/api` : '/api');

export const USER_PORTAL_URL =
  import.meta.env.VITE_USER_UI_URL ||
  (import.meta.env.PROD ? BACKENDS.cloud.userUi : BACKENDS[BACKEND_ENV].userUi);

export const PARTNER_PORTAL_URL =
  import.meta.env.VITE_PARTNER_UI_URL ||
  (import.meta.env.PROD ? BACKENDS.cloud.partnerUi : BACKENDS[BACKEND_ENV].partnerUi);

export const CLIENT_PORTAL_URL = '';

export default API_BASE_URL;
