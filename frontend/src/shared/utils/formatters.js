import { BACKEND_SERVER_URL } from "../services/BaseUrl";

/**
 * Common formatting and URL helpers
 */
export function getFullImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `${BACKEND_SERVER_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
