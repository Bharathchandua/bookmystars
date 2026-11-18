/**
 * BookMyStars User/Talent Portal - Central API Configuration
 */
export const BACKEND_ENV = 'local'; // 'local' | 'cloud'

export const BACKENDS = {
  local: {
    users: 'http://localhost:8080',
    admin: 'http://localhost:8081',
    partner: 'http://localhost:8083',
    client: 'http://localhost:8084',
    clientUi: 'http://localhost:5174',
    partnerUi: 'http://localhost:5175',
    adminUi: 'http://localhost:5170',
  },
  cloud: {
    users: 'https://bookmystarsproduct.cloudjiffy.net/bmsuser',
    admin: 'https://bookmystarsproduct.cloudjiffy.net/bmsadmin',
    partner: 'https://bookmystarsproduct.cloudjiffy.net/bmspartner',
    client: 'https://bookmystarsproduct.cloudjiffy.net/bmsclient',
    clientUi: 'https://clientbms.netlify.app',
    partnerUi: 'https://partnerbms.netlify.app',
    adminUi: 'https://adminbms.netlify.app',
  },
};

const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('bms_api_override') : null;

export const BACKEND_SERVER_URL =
  import.meta.env.PROD
    ? BACKENDS.cloud.users
    : (BACKENDS[BACKEND_ENV]?.users || 'http://localhost:8080');

export const API_BASE_URL =
  savedOverride ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? `${BACKENDS.cloud.users}/api` : '/api');

export const CLIENT_PORTAL_URL =
  import.meta.env.VITE_CLIENT_UI_URL ||
  (import.meta.env.PROD ? BACKENDS.cloud.clientUi : BACKENDS[BACKEND_ENV].clientUi);

export const PARTNER_PORTAL_URL =
  import.meta.env.VITE_PARTNER_UI_URL ||
  (import.meta.env.PROD ? BACKENDS.cloud.partnerUi : BACKENDS[BACKEND_ENV].partnerUi);

export const ADMIN_PORTAL_URL =
  import.meta.env.VITE_ADMIN_UI_URL ||
  (import.meta.env.PROD ? BACKENDS.cloud.adminUi : BACKENDS[BACKEND_ENV].adminUi);

export const USER_PORTAL_URL = '';

export default API_BASE_URL;
