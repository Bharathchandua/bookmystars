import React, { useState } from "react";
import AdminHeader from "./AdminHeader.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

export default function AdminLayout({ 
  children, 
  pageTitle = "Command Center", 
  subTitle = "Super Admin Hub",
  activeDesk = "overview",
  onSelectDesk
}) {
  // Sidebar expanded by default (matching reference image)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div 
      className="admin-platform-container"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#0f172a"
      }}
    >
      {/* Top Admin Header */}
      <AdminHeader
        toggleSidebar={handleToggle}
        sidebarOpen={sidebarOpen}
        pageTitle={pageTitle}
        subTitle={subTitle}
      />

      {/* Main Container below Header */}
      <div 
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          position: "relative"
        }}
      >
        {/* Left Admin Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={handleToggle}
          activeDesk={activeDesk}
          onSelectDesk={onSelectDesk}
        />

        {/* Dynamic Workspace Container */}
        <main 
          style={{
            flex: 1,
            minWidth: 0,
            padding: "24px 32px",
            marginLeft: sidebarOpen ? "250px" : "76px",
            transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            backgroundColor: "#f8fafc"
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
