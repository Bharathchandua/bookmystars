import PagesButton from "../common/PagesButton";
import { useState } from "react";
import "./sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Film,
  Sparkles,
  Compass,
  CalendarDays,
  Calendar,
  MessageSquare,
  Users,
  BarChart2,
  DollarSign,
  Star,
  Settings,
  Crown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Briefcase
} from "lucide-react";
import logo from "../../assets/logo.png";
import { getStoredUser } from "../../services/api";

export default function Sidebar({ isOpen, isPinned, onToggle, onHoverOpen, onHoverClose, activeTab, setActiveTab }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const storedUser = getStoredUser();

  const isPro = storedUser?.accountType === "PROFESSIONAL";

  const proMenuItems = [
    { id: "pro-dashboard", label: "Talent Discovery",  icon: Briefcase,       path: "/professional/dashboard" },
    { id: "messages",      label: "Messages",          icon: MessageSquare,   path: "/messages" },
    { id: "contacts",      label: "Contacts",          icon: Users,           path: "/contacts" },
    { id: "settings",      label: "Settings",          icon: Settings,        path: "/settings" },
  ];

  const talentMenuItems = [
    { id: "dashboard",    label: "Dashboard",          icon: LayoutDashboard, path: "/dashboard" },
    { id: "profile",      label: "Profile",             icon: User,            path: "/profile" },
    { id: "media",        label: "My Media",            icon: Film,            path: "/my-media" },
    { id: "auditions",    label: "Auditions & Castings",icon: Sparkles,        path: "/auditions" },
    { id: "opportunities",label: "Opportunities",       icon: Compass,         path: "/opportunities" },
    { id: "bookings",     label: "Bookings",            icon: CalendarDays,    path: "/bookings" },
    { id: "calendar",     label: "Calendar",            icon: Calendar,        path: "/calendar" },
    { id: "messages",     label: "Messages",            icon: MessageSquare,   path: "/messages" },
    { id: "contacts",     label: "Contacts",            icon: Users,           path: "/contacts" },
    { id: "analytics",    label: "Analytics",           icon: BarChart2,       path: "/analytics" },
    { id: "earnings",     label: "Earnings",            icon: DollarSign,      path: "/earnings" },
    { id: "reviews",      label: "Reviews",             icon: Star,            path: "/reviews" },
    { id: "settings",     label: "Settings",            icon: Settings,        path: "/settings" },
  ];

  const menuItems = isPro ? proMenuItems : talentMenuItems;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${window.innerWidth > 1024 ? "hidden" : "block"}`}
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container using custom Vanilla CSS classes */}
      <aside 
        className={`db-sidebar ${isOpen ? "" : "collapsed"}`}
        onMouseLeave={onHoverClose}
      >
        
        {/* Header Section */}
        <div className="db-sidebar-header">
          {/* Desktop Toggle Button */}
          <PagesButton
            onClick={onToggle}
            onMouseEnter={onHoverOpen}
            className="sidebar-toggle-btn-new hidden lg:flex"
            aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={22} style={{ color: '#334155' }} />
          </PagesButton>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="db-sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === "/dashboard" && location.pathname === "/");

            return (
              <PagesButton
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(item.path);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`db-menu-item ${isActive ? "active" : ""}`}
              >
                {/* Icon */}
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110
                    ${isActive ? "text-pink-600" : "text-slate-400"}`}
                />

                {/* Label (Hidden when collapsed) */}
                {isOpen && (
                  <span className="opacity-100 transition-opacity duration-200">
                    {item.label}
                  </span>
                )}

                {/* Message Badge */}
                {item.badge && isOpen && (
                  <span className="db-menu-badge">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for Collapsed Sidebar */}
                {!isOpen && (
                  <span className="absolute left-16 scale-0 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md group-hover:scale-100 transition-all duration-150 origin-left whitespace-nowrap z-50">
                    {item.label}
                    {item.badge && <span className="ml-2 px-1 bg-pink-500 rounded text-[9px]">{item.badge}</span>}
                  </span>
                )}
              </PagesButton>
            );
          })}

          {/* Upgrade Card placed directly inside the menu flow */}
          <div className="db-sidebar-premium-inline">
            {isOpen ? (
              <div className="db-premium-box">
                <div className="db-premium-crown">
                  <Crown size={24} className="text-white" />
                </div>
                <h4>Upgrade to Premium</h4>
                <p>Get more visibility and exclusive opportunities.</p>
                <PagesButton className="db-premium-btn">
                  Upgrade Now
                </PagesButton>
              </div>
            ) : (
              <PagesButton
                onClick={onToggle}
                className="db-sidebar-premium-collapsed-btn"
                aria-label="Upgrade to Premium"
              >
                <Crown size={18} className="text-yellow-400 fill-yellow-400" />
                
                {/* Tooltip */}
                <span className="premium-tooltip">
                  Upgrade to Premium
                </span>
              </PagesButton>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}


