/**
 * BookMyStars Client Portal - Global Base URL Configuration
 */
export const BACKEND_ENV = 'local'; // 'local' | 'cloud'

export const BACKENDS = {
  local: {
    client: 'http://localhost:8084',
    users: 'http://localhost:8080',
    userUi: 'http://localhost:5173',
  },
  cloud: {
    client: 'https://bookmystarsproduct.cloudjiffy.net/bmsclient',
    users: 'https://bookmystarsproduct.cloudjiffy.net/bmsuser',
    userUi: 'https://userbms.netlify.app',
  },
};

export const BACKEND_SERVER_URL =
  import.meta.env.PROD
    ? BACKENDS.cloud.client
    : (BACKENDS[BACKEND_ENV]?.client || 'http://localhost:8084');

export const USER_BACKEND_URL =
  import.meta.env.PROD
    ? BACKENDS.cloud.users
    : (BACKENDS[BACKEND_ENV]?.users || 'http://localhost:8080');

export const API_BASE_URL =
  typeof window !== 'undefined' && localStorage.getItem('bms_client_api_override')
    ? `${localStorage.getItem('bms_client_api_override')}/api`
    : '/api';

export default API_BASE_URL;
