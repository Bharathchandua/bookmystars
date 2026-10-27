import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Film,
  Users,
  ShieldCheck,
  CreditCard,
  Lock,
  Shield,
  BarChart3,
  Settings,
  ChevronRight,
  Headphones,
  Tag
} from "lucide-react";
import { getStoredAdmin } from "../../features/bms/api/admin/adminApi";

export default function AdminSidebar({ 
  isOpen = true, 
  onToggle, 
  activeDesk = "overview",
  onSelectDesk
}) {
  const [adminUser, setAdminUser] = useState(() => getStoredAdmin());

  useEffect(() => {
    const handleAuthChange = () => setAdminUser(getStoredAdmin());
    window.addEventListener("bms_admin_auth_changed", handleAuthChange);
    return () => window.removeEventListener("bms_admin_auth_changed", handleAuthChange);
  }, []);

  const adminMenuItems = [
    { id: "overview",       label: "Dashboard",             icon: LayoutDashboard, hasSub: false, moduleKey: "dashboard" },
    { id: "skills",         label: "Master",                icon: Tag,             hasSub: false, moduleKey: "skills" },
    { id: "castings",       label: "Casting",               icon: Film,            hasSub: true,  moduleKey: "castings" },
    { id: "talents",        label: "Talent Management",     icon: Users,           hasSub: true,  moduleKey: "talents" },
    { id: "kyc",            label: "KYC & Verification",    icon: ShieldCheck,     hasSub: false, moduleKey: "kyc" },
    { id: "escrow",         label: "Escrow & Payments",     icon: CreditCard,      hasSub: true,  moduleKey: "escrow" },
    { id: "roles",          label: "RBAC & Permissions",    icon: Lock,            hasSub: false, moduleKey: "rbac" },
    { id: "security",       label: "Security & Audit",      icon: Shield,          hasSub: false, moduleKey: "security" },
    { id: "reports",        label: "Reports & Analytics",   icon: BarChart3,       hasSub: true,  moduleKey: "auditing" },
    { id: "settings",       label: "System Settings",       icon: Settings,        hasSub: false, moduleKey: "settings" },
  ];

  const isSuperAdmin = adminUser?.roleId === "ROLE_SUPER_ADMIN" || adminUser?.role === "SUPER_ADMIN";
  const userPerms = adminUser?.permissions || {};

  // Filter menu items dynamically based on the permissions granted by Super Admin
  const visibleMenuItems = adminMenuItems.filter(item => {
    if (item.id === "overview") return true;
    if (isSuperAdmin) return true;
    if (item.id === "skills") {
      return userPerms?.skills ? userPerms.skills.view === true : true;
    }
    const p = userPerms[item.moduleKey];
    if (p && typeof p === "object") {
      return p.view === true;
    }
    return false;
  });

  const sidebarWidth = isOpen ? "250px" : "76px";

  return (
    <aside 
      style={{
        position: "fixed",
        top: "64px",
        left: 0,
        bottom: 0,
        width: sidebarWidth,
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "16px 10px",
        zIndex: 40,
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowY: "auto",
        boxSizing: "border-box"
      }}
    >
      {/* Navigation Menu Items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeDesk === item.id || (item.id === "overview" && activeDesk === "castings" && false);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (onSelectDesk) onSelectDesk(item.id);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: isOpen ? "space-between" : "center",
                padding: isOpen ? "10px 14px" : "10px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                border: "none",
                position: "relative",
                backgroundColor: isActive ? "#fff1f8" : "transparent",
                color: isActive ? "#ee008f" : "#475569",
                transition: "all 0.15s ease",
                textAlign: "left"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.color = "#0f172a";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#475569";
                }
              }}
              title={item.label}
            >
              {/* Pink vertical indicator line on active item */}
              {isActive && (
                <span 
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "8px",
                    bottom: "8px",
                    width: "3.5px",
                    backgroundColor: "#ee008f",
                    borderTopRightRadius: "4px",
                    borderBottomRightRadius: "4px"
                  }} 
                />
              )}

              {/* Icon & Label */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                <Icon
                  size={19}
                  style={{
                    flexShrink: 0,
                    color: isActive ? "#ee008f" : "#64748b"
                  }}
                />
                {isOpen && (
                  <span style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                    {item.label}
                  </span>
                )}
              </div>

              {/* Submenu Chevron Right */}
              {item.hasSub && isOpen && (
                <ChevronRight size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom "Need Help?" Card matching reference screenshot */}
      {isOpen && (
        <div 
          style={{
            margin: "12px 4px 4px 4px",
            padding: "16px 12px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <div 
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "#fff1f8",
              color: "#ee008f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 4px rgba(238, 0, 143, 0.08)"
            }}
          >
            <Headphones size={18} />
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>
              Need Help?
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: "#64748b", marginTop: "1px" }}>
              Contact support team
            </div>
          </div>

          <button
            type="button"
            style={{
              width: "100%",
              padding: "6px 12px",
              borderRadius: "10px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontSize: "11.5px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
          >
            Get Support
          </button>
        </div>
      )}
    </aside>
  );
}
