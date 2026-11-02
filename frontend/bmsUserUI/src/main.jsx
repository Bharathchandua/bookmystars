import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

import App from "./App.jsx";

/* ── Favicon: loaded from src/assets so Vite hashes it (no cache issues) ── */
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

/* ── Global Error Boundary: Prevents Blank Screens on Uncaught React Errors ── */
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("GlobalErrorBoundary captured React error:", error, errorInfo);
    this.setState({ errorInfo });
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
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          color: "#fff"
        }}>
          <div style={{
            maxWidth: "540px",
            width: "100%",
            background: "#1e293b",
            borderRadius: "24px",
            padding: "36px 32px",
            border: "1px solid #334155",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            textAlign: "center"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ec008c, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              margin: "0 auto 20px"
            }}>
              ⭐
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "900", margin: "0 0 8px", color: "#fff" }}>
              BookMyStars Workspace
            </h2>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6", margin: "0 0 24px" }}>
              The workspace encountered a temporary session or rendering error. You can reload this view or return to the main portal.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "12px 24px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #ec008c, #7c3aed)",
                  color: "#fff",
                  border: "none",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(236, 0, 140, 0.4)"
                }}
              >
                Reload Workspace
              </button>
              <button
                onClick={() => {
                  try {
                    sessionStorage.clear();
                    localStorage.removeItem("bms_token");
                    localStorage.removeItem("bms_user");
                  } catch (e) {}
                  window.location.href = "/";
                }}
                style={{
                  padding: "12px 20px",
                  borderRadius: "14px",
                  background: "#334155",
                  color: "#e2e8f0",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Reset & Return Home
              </button>
            </div>
            {this.state.error && (
              <details style={{ marginTop: "24px", textAlign: "left" }}>
                <summary style={{ fontSize: "11px", color: "#64748b", cursor: "pointer", outline: "none" }}>
                  Technical Details (Click to inspect)
                </summary>
                <pre style={{
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#090d16",
                  color: "#f43f5e",
                  fontSize: "11px",
                  lineHeight: "1.4",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap"
                }}>
                  {this.state.error?.toString()}
                  {"\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
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