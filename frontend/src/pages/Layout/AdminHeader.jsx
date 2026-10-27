import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  ChevronRight,
  LogOut, 
  Shield,
  Camera,
  Upload,
  X,
  Trash2,
  Check
} from "lucide-react";
import apiClient from "../../shared/services/axiosConfig";
import { showSuccess, showError } from "../../shared/utils/alert";
import { getStoredAdmin, logoutAdminUser } from "../../features/bms/api/admin/adminApi";
import { getPendingPartnersCount, getAdminPartners } from "../../features/bms/api/partners/partnerApi";
import { getPendingClientsCount, getAdminClients } from "../../features/bms/api/clients/clientApi";
import switchPortalGif from "../../assets/switch-portal.gif";

// Tree hierarchy branch icon for middle items (├──)
const TreeBranchIcon = () => (
  <svg width="22" height="28" viewBox="0 0 22 28" fill="none" style={{ flexShrink: 0 }}>
    <path 
      d="M 6,3 L 6,25 M 6,14 L 20,14" 
      stroke="#0f172a" 
      strokeWidth="2.4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

// Tree hierarchy branch icon for last item (└──)
const TreeLastIcon = () => (
  <svg width="22" height="28" viewBox="0 0 22 28" fill="none" style={{ flexShrink: 0 }}>
    <path 
      d="M 6,3 L 6,14 L 20,14" 
      stroke="#0f172a" 
      strokeWidth="2.4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

export default function AdminHeader({ 
  toggleSidebar, 
  sidebarOpen,
  pageTitle = "Command Center",
  subTitle = "Super Admin Hub"
}) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingPartnersCount, setPendingPartnersCount] = useState(0);
  const [pendingPartnersList, setPendingPartnersList] = useState([]);
  const [pendingClientsCount, setPendingClientsCount] = useState(0);
  const [pendingClientsList, setPendingClientsList] = useState([]);
  const [notificationTab, setNotificationTab] = useState("ALL"); // ALL | CLIENTS | PARTNERS
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [adminUser, setAdminUser] = useState(() => getStoredAdmin());
  const [activeWorkspace, setActiveWorkspace] = useState(() => localStorage.getItem("bms_admin_active_workspace") || "hq");
  const profileMenuRef = useRef(null);
  const portalMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  const totalPendingCount = pendingPartnersCount + pendingClientsCount;

  const fetchAllNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const [partnerCount, allPartners, clientCount, allClients] = await Promise.all([
        getPendingPartnersCount().catch(() => 0),
        getAdminPartners().catch(() => []),
        getPendingClientsCount().catch(() => 0),
        getAdminClients().catch(() => [])
      ]);
      setPendingPartnersCount(typeof partnerCount === "number" ? partnerCount : 0);
      const pendingPartList = Array.isArray(allPartners) 
        ? allPartners.filter(p => !p.isApproved && p.verificationStatus !== "REJECTED")
        : [];
      setPendingPartnersList(pendingPartList);

      setPendingClientsCount(typeof clientCount === "number" ? clientCount : 0);
      const pendingCliList = Array.isArray(allClients)
        ? allClients.filter(c => !c.isApproved && c.verificationStatus !== "REJECTED")
        : [];
      setPendingClientsList(pendingCliList);
    } catch (err) {
      console.warn("Could not fetch verification notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
    const handleSync = () => fetchAllNotifications();
    window.addEventListener("bms_partner_updated", handleSync);
    window.addEventListener("bms_partner_registered", handleSync);
    window.addEventListener("bms_client_updated", handleSync);
    window.addEventListener("bms_client_registered", handleSync);
    return () => {
      window.removeEventListener("bms_partner_updated", handleSync);
      window.removeEventListener("bms_partner_registered", handleSync);
      window.removeEventListener("bms_client_updated", handleSync);
      window.removeEventListener("bms_client_registered", handleSync);
    };
  }, []);

  useEffect(() => {
    const handleAuthChange = () => setAdminUser(getStoredAdmin());
    const handleWorkspaceSync = (e) => setActiveWorkspace(e.detail || localStorage.getItem("bms_admin_active_workspace") || "hq");
    window.addEventListener("bms_admin_auth_changed", handleAuthChange);
    window.addEventListener("bms_admin_workspace_changed", handleWorkspaceSync);
    return () => {
      window.removeEventListener("bms_admin_auth_changed", handleAuthChange);
      window.removeEventListener("bms_admin_workspace_changed", handleWorkspaceSync);
    };
  }, []);

  const handleWorkspaceChange = (newWs) => {
    setActiveWorkspace(newWs);
    localStorage.setItem("bms_admin_active_workspace", newWs);
    window.dispatchEvent(new CustomEvent("bms_admin_workspace_changed", { detail: newWs }));
  };

  const handleSelectPortal = (newWs) => {
    handleWorkspaceChange(newWs);
    setShowPortalMenu(false);
  };

  const isSuperAdmin = adminUser?.roleId === "ROLE_SUPER_ADMIN" || adminUser?.role === "SUPER_ADMIN" || adminUser?.id === 1 || adminUser?.email === "admin@bookmystars.com";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (portalMenuRef.current && !portalMenuRef.current.contains(e.target)) {
        setShowPortalMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutAdminUser();
    setShowProfileMenu(false);
    window.dispatchEvent(new Event("bms_admin_auth_changed"));
    navigate("/admin/login");
  };

  const handleOpenPhotoModal = () => {
    setShowProfileMenu(false);
    setPreviewPhoto(adminUser?.avatar || null);
    setPhotoUrlInput(adminUser?.avatar || "");
    setShowPhotoModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("File Too Large", "Please select an image file under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewPhoto(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    setIsSavingPhoto(true);
    const finalAvatar = previewPhoto || (photoUrlInput.trim() ? photoUrlInput.trim() : null);

    try {
      // 1. Persist directly to PostgreSQL admin_users table via /admin/auth/avatar
      await apiClient.put("/admin/auth/avatar", { 
        avatarUrl: finalAvatar, 
        email: adminUser?.email || "admin@bookmystars.com" 
      });
    } catch (err) {
      console.warn("Backend auth avatar update notice:", err);
      try {
        const staffId = adminUser?.id || 1;
        await apiClient.put(`/admin/staff/${staffId}/avatar`, { avatarUrl: finalAvatar });
      } catch (err2) {
        console.warn("Fallback staff avatar update notice:", err2);
      }
    }

    const currentStored = getStoredAdmin() || {};
    const updated = { 
      ...currentStored, 
      name: currentStored.name || "Bharath",
      avatar: finalAvatar 
    };
    localStorage.setItem("bms_admin_user", JSON.stringify(updated));
    setAdminUser(updated);
    window.dispatchEvent(new Event("bms_admin_auth_changed"));

    setIsSavingPhoto(false);
    setShowPhotoModal(false);
    showSuccess("Photo Updated", finalAvatar ? "Profile photo updated successfully!" : "Profile photo removed.");
  };

  const portalOptions = [
    { id: "hq", label: "Talent", isLast: false },
    { id: "client", label: "Client", isLast: false },
    { id: "partner", label: "Partner", isLast: true }
  ];

  return (
    <header 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "between",
        height: "64px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      {/* 1. Left side: Brand Logo + Command Center + Collapse Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        {/* Logo circle */}
        <div 
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ee008f 0%, #a855f7 50%, #7c3aed 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(238, 0, 143, 0.25)",
            flexShrink: 0
          }}
        >
          <svg style={{ width: "18px", height: "18px", color: "#ffffff" }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
        </div>

        {/* Brand Text */}
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.15 }}>
          <span style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.3px" }}>
            Command Center
          </span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8" }}>
            Super Admin Hub
          </span>
        </div>

        {/* Toggle Collapse Button « / » */}
        <button
          type="button"
          onClick={toggleSidebar}
          style={{
            marginLeft: "10px",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "4px 8px",
            cursor: "pointer",
            color: "#64748b",
            fontSize: "13px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          aria-label="Toggle navigation menu"
        >
          <span style={{ fontFamily: "monospace" }}>{sidebarOpen ? "«" : "»"}</span>
        </button>
      </div>

      {/* 2. Center: Centered Search Bar matching reference image */}
      <div 
        style={{ 
          display: "flex", 
          flex: 1, 
          maxWidth: "520px", 
          margin: "0 auto",
          padding: "0 24px"
        }}
      >
        <div 
          style={{ 
            position: "relative", 
            width: "100%", 
            display: "flex", 
            alignItems: "center" 
          }}
        >
          <Search 
            size={16} 
            style={{ 
              position: "absolute", 
              left: "14px", 
              color: "#94a3b8", 
              pointerEvents: "none" 
            }} 
          />
          <input
            type="text"
            placeholder="Search talents, castings, users, reports..."
            style={{
              width: "100%",
              padding: "9px 16px 9px 40px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "12.5px",
              color: "#1e293b",
              outline: "none",
              transition: "border-color 0.2s ease"
            }}
          />
        </div>
      </div>

      {/* 3. Right side: Notifications, Switch Portal & Super Admin Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        
        {/* Notification Bell with Dynamic Badge and Verification Alerts Dropdown */}
        <div style={{ position: "relative" }} ref={notificationMenuRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: showNotifications ? "#f1f5f9" : "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "7px 9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0f172a",
              cursor: "pointer",
              position: "relative",
              transition: "background-color 0.15s ease"
            }}
            aria-label="Notifications"
            title={totalPendingCount > 0 ? `${totalPendingCount} Verification Alerts Pending (${pendingClientsCount} Clients, ${pendingPartnersCount} Partners)` : "Notifications"}
          >
            <Bell size={18} strokeWidth={2.2} />
            {totalPendingCount > 0 && (
              <span 
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: "900",
                  minWidth: "16px",
                  height: "16px",
                  padding: "0 4px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }}
              >
                {totalPendingCount}
              </span>
            )}
          </button>

          {/* Interactive Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "44px",
                right: 0,
                width: "380px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                boxShadow: "0 16px 36px rgba(15, 23, 42, 0.16)",
                zIndex: 110,
                overflow: "hidden"
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Bell size={16} style={{ color: "#ee008f" }} />
                  <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a" }}>
                    Verification Alerts
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: totalPendingCount > 0 ? "#fef2f2" : "#f1f5f9",
                    color: totalPendingCount > 0 ? "#dc2626" : "#64748b",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    border: totalPendingCount > 0 ? "1px solid #fecaca" : "1px solid #e2e8f0"
                  }}
                >
                  {totalPendingCount} Pending
                </span>
              </div>

              {/* Sub-Tabs: All, Clients, Partners */}
              <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", backgroundColor: "#ffffff", padding: "6px 12px", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => setNotificationTab("ALL")}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    fontSize: "11.5px",
                    fontWeight: "800",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: notificationTab === "ALL" ? "#0f172a" : "#f1f5f9",
                    color: notificationTab === "ALL" ? "#ffffff" : "#64748b"
                  }}
                >
                  All ({totalPendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationTab("CLIENTS")}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    fontSize: "11.5px",
                    fontWeight: "800",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: notificationTab === "CLIENTS" ? "#ec008c" : "#f1f5f9",
                    color: notificationTab === "CLIENTS" ? "#ffffff" : "#64748b"
                  }}
                >
                  Clients ({pendingClientsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationTab("PARTNERS")}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    fontSize: "11.5px",
                    fontWeight: "800",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: notificationTab === "PARTNERS" ? "#7c3aed" : "#f1f5f9",
                    color: notificationTab === "PARTNERS" ? "#ffffff" : "#64748b"
                  }}
                >
                  Partners ({pendingPartnersCount})
                </button>
              </div>

              {/* Items List */}
              <div style={{ maxHeight: "320px", overflowY: "auto", padding: "10px" }}>
                {loadingNotifications ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
                    Checking for registration applications...
                  </div>
                ) : (
                  <>
                    {/* CLIENT NOTIFICATIONS */}
                    {(notificationTab === "ALL" || notificationTab === "CLIENTS") && pendingClientsList.map((client) => (
                      <div
                        key={`client-${client.id}`}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "12px",
                          backgroundColor: "#fdf2f8",
                          border: "1px solid #fbcfe8",
                          marginBottom: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "13px", fontWeight: "800", color: "#831843" }}>
                            {client.companyName}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              backgroundColor: "#fce7f3",
                              color: "#be185d",
                              border: "1px solid #fbcfe8"
                            }}
                          >
                            Brand • {client.industry ? client.industry.replace(/_/g, " ") : "Client"}
                          </span>
                        </div>

                        <div style={{ fontSize: "11.5px", color: "#831843", lineHeight: "1.4" }}>
                          {client.requirements ? client.requirements.substring(0, 75) + "..." : "Commercial brand seeking artist casting & ad production."}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {client.location || "City not set"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNotifications(false);
                              handleWorkspaceChange("client");
                              if (window.location.pathname !== "/admin") {
                                navigate("/admin");
                              }
                            }}
                            style={{
                              background: "linear-gradient(135deg, #ec008c 0%, #7c3aed 100%)",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "4px 10px",
                              fontSize: "11px",
                              fontWeight: "800",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              boxShadow: "0 2px 4px rgba(236, 0, 140, 0.25)"
                            }}
                          >
                            Review Brand &rarr;
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* PARTNER NOTIFICATIONS */}
                    {(notificationTab === "ALL" || notificationTab === "PARTNERS") && pendingPartnersList.map((partner) => (
                      <div
                        key={`partner-${partner.id}`}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "12px",
                          backgroundColor: "#fdf4ff",
                          border: "1px solid #f5d0fe",
                          marginBottom: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "13px", fontWeight: "800", color: "#581c87" }}>
                            {partner.fullName}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              backgroundColor: "#f3e8ff",
                              color: "#7e22ce",
                              border: "1px solid #e9d5ff"
                            }}
                          >
                            Partner • {partner.partnerCategory ? partner.partnerCategory.replace(/_/g, " ") : "Partner"}
                          </span>
                        </div>

                        <div style={{ fontSize: "11.5px", color: "#6b21a8", lineHeight: "1.4" }}>
                          {partner.partnerRequirements ? partner.partnerRequirements.substring(0, 75) + "..." : "Registered partner seeking verification to post casting ads and discover talent."}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {partner.partnerAddress || partner.location || "City not set"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNotifications(false);
                              handleWorkspaceChange("partner");
                              if (window.location.pathname !== "/admin") {
                                navigate("/admin");
                              }
                            }}
                            style={{
                              background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "4px 10px",
                              fontSize: "11px",
                              fontWeight: "800",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              boxShadow: "0 2px 4px rgba(238, 0, 143, 0.2)"
                            }}
                          >
                            Review Partner &rarr;
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Empty State */}
                    {totalPendingCount === 0 && (
                      <div style={{ padding: "24px 16px", textAlign: "center" }}>
                        <div 
                          style={{ 
                            width: "38px", 
                            height: "38px", 
                            borderRadius: "50%", 
                            backgroundColor: "#ecfdf5", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            margin: "0 auto 8px"
                          }}
                        >
                          <Check size={20} style={{ color: "#10b981" }} />
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                          All Queues Clear!
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                          All registered brands, studios & academies have been reviewed.
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer Links */}
              <div
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px"
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    handleWorkspaceChange("client");
                    if (window.location.pathname !== "/admin") {
                      navigate("/admin");
                    }
                  }}
                  style={{
                    padding: "8px",
                    backgroundColor: "#fdf2f8",
                    border: "1px solid #fbcfe8",
                    borderRadius: "10px",
                    color: "#be185d",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  Client Desk &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    handleWorkspaceChange("partner");
                    if (window.location.pathname !== "/admin") {
                      navigate("/admin");
                    }
                  }}
                  style={{
                    padding: "8px",
                    backgroundColor: "#fdf4ff",
                    border: "1px solid #f5d0fe",
                    borderRadius: "10px",
                    color: "#7e22ce",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  Partner Desk &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* EXACT REFERENCE: SWITCH PORTAL DROPDOWN (BMS, Client, Partner) */}
        {isSuperAdmin && (
          <div style={{ position: "relative" }} ref={portalMenuRef}>
            <button
              type="button"
              onClick={() => setShowPortalMenu(!showPortalMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: showPortalMenu ? "#e0edfb" : "#edf4fc",
                border: "1px solid #c8d8ea",
                borderRadius: "10px",
                padding: "6px 8px 6px 12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                userSelect: "none"
              }}
              title="Switch Operating Portal (BMS, Client, Partner)"
            >
              {/* Lottie-Inspired Animated Portal Switcher GIF Icon */}
              <img 
                src={switchPortalGif} 
                alt="Switch Portal" 
                style={{ 
                  width: "22px", 
                  height: "22px", 
                  objectFit: "contain",
                  flexShrink: 0
                }} 
              />

              {/* Button Label */}
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.2px" }}>
                Switch Portal
              </span>

              {/* Framed Down Chevron */}
              <div 
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "5px",
                  border: "1.5px solid #0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "4px",
                  flexShrink: 0,
                  backgroundColor: "#ffffff"
                }}
              >
                <ChevronDown size={13} strokeWidth={2.6} color="#0f172a" />
              </div>
            </button>

            {/* Switch Portal Dropdown Menu (Exactly 3 Options: BMS, Client, Partner) */}
            {showPortalMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "42px",
                  left: 0,
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
                  padding: "8px",
                  minWidth: "220px",
                  zIndex: 110,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
              >
                {portalOptions.map((opt) => {
                  const isSelected = activeWorkspace === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectPortal(opt.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        backgroundColor: isSelected ? "#f1f5f9" : "transparent",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                        textAlign: "left",
                        width: "100%"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isSelected ? "#f1f5f9" : "transparent";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        {opt.isLast ? <TreeLastIcon /> : <TreeBranchIcon />}
                        <span 
                          style={{ 
                            fontSize: "15px", 
                            fontWeight: isSelected ? "800" : "700", 
                            color: isSelected ? "#ee008f" : "#0f172a",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px"
                          }}
                        >
                          {opt.label}
                          {opt.id === "client" && pendingClientsCount > 0 && (
                            <span
                              style={{
                                backgroundColor: "#ec008c",
                                color: "#ffffff",
                                fontSize: "10px",
                                fontWeight: "900",
                                padding: "1px 6px",
                                borderRadius: "10px",
                                letterSpacing: "0.2px"
                              }}
                            >
                              {pendingClientsCount} pending
                            </span>
                          )}
                          {opt.id === "partner" && pendingPartnersCount > 0 && (
                            <span
                              style={{
                                backgroundColor: "#ef4444",
                                color: "#ffffff",
                                fontSize: "10px",
                                fontWeight: "900",
                                padding: "1px 6px",
                                borderRadius: "10px",
                                letterSpacing: "0.2px"
                              }}
                            >
                              {pendingPartnersCount} pending
                            </span>
                          )}
                        </span>
                      </div>
                      <ChevronRight 
                        size={17} 
                        strokeWidth={2.4} 
                        color={isSelected ? "#ee008f" : "#0f172a"} 
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Super Admin Profile */}
        <div style={{ position: "relative" }} ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "2px"
            }}
          >
            {/* Avatar circle */}
            <div 
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #fce7f3",
                flexShrink: 0,
                backgroundColor: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {adminUser?.avatar ? (
                <img
                  src={adminUser.avatar}
                  alt={adminUser?.name || "Bharath"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #ee008f 0%, #8b5cf6 100%)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: "900",
                    letterSpacing: "0.5px"
                  }}
                >
                  {(adminUser?.name || "Bharath").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Admin meta */}
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.2 }}>
              <span style={{ fontSize: "12.5px", fontWeight: "800", color: "#0f172a" }}>
                {adminUser?.name || "Bharath"}
              </span>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#ee008f" }}>
                {adminUser?.roleName || adminUser?.role || "Super Admin"}
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div 
              style={{
                position: "absolute",
                right: 0,
                top: "48px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                padding: "8px 0",
                minWidth: "220px",
                zIndex: 100
              }}
            >
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                  {adminUser?.name || "Bharath"}
                </div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#ee008f", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                  <Shield size={12} /> {adminUser?.roleName || "Super Admin"}
                </div>
                <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" }}>
                  {adminUser?.email || "admin@bookmystars.com"}
                </div>
              </div>

              <div style={{ padding: "4px" }}>
                {/* EDIT / UPDATE PROFILE PHOTO (Above Sign Out button for all admins) */}
                <button
                  type="button"
                  onClick={handleOpenPhotoModal}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    color: "#334155",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    borderRadius: "8px",
                    marginBottom: "2px"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Camera size={14} style={{ color: "#ee008f" }} />
                  <span>Update Profile Photo</span>
                </button>

                {/* SIGN OUT */}
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    color: "#e11d48",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    borderRadius: "8px"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fff1f2"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <LogOut size={14} />
                  <span>Sign Out of Console</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: UPDATE PROFILE PHOTO FOR ALL ADMINS */}
      {showPhotoModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPhotoModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              border: "1px solid #e2e8f0",
              boxSizing: "border-box"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center", color: "#ee008f" }}>
                  <Camera size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Profile Photo</h3>
                  <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Update avatar for {adminUser?.name || "Bharath"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#64748b" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Current / Preview Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid #ee008f",
                  boxShadow: "0 4px 14px rgba(238, 0, 143, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8fafc"
                }}
              >
                {previewPhoto || photoUrlInput ? (
                  <img
                    src={previewPhoto || photoUrlInput}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(135deg, #ee008f 0%, #8b5cf6 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "36px",
                      fontWeight: "900"
                    }}
                  >
                    {(adminUser?.name || "Bharath").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
                {previewPhoto || photoUrlInput ? "Photo Preview" : "No photo uploaded (Default Initials Badge)"}
              </span>
            </div>

            {/* Upload Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
              {/* Option A: File Upload */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: "#f8fafc",
                  border: "1.5px dashed #cbd5e1",
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#0f172a",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#ee008f"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
              >
                <Upload size={16} style={{ color: "#ee008f" }} />
                <span>Upload Image from Device</span>
              </button>

              {/* Option B: Direct URL Input */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "4px" }}>
                  Or enter image URL:
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={photoUrlInput}
                  onChange={(e) => {
                    setPhotoUrlInput(e.target.value);
                    if (e.target.value) setPreviewPhoto(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              {/* Option C: Remove Photo Button */}
              {(previewPhoto || photoUrlInput || adminUser?.avatar) && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewPhoto(null);
                    setPhotoUrlInput("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    background: "transparent",
                    border: "none",
                    color: "#e11d48",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    padding: "4px"
                  }}
                >
                  <Trash2 size={13} />
                  <span>Remove Photo (Show Initials Instead)</span>
                </button>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#f1f5f9",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#64748b",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingPhoto}
                onClick={handleSavePhoto}
                style={{
                  flex: 2,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #ee008f 0%, #db2777 100%)",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(238, 0, 143, 0.3)"
                }}
              >
                {isSavingPhoto ? "Saving..." : "Save Photo"}
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
