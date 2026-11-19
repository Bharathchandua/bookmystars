import { BACKEND_SERVER_URL } from "../services/BaseUrl";

/**
 * Common formatting and URL helpers
 */
export function getFullImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    if (import.meta.env.PROD && url.includes("localhost")) {
      return url.replace(/https?:\/\/localhost(:\d+)?/, "https://bookmystarsproduct.cloudjiffy.net/bmsuser");
    }
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  if (import.meta.env.PROD) {
    return `https://bookmystarsproduct.cloudjiffy.net/bmsuser${cleanPath}`;
  }
  return cleanPath;
}

export function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
