import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

import App from "./app/App.jsx";
import faviconSrc from "./assets/favicon.png";

(function setFavicon() {
  ["icon", "apple-touch-icon"].forEach((rel, i) => {
    const link = document.createElement("link");
    link.rel = rel;
    link.type = "image/png";
    if (i === 0) link.sizes = "32x32";
    if (i === 1) link.sizes = "180x180";
    link.href = faviconSrc;
    document.head.appendChild(link);
  });
})();

// Universal Safe localStorage Protection & Bloat Sanitizer
// Universal Safe localStorage Protection & Bloat Sanitizer
(function installSafeStorage() {
  try {
    // 1. Purge any bloated keys (Base64 images, banners, deprecated profiles, or cached entries > 15KB)
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key === "bms_token" || key === "bms_admin_token") continue;
      if (key.startsWith("bms_partner_profile_") || key.startsWith("bms_client_profile_")) {
        console.warn("[SafeStorage] Purged deprecated profile cache key on startup:", key);
        localStorage.removeItem(key);
        continue;
      }
      const val = localStorage.getItem(key);
      if (val && (val.includes("data:image/") || val.startsWith("data:") || val.length > 15000)) {
        console.warn("[SafeStorage] Purged bloated key on startup:", key);
        localStorage.removeItem(key);
      }
    }

    // 2. Wrap window.localStorage.setItem so quota errors NEVER crash the app
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
    window.localStorage.setItem = function(key, value) {
      try {
        originalSetItem(key, value);
      } catch (err) {
        console.warn(`[SafeStorage] QuotaExceeded handled for key "${key}". Auto-pruning caches.`);
        try {
          for (let i = window.localStorage.length - 1; i >= 0; i--) {
            const k = window.localStorage.key(i);
            if (k && k !== "bms_token" && k !== "bms_admin_token" && k !== "bms_user" && k !== "bms_admin_user") {
              window.localStorage.removeItem(k);
            }
          }
          try {
            originalSetItem(key, value);
          } catch (_) {
            console.warn(`[SafeStorage] Silently skipped non-critical storage write for "${key}".`);
          }
        } catch (_) {}
      }
    };

    // 3. Wrap window.sessionStorage.setItem similarly
    const originalSessionSetItem = window.sessionStorage.setItem.bind(window.sessionStorage);
    window.sessionStorage.setItem = function(key, value) {
      try {
        originalSessionSetItem(key, value);
      } catch (err) {
        console.warn(`[SafeStorage] SessionStorage error handled for key "${key}".`);
      }
    };
  } catch (e) {
    console.warn("installSafeStorage note:", e);
  }
})();

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Partner Portal captured React error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#0f172a",
          fontFamily: "Inter, sans-serif",
          color: "#fff"
        }}>
          <div style={{
            maxWidth: "540px",
            width: "100%",
            background: "#1e293b",
            borderRadius: "24px",
            padding: "36px 32px",
            border: "1px solid #334155",
            textAlign: "center"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#fff", marginBottom: "12px" }}>
              Academy Partner Portal Notice
            </h2>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6", marginBottom: "14px" }}>
              An unexpected render error occurred:
            </p>
            {this.state.error && (
              <pre style={{
                textAlign: "left",
                background: "#0f172a",
                color: "#f87171",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "12px",
                overflowX: "auto",
                marginBottom: "20px",
                whiteSpace: "pre-wrap"
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  try {
                    for (let i = localStorage.length - 1; i >= 0; i--) {
                      const k = localStorage.key(i);
                      if (k && k !== "bms_token" && k !== "bms_admin_token" && k !== "bms_user" && k !== "bms_admin_user") {
                        localStorage.removeItem(k);
                      }
                    }
                  } catch (_) {}
                  window.location.reload();
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #7c3aed, #ec008c)",
                  color: "#fff",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Reload
              </button>
              <button
                onClick={() => { window.location.href = "/signin"; }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  background: "#334155",
                  color: "#e2e8f0",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <GlobalErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GlobalErrorBoundary>
);
