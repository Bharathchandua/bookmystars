/**
 * Centralized API error extraction helper
 */
export function extractError(error, defaultMsg = "Operation failed") {
  const data = error?.response?.data;
  let msg = null;

  if (typeof data === "string") {
    if (data.trim().startsWith("<") || data.includes("<!DOCTYPE") || data.includes("<html")) {
      if (data.includes("ERR_NGROK") || data.includes("ngrok")) {
        msg = "Backend server / ngrok tunnel is offline. Please make sure the backend server (port 8080) and ngrok tunnel are running.";
      } else {
        msg = `Backend server is unreachable (Status ${error?.response?.status || "502/503"}). Please ensure the backend server is running.`;
      }
    } else {
      msg = data;
    }
  } else if (data && typeof data === "object") {
    msg = data.message || data.error || (data.errors ? Object.values(data.errors).join("; ") : null);
  }

  if (!msg) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      msg = "Invalid email or password or unauthorized access.";
    } else if (error?.response?.status === 502 || error?.response?.status === 503 || error?.code === "ERR_NETWORK") {
      msg = "Backend server is currently offline or unreachable. Please start the server.";
    } else {
      msg = error?.message || defaultMsg;
    }
  }
  return msg;
}
