import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Calendar, 
  Crown 
} from "lucide-react";
import { getStoredAdmin } from "../../../features/bms/api/admin/adminApi";

export default function AdminExecutiveBanner({ 
  onOpenRbac, 
  onRefresh, 
  refreshing = false 
}) {
  const [adminUser, setAdminUser] = useState(() => getStoredAdmin());

  useEffect(() => {
    const handleAuthChange = () => setAdminUser(getStoredAdmin());
    window.addEventListener("bms_admin_auth_changed", handleAuthChange);
    return () => window.removeEventListener("bms_admin_auth_changed", handleAuthChange);
  }, []);

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const formattedLastLogin = (() => {
    if (adminUser?.lastLogin) {
      try {
        const dt = new Date(adminUser.lastLogin);
        if (!isNaN(dt.getTime())) {
          return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
      } catch {}
    }
    const sessionTime = localStorage.getItem("bms_admin_login_time");
    if (sessionTime) return sessionTime;
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  })();
  return (
    <div 
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        background: "linear-gradient(135deg, #150729 0%, #240843 50%, #3b0764 100%)",
        color: "#ffffff",
        padding: "28px 32px",
        boxShadow: "0 10px 25px -5px rgba(21, 7, 41, 0.3)",
        border: "1px solid rgba(124, 58, 237, 0.3)",
        boxSizing: "border-box"
      }}
    >
      {/* Background ambient lighting */}
      <div 
        style={{
          position: "absolute",
          top: "-50px",
          right: "20%",
          width: "350px",
          height: "350px",
          backgroundColor: "rgba(238, 0, 143, 0.12)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none"
        }} 
      />
      <div 
        style={{
          position: "absolute",
          bottom: "-60px",
          right: 0,
          width: "300px",
          height: "300px",
          backgroundColor: "rgba(124, 58, 237, 0.2)",
          borderRadius: "50%",
          filter: "blur(50px)",
          pointerEvents: "none"
        }} 
      />

      <div 
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "24px"
        }}
      >
        {/* Left Column: Badges, Title, Subtitle */}
        <div style={{ maxWidth: "750px", display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {/* Top Badges */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <span 
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: "800",
                backgroundColor: "rgba(238, 0, 143, 0.2)",
                border: "1px solid rgba(238, 0, 143, 0.45)",
                color: "#ff4bb8",
                letterSpacing: "0.5px"
              }}
            >
              <Zap size={12} style={{ color: "#ff4bb8" }} />
              EXECUTIVE COMMAND HUB
            </span>

            <span 
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: "700",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                color: "#34d399"
              }}
            >
              <span 
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#34d399",
                  boxShadow: "0 0 6px #34d399"
                }} 
              />
              Cluster Active &bull; 99.98% SLA
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 
              style={{
                fontSize: "32px",
                fontWeight: "900",
                color: "#ffffff",
                letterSpacing: "-0.5px",
                margin: 0,
                lineHeight: 1.2
              }}
            >
              Welcome, <span style={{ color: "#ff2d95" }}>{adminUser?.name || "Bharath"}</span>
            </h1>
            <p 
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "#cbd5e1",
                marginTop: "6px",
                marginBottom: 0,
                lineHeight: "1.5",
                maxWidth: "680px"
              }}
            >
              {adminUser?.roleName || "Super Admin Console"} &bull; Central authority for casting reviews, talent KYC verification, escrow disbursements, and RBAC governance.
            </p>
          </div>

        </div>

        {/* Right Column: Date Card & 3D Glowing Crown Graphic */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
          
          {/* Date Card */}
          <div 
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              padding: "10px 16px",
              textAlign: "left",
              backdropFilter: "blur(8px)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#f1f5f9" }}>
              <Calendar size={14} style={{ color: "#ff4bb8" }} />
              <span>{currentDateStr}</span>
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: "#94a3b8", paddingLeft: "22px", marginTop: "2px" }}>
              Last login: {formattedLastLogin}
            </div>
          </div>

          {/* 3D Glowing Crown Graphic */}
          <div 
            style={{
              position: "relative",
              width: "76px",
              height: "76px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #3b0764 0%, #581c87 50%, #7c3aed 100%)",
              border: "1px solid rgba(244, 114, 182, 0.35)",
              boxShadow: "0 10px 25px rgba(238, 0, 143, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <div 
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)"
              }}
            >
              <Crown size={24} style={{ color: "#451a03", strokeWidth: 2.2 }} />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
