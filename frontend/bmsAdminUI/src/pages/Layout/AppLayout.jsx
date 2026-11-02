import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

export default function AppLayout({ children, pageTitle, subTitle, searchPlaceholder, profileName, profilePhoto, headerExtras, showMessages, searchQuery, onSearchChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const sidebarTimeoutRef = useRef(null);
  const justClickedRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;

  // ─── DESKTOP HANDLERS (> 1024px) ───
  const handleDesktopOpen = () => {
    if (sidebarTimeoutRef.current) clearTimeout(sidebarTimeoutRef.current);
    setSidebarOpen(true);
  };

  const handleDesktopClose = () => {
    if (sidebarTimeoutRef.current) clearTimeout(sidebarTimeoutRef.current);
    sidebarTimeoutRef.current = setTimeout(() => setSidebarOpen(false), 150);
  };

  const handleDesktopToggle = () => {
    if (sidebarOpen) {
      handleDesktopClose();
    } else {
      handleDesktopOpen();
    }
  };

  // ─── TABLET / MOBILE HANDLERS (<= 1024px) ───
  const handleMobileToggle = () => {
    if (justClickedRef.current) return;
    justClickedRef.current = true;
    setTimeout(() => { justClickedRef.current = false; }, 300);

    const nextOpen = !sidebarOpen;
    setSidebarOpen(nextOpen);
    setSidebarPinned(nextOpen);
  };

  // ─── UNIFIED PROPS FOR SIDEBAR ───
  const onToggle = windowWidth > 1024 ? handleDesktopToggle : handleMobileToggle;
  
  const onHoverOpen = () => {
    if (windowWidth > 1024) {
      handleDesktopOpen();
    }
  };

  const onHoverClose = () => {
    if (windowWidth > 1024) {
      handleDesktopClose();
    }
  };

  return (
    <div className="db-layout-container">

      {/* Shared Sidebar — same on every page */}
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={windowWidth > 1024 ? false : sidebarPinned}
        onToggle={onToggle}
        onHoverOpen={onHoverOpen}
        onHoverClose={onHoverClose}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main content area */}
      <div
        className={`db-main-content flex-1 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300 ${sidebarOpen ? "sidebar-is-open" : "sidebar-is-collapsed"}`}
        style={{
          paddingLeft: windowWidth === 1024
            ? "80px"
            : (windowWidth < 1024 ? "0px" : (sidebarOpen ? "260px" : "80px"))
        }}
      >

        {/* Shared Header — pageTitle changes per page */}
        <Header
          toggleSidebar={onToggle}
          sidebarOpen={sidebarOpen}
          onOpenSidebar={onHoverOpen}
          onCloseSidebar={onHoverClose}
          profileName={profileName}
          profilePhoto={profilePhoto}
          pageTitle={pageTitle}
          subTitle={subTitle}
          searchPlaceholder={searchPlaceholder}
          headerExtras={headerExtras}
          showMessages={showMessages}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        {/* Page-specific content goes here */}
        <main className="db-workspace">
          {children}
        </main>

      </div>
    </div>
  );
}
