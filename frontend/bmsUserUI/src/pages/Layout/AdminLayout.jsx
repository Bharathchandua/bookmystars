import React, { useState, useRef } from "react";
import AdminHeader from "./AdminHeader.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

export default function AdminLayout({ 
  children, 
  pageTitle = "Command Center", 
  subTitle = "Super Admin Hub",
  activeDesk = "overview",
  onSelectDesk,
  activeWorkspace
}) {
  // Sidebar open/collapse state (collapsed by default in icon mode, auto-expands on hover or toggle pin)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isPinned) {
        setSidebarOpen(false);
      }
    }, 150);
  };

  const handleToggle = () => {
    setIsPinned((prev) => !prev);
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div 
      className="admin-platform-container"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
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
          isPinned={isPinned}
          onToggle={handleToggle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          activeDesk={activeDesk}
          onSelectDesk={onSelectDesk}
          activeWorkspace={activeWorkspace}
        />

        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div 
            onClick={() => {
              setSidebarOpen(false);
              setIsPinned(false);
            }}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 transition-opacity cursor-pointer"
            aria-label="Close navigation drawer"
          />
        )}

        {/* Dynamic Workspace Container */}
        <main 
          className="admin-main-desk"
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
