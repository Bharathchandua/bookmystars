import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Building2,
  Search,
  Megaphone,
  Bookmark,
  FileText,
  Users,
  Star,
  Calendar,
  TrendingUp,
  Plus,
  ChevronRight,
  Bell,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Clock,
  Sparkles,
  MapPin,
  MoreVertical,
  ExternalLink,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Settings,
  Play,
  Video,
  Pencil,
  Trash2
} from "lucide-react";
import { getStoredUser, logoutUser } from "../../features/bms/api/auth/authApi";
import { opportunitiesApi } from "../../features/bms/api/opportunities/opportunitiesApi";
import { shortlistApi } from "../../features/bms/api/shortlist/shortlistApi";
import { applicationsApi } from "../../features/bms/api/applications/applicationsApi";
import { bookingsApi } from "../../features/bms/api/bookings/bookingsApi";
import { showSuccess, showError, confirmDelete } from "../../shared/utils/alert";
import ClientProfile from "./ClientProfile";
import ClientTalentSearch from "./ClientTalentSearch";
import ClientBookingRequests from "./ClientBookingRequests";
import ClientPostRequirementModal from "./ClientPostRequirementModal";
import ApplicantReviewModal from "../common/ApplicantReviewModal";
import WorkspaceHeroBanner from "../common/WorkspaceHeroBanner";
import { StatCard, Button, Badge } from "../../shared/common";

