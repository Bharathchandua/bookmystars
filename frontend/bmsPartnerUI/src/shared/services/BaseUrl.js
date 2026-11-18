/**
 * BookMyStars Partner Portal - Global Base URL Configuration
 */
export const BACKEND_ENV = 'local'; // 'local' | 'cloud'

export const BACKENDS = {
  local: {
    partner: 'http://localhost:8083',
    userUi: 'http://localhost:5173',
  },
  cloud: {
    partner: 'https://bookmystarsproduct.cloudjiffy.net/bmspartner',
    userUi: 'https://bmsuserfront.netlify.app',
  },
};

export const BACKEND_SERVER_URL =
  import.meta.env.PROD
    ? BACKENDS.cloud.partner
    : (BACKENDS[BACKEND_ENV]?.partner || 'http://localhost:8083');

export const API_BASE_URL =
  typeof window !== 'undefined' && localStorage.getItem('bms_partner_api_override')
    ? `${localStorage.getItem('bms_partner_api_override')}/api`
    : '/api';

export default API_BASE_URL;
