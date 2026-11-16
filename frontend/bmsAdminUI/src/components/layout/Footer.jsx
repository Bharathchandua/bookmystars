import React from "react";

export default function Footer({ className = "" }) {
  return (
    <footer
      className={`bms-admin-footer ${className}`}
      style={{
        padding: "16px 24px",
        borderTop: "1px solid #334155",
        background: "#0f172a",
        color: "#64748b",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div>
        <span style={{ fontWeight: "700", color: "#94a3b8" }}>BookMyStars Admin Operations Console</span>
        <span style={{ margin: "0 8px" }}>&bull;</span>
        <span>Version 2.4.0 (Enterprise Micro-Module)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          RBAC Security Active
        </span>
        <span>&copy; {new Date().getFullYear()} BookMyStars Entertainment Pvt. Ltd.</span>
      </div>
    </footer>
  );
}