// Mini Sparkline SVG wave component for stat cards
function SparklineWave({ color = "#ec4899", gradientId = "pinkGrad" }) {
  return (
    <svg className="w-20 h-9 shrink-0 overflow-visible" viewBox="0 0 100 35" fill="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0 28 Q 25 12, 45 20 T 75 10 T 100 14 L 100 35 L 0 35 Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M0 28 Q 25 12, 45 20 T 75 10 T 100 14"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  
  // Real client user data from session or PostgreSQL database
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = getStoredUser();
    return stored || {
      fullName: "Tanishq Fine Jewelry / Apex Tools Corp",
      email: "tanishqjewels@gmail.com",
      accountType: "CLIENT",
      partnerCategory: "Jewelry & Luxury"
    };
  });

  // Workspace Navigation: DASHBOARD | PROFILE | SEARCH_TALENT | BRIEFS | SHORTLISTED
  const [activeNav, setActiveNav] = useState("DASHBOARD");

  // Top bar search state
  const [headerSearch, setHeaderSearch] = useState("");

  // Desktop Sidebar Collapse & Pin State (Auto-expand on hover, or toggle pinned)
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    return localStorage.getItem("bms_client_sidebar_pinned") === "true";
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const pinned = localStorage.getItem("bms_client_sidebar_pinned") === "true";
    return !pinned;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarTimeoutRef = useRef(null);

  // Profile Dropdown state & ref
  const profileDropdownRef = useRef(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Modals state
  const [showPostReqModal, setShowPostReqModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Briefs, Applications & Shortlist states
  const [briefFilterTab, setBriefFilterTab] = useState("ALL");
  const [briefsList, setBriefsList] = useState([]);
  const [editingBrief, setEditingBrief] = useState(null);
  const [isLoadingBriefs, setIsLoadingBriefs] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [reviewingBrief, setReviewingBrief] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [sentRequestsList, setSentRequestsList] = useState([]);
  const [isLoadingSentRequests, setIsLoadingSentRequests] = useState(false);

  // Auto-toggle sidebar on mouse hover (matching talent/user behavior)
  const handleSidebarMouseEnter = () => {
    if (sidebarTimeoutRef.current) clearTimeout(sidebarTimeoutRef.current);
    setIsSidebarCollapsed(false);
  };

  const handleSidebarMouseLeave = () => {
    if (sidebarTimeoutRef.current) clearTimeout(sidebarTimeoutRef.current);
    sidebarTimeoutRef.current = setTimeout(() => {
      if (!isSidebarPinned) {
        setIsSidebarCollapsed(true);
      }
    }, 150);
  };

  // Toggle pin state
  const toggleSidebarPin = () => {
    const nextPin = !isSidebarPinned;
    setIsSidebarPinned(nextPin);
    setIsSidebarCollapsed(!nextPin);
    localStorage.setItem("bms_client_sidebar_pinned", String(nextPin));
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch casting calls posted specifically by THIS authenticated client account
  useEffect(() => {
    let isMounted = true;
    async function loadBriefs() {
      setIsLoadingBriefs(true);
      try {
        const calls = await opportunitiesApi.getMyCastingCalls();
        if (isMounted) {
          if (Array.isArray(calls) && calls.length > 0) {
            const mapped = calls.map((item) => ({
              id: item.id,
              title: item.title,
              industry: item.projectType || "Commercial Brand Ad",
              category: item.customCraft || item.roleType || "Model Shoot",
              positionsNeeded: item.age ? parseInt(item.age, 10) || 3 : 4,
              budget: item.budget ? `₹${Number(item.budget).toLocaleString("en-IN")}` : "₹45,000 / day",
              urgency: "Available in 3 Days",
              status: item.status === "OPEN" ? "Active & Urgent" : item.status,
              deadline: item.applicationDeadline
                ? `Shoot Date: ${item.applicationDeadline}`
                : "Shoot Date: In 3 Days",
              location: item.location || "Mumbai, Maharashtra",
              applicationsCount: item.applicantCount || 0,
              shortlistedCount: 0,
              image: item.posterUrl || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80",
              description: item.description && item.description.trim().length > 0
                ? item.description
                : `Commercial shoot brief for ${item.title}. Verified brand project registered on BookMyStars.`,
              createdAt: item.createdAt ? String(item.createdAt).split("T")[0] : "2026-10-25"
            }));
            setBriefsList(mapped);
          } else {
            // Client has not posted any briefs yet
            setBriefsList([]);
          }
        }
      } catch (err) {
        console.error("Failed to load shoot briefs from database:", err);
      } finally {
        if (isMounted) setIsLoadingBriefs(false);
      }
    }

    loadBriefs();

    // Load persistent shortlists and candidate applications from database
    async function loadShortlistsAndApps() {
      setIsLoadingApps(true);
      try {
        const [savedIds, apps, sentReqs] = await Promise.all([
          shortlistApi.getMyShortlistIds(),
          applicationsApi.getReceivedApplications(),
          bookingsApi.getSentBookingRequests().catch(() => [])
        ]);
        if (isMounted) {
          if (Array.isArray(savedIds)) setShortlistedIds(savedIds);
          if (Array.isArray(apps)) setRecentApplications(apps);
          if (Array.isArray(sentReqs)) setSentRequestsList(sentReqs);
        }
      } catch (err) {
        console.warn("Could not load shortlist or applications from server:", err);
      } finally {
        if (isMounted) setIsLoadingApps(false);
      }
    }
    loadShortlistsAndApps();

    const handleBookingCreated = async () => {
      try {
        const updatedReqs = await bookingsApi.getSentBookingRequests();
        if (Array.isArray(updatedReqs)) setSentRequestsList(updatedReqs);
      } catch (e) {
        console.warn("Failed to reload sent booking requests:", e);
      }
    };
    window.addEventListener("bms_booking_request_created", handleBookingCreated);

    return () => {
      isMounted = false;
      window.removeEventListener("bms_booking_request_created", handleBookingCreated);
    };
  }, []);

  // Handle Logout -> clears token and navigates directly back to Homepage ('/')
  const handleLogout = () => {
    logoutUser();
    showSuccess("Signed Out", "You have been signed out successfully.");
    navigate("/");
  };

  const handleCreateBrief = async (newBrief) => {
    let createdId = newBrief.id;
    try {
      // Attempt backend persistence to casting_calls table with photo posterUrl
      const backendPayload = {
        title: newBrief.title,
        projectType: newBrief.industry || "Jewelry & Luxury",
        roleType: "MODEL",
        description: newBrief.description,
        requirements: newBrief.urgency || "Shoot Requirement",
        location: newBrief.location || "Mumbai",
        budget: 65000,
        applicationDeadline: newBrief.shootDate || new Date().toISOString().split("T")[0],
        status: "OPEN",
        posterUrl: newBrief.image,
        age: "18-35",
        gender: "ALL"
      };
      const res = await opportunitiesApi.createCastingCall(backendPayload).catch(e => console.warn("Backend casting save skipped:", e));
      if (res && res.id) {
        createdId = res.id;
      }
    } catch (e) {
      console.warn("Could not save to backend:", e);
    }

    setBriefsList(prev => [{ ...newBrief, id: createdId }, ...prev]);
    showSuccess("Campaign Shoot Published", "Your new shoot brief with photo has been published and saved.");
  };

  const handleUpdateBrief = async (briefId, updatedData) => {
    try {
      const backendPayload = {
        title: updatedData.title,
        projectType: updatedData.industry || "Jewelry & Luxury",
        roleType: "MODEL",
        description: updatedData.description,
        requirements: updatedData.urgency || "Shoot Requirement",
        location: updatedData.location || "Mumbai",
        budget: 65000,
        applicationDeadline: updatedData.shootDate || new Date().toISOString().split("T")[0],
        status: "OPEN",
        posterUrl: updatedData.image,
        age: "18-35",
        gender: "ALL"
      };
      await opportunitiesApi.updateCastingCall(briefId, backendPayload);
      setBriefsList(prev => prev.map(b => b.id === briefId ? { ...b, ...updatedData } : b));
      setEditingBrief(null);
      showSuccess("Shoot Brief Updated", `Campaign "${updatedData.title}" has been updated successfully.`);
    } catch (e) {
      console.warn("Could not update casting on backend:", e);
      showError("Update Failed", e.message || "Failed to update casting call on server.");
    }
  };

  const handleDeleteBrief = async (briefId, briefTitle) => {
    const isConfirmed = await confirmDelete(
      `"${briefTitle}"`,
      `This will permanently remove "${briefTitle}" and all associated applicant responses.`
    );
    if (!isConfirmed) return;

    try {
      await opportunitiesApi.deleteCastingCall(briefId);
      setBriefsList(prev => prev.filter(b => b.id !== briefId));
      showSuccess("Shoot Brief Deleted", `Campaign brief "${briefTitle}" has been deleted.`);
    } catch (e) {
      console.warn("Could not delete casting on backend:", e);
      showError("Delete Failed", e.message || "Failed to delete casting call on server.");
    }
  };

  const toggleShortlist = async (id) => {
    setShortlistedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    try {
      const updated = await shortlistApi.toggleShortlist(id);
      if (Array.isArray(updated)) {
        setShortlistedIds(updated);
      }
    } catch (e) {
      console.warn("Server shortlist sync error:", e);
    }
  };

  const filteredBriefs = (briefsList || []).filter(brief => {
    if (!brief || !brief.status) return true;
    const status = (brief.status || "").toLowerCase();
    if (briefFilterTab === "ACTIVE") return status.includes("active");
    if (briefFilterTab === "UNDER_REVIEW") return status.includes("shortlist") || status.includes("review");
    if (briefFilterTab === "COMPLETED") return status.includes("completed");
    return true;
  });

  // Dynamic Metrics calculated from database data
  const totalActiveBriefs = (briefsList || []).filter(b => (b?.status || "").toLowerCase().includes("active")).length || (briefsList || []).length;
  const totalModelSubmissions = (briefsList || []).reduce((acc, curr) => acc + (curr?.applicationsCount || 0), 0);
  const totalShortlisted = (shortlistedIds || []).length;

  const clientName = currentUser?.fullName || currentUser?.stageName || "Tanishq Fine Jewelry / Apex Tools Corp";
  const clientIndustry = currentUser?.partnerCategory || "Jewelry & Luxury";
  const clientInitial = (clientName || "C").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. LEFT SIDEBAR NAVIGATION WITH HOVER AUTO-TOGGLE & PIN    */}
      {/* ─────────────────────────────────────────────────────────── */}
      <aside 
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={`
          fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out flex flex-col justify-between
          ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
          ${isMobileSidebarOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top Header / Brand Logo & Toggle Pin Button */}
        <div>
          <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* Executive Crown Logo Mark in Signature BMS Gradient */}
              <div 
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)", backgroundColor: "#7c3aed" }}
                className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-md shadow-pink-500/20 shrink-0"
              >
                👑
              </div>
              {!isSidebarCollapsed && (
                <div className="leading-tight truncate">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 block truncate">
                    BOOK MY STARS
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-pink-600 block">
                    COMMERCIAL CLIENT DESK
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Sidebar Pin / Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebarPin}
              className={`hidden lg:flex p-1.5 rounded-xl transition cursor-pointer ${
                isSidebarPinned 
                  ? "bg-pink-50 text-pink-700 hover:bg-pink-100" 
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
              title={isSidebarPinned ? "Unpin Sidebar (Auto-collapse on mouse leave)" : "Pin Sidebar Open"}
              aria-label="Toggle Sidebar Pin"
            >
              {isSidebarPinned ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Client Brand Identity Pill */}
          <div className="p-3 border-b border-slate-100">
            <div className={`flex items-center gap-2.5 p-2 rounded-2xl bg-pink-50/50 border border-pink-100/70 ${isSidebarCollapsed ? "justify-center" : ""}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-900 to-pink-900 text-pink-200 font-bold text-xs flex items-center justify-center shrink-0">
                {clientInitial}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {clientName}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-pink-700 font-semibold">
                    <CheckCircle2 size={11} className="text-pink-600" />
                    <span>Verified Corporate Client</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {[
              { id: "DASHBOARD", label: "Dashboard", icon: LayoutGrid, count: null },
              { id: "PROFILE", label: "Brand Profile", icon: Building2, count: null },
              { id: "SEARCH_TALENT", label: "Scout Models & Faces", icon: Search, count: null },
              { id: "BRIEFS", label: "Shoot Briefs & Ad Posts", icon: Megaphone, count: briefsList.length },
              { id: "REQUESTS", label: "Audition Calls & Bookings", icon: Calendar, count: sentRequestsList.length },
              { id: "SHORTLISTED", label: "Shortlisted Talent", icon: Bookmark, count: shortlistedIds.length }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveNav(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center px-2" : "justify-between"
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={18} className={isActive ? "text-white" : "text-slate-500"} />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isSidebarCollapsed && item.count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? "bg-white/20 text-white" : "bg-pink-100 text-pink-700"
                    }`}>
                      {item.count}
                    </span>
                  )}
                  {isSidebarCollapsed && item.count !== null && (
                    <span className="w-2 h-2 rounded-full bg-pink-500 absolute top-2 right-2" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Post Shoot Requirement */}
        <div className="p-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowPostReqModal(true)}
            title={isSidebarCollapsed ? "Post Shoot Requirement" : undefined}
            className={`w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSidebarCollapsed ? "px-2" : "px-4"
            }`}
          >
            <Plus size={16} />
            {!isSidebarCollapsed && <span>Post Shoot Requirement</span>}
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. MAIN CONTENT AREA (Dynamically padded for collapsed/open) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-4">
          
          {/* Left: Mobile hamburger & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label={isMobileSidebarOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
            >
              {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-400">
              <span className="text-pink-700 font-extrabold flex items-center gap-1.5 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100 shrink-0">
                <span>👑</span> Commercial Desk
              </span>
              <span className="hidden sm:inline">&gt;</span>
              <span className="font-bold text-slate-900 hidden sm:inline truncate max-w-[140px] md:max-w-none">
                {activeNav === "DASHBOARD" && "Executive Dashboard"}
                {activeNav === "PROFILE" && "Corporate Brand Profile"}
                {activeNav === "SEARCH_TALENT" && "Scout Models & Faces"}
                {activeNav === "BRIEFS" && "Shoot Briefs & Campaigns"}
                {activeNav === "REQUESTS" && "Audition Calls & Booking Requests"}
                {activeNav === "SHORTLISTED" && "Shortlisted Talent"}
              </span>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search models, jewelry shoots, casting briefs... (Ctrl + K)"
                className="w-full pl-9 pr-14 py-2 rounded-full bg-slate-100/80 hover:bg-slate-100 border-none text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition shadow-2xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                Ctrl + K
              </span>
            </div>
          </div>

          {/* Right: Notifications & USER PROFILE DROPDOWN MENU */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="w-2 h-2 rounded-full bg-pink-600 absolute top-2 right-2 ring-2 ring-white" />
            </button>

            {/* USER PROFILE DROPDOWN MENU */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
                aria-label="User Profile Dropdown Menu"
                aria-expanded={isProfileDropdownOpen}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-pink-100">
                  {clientInitial}
                </div>
                <div className="hidden sm:block text-left max-w-[130px]">
                  <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                    {clientName}
                  </span>
                  <span className="text-[10px] text-pink-600 font-semibold block truncate">
                    Verified Brand Client
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Interactive Profile Dropdown Card */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {/* Account Header */}
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {clientInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-xs text-slate-900 truncate m-0">
                          {clientName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate m-0">
                          {currentUser?.email || "tanishqjewels@gmail.com"}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold border border-pink-100">
                          <CheckCircle2 size={10} className="text-pink-600" /> Verified Commercial Client
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links inside Dropdown */}
                  <div className="py-2 px-2 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => { setActiveNav("PROFILE"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition text-left cursor-pointer"
                    >
                      <User size={15} />
                      <span>Brand Profile & Settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveNav("BRIEFS"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition text-left cursor-pointer"
                    >
                      <Megaphone size={15} />
                      <span>Shoot Briefs & Ad Posts</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveNav("REQUESTS"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition text-left cursor-pointer"
                    >
                      <Calendar size={15} />
                      <span>Audition Calls & Bookings ({sentRequestsList.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveNav("SHORTLISTED"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition text-left cursor-pointer"
                    >
                      <Bookmark size={15} />
                      <span>Shortlisted Talent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveNav("SEARCH_TALENT"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition text-left cursor-pointer"
                    >
                      <Search size={15} />
                      <span>Scout Model Directory</span>
                    </button>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-2 px-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Sign Out / Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Workspace Body Content */}
        <main className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
          
          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 1: DASHBOARD OVERVIEW                                  */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeNav === "DASHBOARD" && (
            <div className="space-y-8">
              
              {/* Dynamic Hero Banner with Dismissable Studio Desk Card */}
              <WorkspaceHeroBanner
                portalType="CLIENT"
                storageKey="bms_client_hero_banner"
                entityName={clientName}
                categoryOrIndustry={clientIndustry}
                primaryBtnText="+ Post Shoot Requirement"
                secondaryBtnText="View Brand Profile"
                onPrimaryAction={() => setShowPostReqModal(true)}
                onSecondaryAction={() => setActiveNav("PROFILE")}
                onOpenGuide={() => setShowGuideModal(true)}
              />

              {/* 1. Commercial Shoot Workflow Pipeline Ribbon */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    style={{ background: "linear-gradient(135deg, #ec4899 0%, #9333ea 100%)", backgroundColor: "#ec4899" }}
                    className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold shadow-xs shrink-0"
                  >
                    🎬
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 block">
                      Commercial Production Workflow
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 m-0">
                      Shoot Briefing & Casting Pipeline
                    </h4>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-start sm:justify-end text-xs">
                  <div 
                    onClick={() => setActiveNav("BRIEFS")}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 font-bold border border-pink-100 text-center cursor-pointer hover:bg-pink-100/70 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shrink-0" />
                    <span className="truncate">1. Casting Live ({totalActiveBriefs})</span>
                  </div>
                  <span className="text-slate-300 font-bold hidden sm:inline">&rarr;</span>
                  <div 
                    onClick={() => setActiveNav("REQUESTS")}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200 text-center cursor-pointer hover:bg-amber-100/70 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="truncate">2. Audition Calls ({sentRequestsList.length})</span>
                  </div>
                  <span className="text-slate-300 font-bold hidden sm:inline">&rarr;</span>
                  <div 
                    onClick={() => setActiveNav("BRIEFS")}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-100 text-center cursor-pointer hover:bg-purple-100/70 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="truncate">3. Submissions ({totalModelSubmissions})</span>
                  </div>
                  <span className="text-slate-300 font-bold hidden sm:inline">&rarr;</span>
                  <div 
                    onClick={() => setActiveNav("SHORTLISTED")}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 text-center cursor-pointer hover:bg-emerald-100/70 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">4. Call Sheet ({totalShortlisted})</span>
                  </div>
                </div>
              </div>

              {/* 2. Asymmetric Grid: Headline Campaign Spotlight (Left) + 3 Executive Metric Tiles (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* Headline Campaign Spotlight (5 cols) */}
                <div 
                  style={{
                    backgroundColor: "#0f172a",
                    backgroundImage: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #3b0764 100%)",
                    color: "#ffffff"
                  }}
                  className="lg:col-span-5 rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between border border-slate-800"
                >
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

                  <div className="space-y-3 relative z-10">
                    {briefsList.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span 
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.12)",
                              color: "#f472b6",
                              border: "1px solid rgba(255, 255, 255, 0.2)"
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-black uppercase"
                          >
                            <Sparkles size={11} /> Lead Campaign Spotlight
                          </span>
                          <span style={{ color: "#fbbf24" }} className="text-[11px] font-bold">
                            {briefsList[0]?.urgency || "URGENT SHOOT"}
                          </span>
                        </div>

                        <div>
                          <h3 style={{ color: "#ffffff" }} className="text-base sm:text-lg font-black m-0 leading-tight">
                            {briefsList[0]?.title}
                          </h3>
                          <p style={{ color: "#cbd5e1" }} className="text-xs mt-2 line-clamp-2 leading-relaxed m-0 font-normal">
                            {briefsList[0]?.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                          <span 
                            style={{ backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#f8fafc" }}
                            className="px-2.5 py-1 rounded-xl font-bold"
                          >
                            Budget: {briefsList[0]?.budget}
                          </span>
                          <span 
                            style={{ backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#f8fafc" }}
                            className="px-2.5 py-1 rounded-xl font-bold"
                          >
                            {briefsList[0]?.deadline}
                          </span>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                          <div className="text-xs">
                            <strong style={{ color: "#ffffff" }} className="font-extrabold text-sm">{briefsList[0]?.applicationsCount ?? 0}</strong> <span style={{ color: "#cbd5e1" }}>Models Applied</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveNav("BRIEFS")}
                            style={{
                              background: "linear-gradient(135deg, #ec4899 0%, #9333ea 100%)",
                              backgroundColor: "#ec4899",
                              color: "#ffffff"
                            }}
                            className="px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-md hover:opacity-95 cursor-pointer border-0"
                          >
                            <span style={{ color: "#ffffff", fontWeight: "800" }}>Review Candidates &rarr;</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col justify-between py-2">
                        <div className="space-y-3">
                          <span 
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.12)",
                              color: "#f472b6",
                              border: "1px solid rgba(255, 255, 255, 0.2)"
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-black uppercase"
                          >
                            <Sparkles size={11} /> Campaign Spotlight
                          </span>
                          <h3 style={{ color: "#ffffff" }} className="text-base sm:text-lg font-black m-0 leading-tight">
                            No Active Campaigns Posted Yet
                          </h3>
                          <p style={{ color: "#cbd5e1" }} className="text-xs mt-1 leading-relaxed m-0 font-normal">
                            Post your commercial shoot requirement or casting notice to start receiving lookbooks and proposals from verified models.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                          <span className="text-xs text-slate-400 font-medium">Ready to broadcast</span>
                          <button
                            type="button"
                            onClick={() => setShowPostReqModal(true)}
                            style={{
                              background: "linear-gradient(135deg, #ec4899 0%, #9333ea 100%)",
                              backgroundColor: "#ec4899",
                              color: "#ffffff"
                            }}
                            className="px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-md hover:opacity-95 cursor-pointer border-0"
                          >
                            <span style={{ color: "#ffffff", fontWeight: "800" }}>+ Post Shoot Requirement</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Executive Metric KPI Tiles (7 cols) */}
                <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                  <StatCard
                    icon={<FileText size={18} />}
                    title="Active Shoot Briefs"
                    value={totalActiveBriefs}
                    trend="Live campaigns"
                    trendIcon={<TrendingUp size={12} />}
                    color="pink"
                  />
                  <StatCard
                    icon={<Users size={18} />}
                    title="Model Submissions"
                    value={totalModelSubmissions}
                    trend="Lookbook inquiries"
                    trendIcon={<TrendingUp size={12} />}
                    color="purple"
                  />
                  <StatCard
                    icon={<Calendar size={18} />}
                    title="Audition Calls Sent"
                    value={sentRequestsList.length}
                    trend={`${sentRequestsList.filter(r => r.status === 'PENDING').length} awaiting reply`}
                    trendIcon={<TrendingUp size={12} />}
                    color="rose"
                  />
                  <StatCard
                    icon={<Star size={18} />}
                    title="Shortlisted Talent"
                    value={totalShortlisted}
                    trend="Bookmarked for shoots"
                    color="amber"
                  />
                </div>

              </div>

              {/* 3. Quick Lookbook Scouting Strip */}
              <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-pink-600" />
                    <h4 className="text-sm font-black text-slate-900 m-0">
                      Fast Model Scouting & Lookbook Faces
                    </h4>
                    <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium">
                      • Direct booking ready
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav("SEARCH_TALENT")}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Talent Directory</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {[
                    {
                      name: "Rhea Sharma",
                      craft: "Fashion Model",
                      rate: "₹45,000/day",
                      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                      city: "Mumbai"
                    },
                    {
                      name: "Priya Menon",
                      craft: "Bridal & Jewelry",
                      rate: "₹55,000/day",
                      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
                      city: "Bengaluru"
                    },
                    {
                      name: "Aanya Verma",
                      craft: "Commercial Face",
                      rate: "₹40,000/day",
                      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
                      city: "Delhi NCR"
                    },
                    {
                      name: "Kabir Roy",
                      craft: "Male Lead Model",
                      rate: "₹50,000/day",
                      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                      city: "Mumbai"
                    }
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveNav("SEARCH_TALENT")}
                      className="group relative rounded-2xl overflow-hidden bg-slate-100 cursor-pointer border border-slate-100 hover:shadow-md transition"
                    >
                      <div className="h-44 sm:h-48 w-full overflow-hidden">
                        <img
                          src={m.image}
                          alt={m.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                        <p className="text-xs font-black truncate m-0">{m.name}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-200 mt-0.5">
                          <span className="truncate">{m.craft}</span>
                          <span className="font-bold text-pink-300">{m.rate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. 2-Column Grid: Left (Active Briefs) + Right (Recent Submissions & Schedule) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT 2 COLUMNS: Active Shoot Briefs */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-pink-100 text-pink-700">
                        <FileText size={18} />
                      </span>
                      <div>
                        <h3 className="text-base font-black text-slate-900 m-0">
                          Active Commercial Campaigns & Shoot Briefs
                        </h3>
                        <p className="text-xs text-slate-500 m-0">
                          Commercial ad shoots, model briefs, and luxury campaigns registered in database.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveNav("BRIEFS")}
                      className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <span>View All</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 pt-1">
                    {[
                      { id: "ALL", label: `All (${briefsList.length})` },
                      { id: "ACTIVE", label: `Active (${totalActiveBriefs})` },
                      { id: "UNDER_REVIEW", label: "Shortlisting" },
                      { id: "COMPLETED", label: "Completed" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setBriefFilterTab(tab.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                          briefFilterTab === tab.id
                            ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xs"
                            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Briefs List Cards */}
                  <div className="space-y-4 pt-1">
                    {filteredBriefs.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                          <Megaphone size={24} />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 m-0">No Shoot Briefs Posted Yet</h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto m-0">
                          You haven't posted any requirements from this client account yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowPostReqModal(true)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer mt-1"
                        >
                          <Plus size={14} />
                          <span>+ Post Requirement</span>
                        </button>
                      </div>
                    ) : (
                      filteredBriefs.map((brief) => (
                      <div
                        key={brief.id}
                        className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition group flex flex-col sm:flex-row gap-5 items-start sm:items-center"
                      >
                        <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden bg-slate-900 shrink-0 relative group/media">
                          {brief.mediaType === "video" || (typeof brief.image === "string" && (brief.image.includes(".mp4") || brief.image.includes(".webm") || brief.image.startsWith("data:video/"))) ? (
                            <>
                              <video
                                src={brief.videoUrl || brief.image}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white/90 text-pink-600 flex items-center justify-center shadow-md">
                                  <Play size={13} className="ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Video size={10} className="text-pink-400" />
                                <span>VIDEO</span>
                              </span>
                            </>
                          ) : (
                            <img
                              src={brief.image}
                              alt={brief.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-black uppercase">
                              {brief.industry}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[10px] font-bold">
                              {brief.urgency}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-slate-900 m-0 leading-snug line-clamp-2">
                            {brief.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1 font-bold text-slate-700">
                              Budget: {brief.budget}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-pink-500" />
                              {brief.location}
                            </span>
                          </div>
                        </div>

                        {/* Metric Counter & Actions */}
                        <div className="flex items-center gap-3 shrink-0 sm:border-l sm:border-slate-100 sm:pl-5 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-center">
                            <span className="text-base font-black text-slate-900 block leading-tight">
                              {brief.applicationsCount}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              Models
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              title="Edit Shoot Brief"
                              onClick={() => {
                                setEditingBrief(brief);
                                setShowPostReqModal(true);
                              }}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-500 hover:text-pink-600 transition cursor-pointer"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              title="Delete Shoot Brief"
                              onClick={() => handleDeleteBrief(brief.id, brief.title)}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveNav("BRIEFS")}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-400 hover:text-pink-600 transition cursor-pointer"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )))}
                  </div>
                </div>

                {/* RIGHT COLUMN: Recent Submissions & Escrow Protection */}
                <div className="space-y-6">
                  
                  {/* Recent Model Applications Card */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-pink-600" />
                        <h4 className="text-sm font-black text-slate-900 m-0">Recent Submissions</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveNav("SEARCH_TALENT")}
                        className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View All</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {recentApplications.length === 0 ? (
                        <div className="py-6 text-center space-y-1">
                          <p className="text-xs font-semibold text-slate-500 m-0">No candidate submissions yet</p>
                          <p className="text-[11px] text-slate-400 m-0">Responses to your posted shoot briefs will show here in real-time.</p>
                        </div>
                      ) : (
                        recentApplications.slice(0, 5).map((applicant) => (
                          <div
                            key={applicant.id}
                            onClick={() => {
                              const match = briefsList.find(b => b.id === applicant.castingCallId);
                              if (match) setReviewingBrief(match);
                            }}
                            className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={applicant.applicantPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                                alt={applicant.applicantName}
                                className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
                                }}
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-slate-900 truncate m-0">
                                  {applicant.applicantName || `Candidate #${applicant.applicantId}`}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate m-0">
                                  {applicant.castingCallTitle || "Commercial Shoot Brief"}
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 shrink-0">
                              {applicant.status || "APPLIED"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Shoot Escrow & Guarantee Protection Card */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <h4 className="text-sm font-black text-slate-900 m-0">Escrow Shoot Protection</h4>
                      </div>
                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Active
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                      <span className="text-xs font-black text-slate-900 block leading-tight">
                        Milestone Escrow Guarantee
                      </span>
                      <p className="text-[11px] text-slate-600 m-0 leading-relaxed">
                        Funds are released to models only after successful call sheet wrap and lookbook delivery.
                      </p>
                    </div>
                  </div>

                  {/* Shoot Call Sheet Calendar & Dates */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-purple-600" />
                        <h4 className="text-sm font-black text-slate-900 m-0">Call Sheet & Shoot Schedule</h4>
                      </div>
                      <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                        This Week
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100/60 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            Day 1: Festive Gold Lookbook Print Shoot
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            Mumbai Studio 4 • 9:00 AM Call Time
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded-xl bg-purple-100 text-purple-800 text-[10px] font-black shrink-0">
                          In 3 Days
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100/60 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            Costume Fitting & Makeup Test
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            Lead Jewelry Models • 2:00 PM
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded-xl bg-pink-100 text-pink-800 text-[10px] font-black shrink-0">
                          Tomorrow
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 2: BRAND PROFILE VIEW / EDIT                           */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeNav === "PROFILE" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 m-0">Commercial Brand Profile & Billing</h2>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Manage your brand assets, authorized representatives, GST details, and billing preferences.
                </p>
              </div>
              <ClientProfile
                currentUser={currentUser}
                onProfileUpdate={(updated) => {
                  setCurrentUser(prev => ({
                    ...prev,
                    fullName: updated.companyName,
                    partnerCategory: updated.industry
                  }));
                }}
              />
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 3: SCOUT TALENT & MODELS                               */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeNav === "SEARCH_TALENT" && (
            <ClientTalentSearch
              shortlistedIds={shortlistedIds}
              onToggleShortlist={toggleShortlist}
              onOpenBriefModal={() => setShowPostReqModal(true)}
              onOpenRequestsTab={() => setActiveNav("REQUESTS")}
            />
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 4: BRIEFS & REQUIREMENTS MANAGEMENT                    */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeNav === "BRIEFS" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 m-0">
                    All Commercial Shoot Briefs & Campaigns
                  </h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Live advertising campaigns registered in PostgreSQL database.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPostReqModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={16} />
                  <span>Post Shoot Requirement</span>
                </button>
              </div>

              {briefsList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                    <Megaphone size={28} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 m-0">No Shoot Briefs Posted by this Account</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto m-0">
                    Only campaigns and casting calls posted by your client account will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPostReqModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5 cursor-pointer mt-2"
                  >
                    <Plus size={16} />
                    <span>+ Post First Shoot Brief</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {briefsList.map((brief) => (
                    <div key={brief.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold">
                          {brief.industry}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {brief.createdAt}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 m-0">{brief.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed m-0">{brief.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => setReviewingBrief(brief)}
                          className="font-bold text-slate-700 hover:text-pink-600 transition flex items-center gap-1 cursor-pointer"
                        >
                          Submissions: <strong className="text-pink-600 underline">{brief.applicationsCount}</strong>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReviewingBrief(brief)}
                            className="px-2.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Users size={12} />
                            <span>Applicants ({brief.applicationsCount})</span>
                          </button>
                          <button
                            type="button"
                            title="Edit Brief"
                            onClick={() => {
                              setEditingBrief(brief);
                              setShowPostReqModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            title="Delete Brief"
                            onClick={() => handleDeleteBrief(brief.id, brief.title)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveNav("SEARCH_TALENT")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Scout Models &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 5: AUDITION CALLS & BOOKING REQUESTS (LIVE STATUS)      */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeNav === "REQUESTS" && (
            <ClientBookingRequests
              onScoutModels={() => setActiveNav("SEARCH_TALENT")}
            />
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 6: SHORTLISTED TALENT                                  */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeNav === "SHORTLISTED" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 m-0">
                  Shortlisted Models ({shortlistedIds.length})
                </h2>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Models bookmarked for your upcoming festive jewelry and brand shoots.
                </p>
              </div>

              <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xs">
                <ClientTalentSearch
                  shortlistedIds={shortlistedIds}
                  onToggleShortlist={toggleShortlist}
                  onOpenBriefModal={() => setShowPostReqModal(true)}
                  onOpenRequestsTab={() => setActiveNav("REQUESTS")}
                  onlyShortlisted={true}
                />
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. POST REQUIREMENT MODAL */}
      <ClientPostRequirementModal
        isOpen={showPostReqModal}
        onClose={() => {
          setShowPostReqModal(false);
          setEditingBrief(null);
        }}
        onSubmitBrief={handleCreateBrief}
        onUpdateBrief={handleUpdateBrief}
        editBrief={editingBrief}
      />

      {/* 4. APPLICANT REVIEW MODAL */}
      <ApplicantReviewModal
        isOpen={Boolean(reviewingBrief)}
        onClose={() => setReviewingBrief(null)}
        briefId={reviewingBrief?.id}
        briefTitle={reviewingBrief?.title}
        theme="pink"
      />

      {/* 4. CLIENT STUDIO DESK GUIDE MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">👑</span>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 m-0">
                  Client Studio Desk Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
                <span className="font-black text-purple-700 text-xs block mb-1">01. Post Ad Shoots & Urgent Casting</span>
                Need models for an ad shoot in 3 days? Post an urgent brief with budget, styling, and location requirements.
              </div>
              <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100">
                <span className="font-black text-pink-700 text-xs block mb-1">02. Instant Model Scouting & Shortlisting</span>
                Search verified models by craft, physical traits, city, and lookbook reels. Add candidates to your shortlist with 1 click.
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="font-black text-emerald-700 text-xs block mb-1">03. Booking & Escrow Protection</span>
                Send formal shoot offers, sign standard NDA / usage rights, and complete payments with BookMyStars milestone protection.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
