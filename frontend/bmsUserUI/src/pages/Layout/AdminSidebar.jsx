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
  Tag,
  Sliders,
  Megaphone,
  Building2,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Award,
  DollarSign,
  X
} from "lucide-react";
import { getStoredAdmin } from "../../features/bms/api/admin/adminApi";

export default function AdminSidebar({ 
  isOpen = true, 
  isPinned = false,
  onToggle, 
  onMouseEnter,
  onMouseLeave,
  activeDesk = "overview",
  onSelectDesk,
  activeWorkspace: propWorkspace
}) {
  const [adminUser, setAdminUser] = useState(() => getStoredAdmin());
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    return propWorkspace || localStorage.getItem("bms_admin_active_workspace") || "hq";
  });

  useEffect(() => {
    const handleAuthChange = () => setAdminUser(getStoredAdmin());
    window.addEventListener("bms_admin_auth_changed", handleAuthChange);
    return () => window.removeEventListener("bms_admin_auth_changed", handleAuthChange);
  }, []);

  useEffect(() => {
    if (propWorkspace) {
      setActiveWorkspace(propWorkspace);
    }
  }, [propWorkspace]);

  useEffect(() => {
    const handleWorkspaceSync = (e) => {
      const nextWs = e.detail || localStorage.getItem("bms_admin_active_workspace") || "hq";
      setActiveWorkspace(nextWs);
    };
    window.addEventListener("bms_admin_workspace_changed", handleWorkspaceSync);
    return () => window.removeEventListener("bms_admin_workspace_changed", handleWorkspaceSync);
  }, []);

  // 1. TALENT / MASTER SUPER ADMIN MENU ITEMS
  const talentMenuItems = [
    { id: "overview",       label: "Dashboard",             icon: LayoutDashboard, hasSub: false, moduleKey: "dashboard" },
    { id: "skills",         label: "Master Catalog",        icon: Tag,             hasSub: false, moduleKey: "skills" },
    { id: "castings",       label: "Casting Screening",     icon: Film,            hasSub: true,  moduleKey: "castings" },
    { id: "talents",        label: "Talent Management",     icon: Users,           hasSub: true,  moduleKey: "talents" },
    { id: "kyc",            label: "KYC & Verification",    icon: ShieldCheck,     hasSub: false, moduleKey: "kyc" },
    { id: "escrow",         label: "Escrow & Payments",     icon: CreditCard,      hasSub: true,  moduleKey: "escrow" },
    { id: "roles",          label: "RBAC & Permissions",    icon: Lock,            hasSub: false, moduleKey: "rbac" },
    { id: "security",       label: "Security & Audit",      icon: Shield,          hasSub: false, moduleKey: "security" },
    { id: "reports",        label: "Reports & Analytics",   icon: BarChart3,       hasSub: true,  moduleKey: "auditing" },
    { id: "settings",       label: "System Settings",       icon: Settings,        hasSub: false, moduleKey: "settings" },
  ];

  // 2. CLIENT SUPER ADMIN MENU ITEMS
  const clientMenuItems = [
    { id: "client_overview",      label: "Client Overview",       icon: LayoutDashboard, hasSub: false },
    { id: "client_verifications", label: "Registration & KYC",    icon: ShieldCheck,     hasSub: false },
    { id: "client_form_builder",  label: "Requirement Fields",    icon: Sliders,         hasSub: false },
    { id: "client_campaigns",     label: "Live Shoot Briefs",     icon: Megaphone,       hasSub: false },
    { id: "client_escrow",        label: "Commercial Escrow",     icon: CreditCard,      hasSub: false },
    { id: "client_brands",        label: "Corporate Directory",   icon: Building2,       hasSub: false },
    { id: "client_settings",      label: "Client SLA & Rules",    icon: Settings,        hasSub: false },
  ];

  // 3. PARTNER SUPER ADMIN MENU ITEMS
  const partnerMenuItems = [
    { id: "partner_overview",      label: "Partner Overview",      icon: LayoutDashboard, hasSub: false },
    { id: "partner_verifications", label: "Academy Accreditation", icon: ShieldCheck,     hasSub: false },
    { id: "partner_form_builder",  label: "Audition Form Fields",  icon: Sliders,         hasSub: false },
    { id: "partner_auditions",     label: "Live Audition Batches", icon: Megaphone,       hasSub: false },
    { id: "partner_analytics",     label: "Student Flow Stats",    icon: BarChart3,       hasSub: false },
    { id: "partner_roster",        label: "Accredited Roster",     icon: GraduationCap,   hasSub: false },
    { id: "partner_settings",      label: "Academy Guidelines",    icon: Settings,        hasSub: false },
  ];

  const isSuperAdmin = adminUser?.roleId === "ROLE_SUPER_ADMIN" || adminUser?.role === "SUPER_ADMIN";
  const userPerms = adminUser?.permissions || {};

  // Select appropriate menu based on active workspace
  let activeMenuItems = talentMenuItems;
  let workspaceThemeColor = "#ee008f";
  let workspaceBgActive = "#fff1f8";
  let workspaceBadge = {
    icon: "⭐",
    title: "SUPER ADMIN HQ",
    sub: "Talent & Castings",
    badgeBg: "bg-pink-50 border-pink-200 text-pink-700"
  };

  if (activeWorkspace === "client") {
    activeMenuItems = clientMenuItems;
    workspaceThemeColor = "#ec008c";
    workspaceBgActive = "#fdf2f8";
    workspaceBadge = {
      icon: "👑",
      title: "CLIENT SUPER ADMIN",
      sub: "Brands & Commercials",
      badgeBg: "bg-pink-50 border-pink-200 text-pink-800"
    };
  } else if (activeWorkspace === "partner") {
    activeMenuItems = partnerMenuItems;
    workspaceThemeColor = "#7c3aed";
    workspaceBgActive = "#f3e8ff";
    workspaceBadge = {
      icon: "🎭",
      title: "PARTNER SUPER ADMIN",
      sub: "Academies & Studios",
      badgeBg: "bg-purple-50 border-purple-200 text-purple-800"
    };
  }

  // Filter talent items dynamically based on RBAC permissions for non-super admins
  const visibleMenuItems = activeMenuItems.filter(item => {
    if (activeWorkspace === "client" || activeWorkspace === "partner") return true;
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
      className={`admin-sidebar-aside ${isOpen ? "mobile-open" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowY: "auto",
        boxSizing: "border-box"
      }}
    >
      <div>
        {/* Workspace Brand Badge inside Sidebar Header */}
        {isOpen ? (
          <div 
            style={{
              padding: "10px 12px",
              marginBottom: "12px",
              borderRadius: "14px",
              backgroundColor: activeWorkspace === "partner" ? "#faf5ff" : activeWorkspace === "client" ? "#fdf2f8" : "#fff1f8",
              border: `1px solid ${activeWorkspace === "partner" ? "#e9d5ff" : activeWorkspace === "client" ? "#fbcfe8" : "#fce7f3"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div 
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: activeWorkspace === "partner" 
                    ? "linear-gradient(135deg, #7c3aed, #4f46e5)" 
                    : activeWorkspace === "client" 
                    ? "linear-gradient(135deg, #ec008c, #db2777)" 
                    : "linear-gradient(135deg, #ee008f, #7c3aed)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0
                }}
              >
                {workspaceBadge.icon}
              </div>
              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <div 
                  style={{
                    fontSize: "11px",
                    fontWeight: "900",
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                    color: workspaceThemeColor,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden"
                  }}
                >
                  {workspaceBadge.title}
                </div>
                <div 
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    color: "#64748b",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden"
                  }}
                >
                  {workspaceBadge.sub}
                </div>
              </div>
            </div>

            {/* Mobile close button (< lg) */}
            <button
              type="button"
              onClick={onToggle}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer border-0 bg-transparent"
              aria-label="Close navigation menu"
            >
              <X size={17} />
            </button>
          </div>
        ) : (
          <div 
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              margin: "0 auto 12px auto",
              background: activeWorkspace === "partner" 
                ? "linear-gradient(135deg, #7c3aed, #4f46e5)" 
                : activeWorkspace === "client" 
                ? "linear-gradient(135deg, #ec008c, #db2777)" 
                : "linear-gradient(135deg, #ee008f, #7c3aed)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px"
            }}
            title={workspaceBadge.title}
          >
            {workspaceBadge.icon}
          </div>
        )}

        {/* Navigation Menu Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeDesk === item.id;

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
                  backgroundColor: isActive ? workspaceBgActive : "transparent",
                  color: isActive ? workspaceThemeColor : "#475569",
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
                {/* Active vertical indicator line on left */}
                {isActive && (
                  <span 
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "8px",
                      bottom: "8px",
                      width: "3.5px",
                      backgroundColor: workspaceThemeColor,
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
                      color: isActive ? workspaceThemeColor : "#64748b"
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
      </div>

      {/* Bottom "Need Help?" Card */}
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
              backgroundColor: workspaceBgActive,
              color: workspaceThemeColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 0 4px ${activeWorkspace === "partner" ? "rgba(124, 58, 237, 0.08)" : "rgba(238, 0, 143, 0.08)"}`
            }}
          >
            <Headphones size={18} />
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>
              {activeWorkspace === "partner" ? "Partner Desk Support" : activeWorkspace === "client" ? "Commercial Ops Support" : "Super Admin Support"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: "#64748b", marginTop: "1px" }}>
              {activeWorkspace === "partner" ? "Academy verification help" : activeWorkspace === "client" ? "Brand onboarding help" : "Contact engineering team"}
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
            Open Dispatch
          </button>
        </div>
      )}
    </aside>
  );
}
