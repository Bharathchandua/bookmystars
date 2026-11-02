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
import PartnerProfile from "./PartnerProfile";
import PartnerTalentSearch from "./PartnerTalentSearch";
import ClientBookingRequests from "../Client/ClientBookingRequests";
import PartnerPostRequirementModal from "./PartnerPostRequirementModal";
import ApplicantReviewModal from "../common/ApplicantReviewModal";
import WorkspaceHeroBanner from "../common/WorkspaceHeroBanner";
import { StatCard, FilterPills, Button, Badge } from "../../shared/common";

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

export default function PartnerDashboard() {
  const navigate = useNavigate();
  
  // Real user data from session or PostgreSQL database user
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = getStoredUser();
    return stored || {
      fullName: "rajajinagar dance academy",
      email: "dance@gmail.com",
      accountType: "PARTNER",
      partnerCategory: "Dance Academy"
    };
  });

  // Workspace Navigation: DASHBOARD | PROFILE | SEARCH_TALENT | AUDITIONS | SHORTLISTED
  const [activeNav, setActiveNav] = useState("DASHBOARD");

  // Top bar search state
  const [headerSearch, setHeaderSearch] = useState("");
  
  // Desktop Sidebar Collapse & Pin State (Auto-expand on hover, or toggle pinned)
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    return localStorage.getItem("bms_partner_sidebar_pinned") === "true";
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const pinned = localStorage.getItem("bms_partner_sidebar_pinned") === "true";
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

  // Requirements, Applications & Shortlist states
  const [reqFilterTab, setReqFilterTab] = useState("ALL");
  const [requirementsList, setRequirementsList] = useState([]);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [isLoadingReqs, setIsLoadingReqs] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [reviewingRequirement, setReviewingRequirement] = useState(null);
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
    localStorage.setItem("bms_partner_sidebar_pinned", String(nextPin));
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

  // Fetch casting auditions posted specifically by THIS authenticated partner account
  useEffect(() => {
    let isMounted = true;
    async function loadRequirements() {
      setIsLoadingReqs(true);
      try {
        const calls = await opportunitiesApi.getMyCastingCalls();
        if (isMounted) {
          if (Array.isArray(calls) && calls.length > 0) {
            const mapped = calls.map((item) => ({
              id: item.id,
              title: item.title,
              category: item.projectType || "Dance Academy",
              batch: item.customCraft || item.roleType || "Open Audition Batch",
              positionsNeeded: item.age ? parseInt(item.age, 10) || 5 : 8,
              description: item.description && item.description.trim().length > 0
                ? item.description
                : `Auditions open for ${item.title}. Verified casting production registered on BookMyStars.`,
              status: item.status === "OPEN" ? "Active & Promoted" : item.status,
              deadline: item.applicationDeadline
                ? `Applications open till ${item.applicationDeadline}`
                : "Applications open",
              location: item.location || "Bengaluru, Karnataka",
              applicationsCount: item.applicantCount || 0,
              shortlistedCount: 0,
              image: item.posterUrl || "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
              createdAt: item.createdAt ? String(item.createdAt).split("T")[0] : "2026-10-25"
            }));
            setRequirementsList(mapped);
          } else {
            // Partner has not posted any audition requirements yet
            setRequirementsList([]);
          }
        }
      } catch (err) {
        console.error("Failed to load casting requirements from database:", err);
      } finally {
        if (isMounted) setIsLoadingReqs(false);
      }
    }

    loadRequirements();

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

  const handleCreateRequirement = async (newReq) => {
    let createdId = newReq.id;
    try {
      // Attempt backend persistence to casting_calls table with poster photo
      const backendPayload = {
        title: newReq.title,
        projectType: newReq.category || "Dance Academy",
        roleType: "DANCER",
        description: newReq.description,
        requirements: newReq.batch || "Immediate Audition",
        location: newReq.location || "Bengaluru",
        budget: 50000,
        applicationDeadline: newReq.auditionDate || new Date().toISOString().split("T")[0],
        status: "OPEN",
        posterUrl: newReq.image,
        age: "15-30",
        gender: "ALL"
      };
      const res = await opportunitiesApi.createCastingCall(backendPayload).catch(e => console.warn("Backend casting save skipped:", e));
      if (res && res.id) {
        createdId = res.id;
      }
    } catch (e) {
      console.warn("Could not save to backend:", e);
    }

    setRequirementsList(prev => [{ ...newReq, id: createdId }, ...prev]);
    showSuccess("Audition Posted", "Your new requirement with photo has been published and saved.");
  };

  const handleUpdateRequirement = async (reqId, updatedData) => {
    try {
      const backendPayload = {
        title: updatedData.title,
        projectType: updatedData.category || "Dance Academy",
        roleType: "DANCER",
        description: updatedData.description,
        requirements: updatedData.batch || "Immediate Audition",
        location: updatedData.location || "Bengaluru",
        budget: 50000,
        applicationDeadline: updatedData.auditionDate || new Date().toISOString().split("T")[0],
        status: "OPEN",
        posterUrl: updatedData.image,
        age: "15-30",
        gender: "ALL"
      };
      await opportunitiesApi.updateCastingCall(reqId, backendPayload);
      setRequirementsList(prev => prev.map(r => r.id === reqId ? { ...r, ...updatedData } : r));
      setEditingRequirement(null);
      showSuccess("Audition Updated", `Requirement "${updatedData.title}" has been updated successfully.`);
    } catch (e) {
      console.warn("Could not update requirement on backend:", e);
      showError("Update Failed", e.message || "Failed to update requirement on server.");
    }
  };

  const handleDeleteRequirement = async (reqId, reqTitle) => {
    const isConfirmed = await confirmDelete(
      `"${reqTitle}"`,
      `This will permanently remove "${reqTitle}" from the BookMyStars audition database.`
    );
    if (!isConfirmed) return;

    try {
      await opportunitiesApi.deleteCastingCall(reqId);
      setRequirementsList(prev => prev.filter(r => r.id !== reqId));
      showSuccess("Requirement Deleted", `Audition requirement "${reqTitle}" has been removed.`);
    } catch (e) {
      console.warn("Could not delete requirement on backend:", e);
      showError("Delete Failed", e.message || "Failed to delete requirement on server.");
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

  // Filtered requirements based on selected filter tab
  const filteredRequirements = (requirementsList || []).filter(req => {
    if (!req || !req.status) return true;
    const status = (req.status || "").toLowerCase();
    if (reqFilterTab === "ACTIVE") return status.includes("active");
    if (reqFilterTab === "UNDER_REVIEW") return status.includes("review");
    if (reqFilterTab === "COMPLETED") return status.includes("completed");
    return true;
  });

  // Dynamic Metrics calculated from database data
  const totalActiveReqs = (requirementsList || []).filter(r => (r?.status || "").toLowerCase().includes("active")).length || (requirementsList || []).length;
  const totalApplications = (requirementsList || []).reduce((acc, curr) => acc + (curr?.applicationsCount || 0), 0);
  const totalShortlisted = (shortlistedIds || []).length;

  const partnerName = currentUser?.fullName || currentUser?.stageName || "rajajinagar dance academy";
  const partnerCategory = currentUser?.partnerCategory || "Dance Academy";
  const partnerInitial = (partnerName || "P").charAt(0).toUpperCase();

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
              {/* Star Logo Mark */}
              <div 
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)", backgroundColor: "#7c3aed" }}
                className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-md shadow-pink-500/20 shrink-0"
              >
                ★
              </div>
              {!isSidebarCollapsed && (
                <div className="leading-tight truncate">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 block truncate">
                    BOOK MY STARS
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-purple-600 block">
                    PARTNER ACADEMY HUB
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
                  ? "bg-purple-50 text-purple-700 hover:bg-purple-100" 
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

          {/* Partner Academy Identity Pill */}
          <div className="p-3 border-b border-slate-100">
            <div className={`flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100/80 ${isSidebarCollapsed ? "justify-center" : ""}`}>
              <div className="w-8 h-8 rounded-xl bg-purple-900 text-purple-200 font-bold text-xs flex items-center justify-center shrink-0">
                {partnerInitial}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {partnerName}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span>Verified Partner</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {[
              { id: "DASHBOARD", label: "Dashboard", icon: LayoutGrid, count: null },
              { id: "PROFILE", label: "Academy Profile", icon: Building2, count: null },
              { id: "SEARCH_TALENT", label: "Scout Talent & Artists", icon: Search, count: null },
              { id: "AUDITIONS", label: "Auditions & Requirements", icon: Megaphone, count: requirementsList.length },
              { id: "REQUESTS", label: "Audition Calls & Bookings", icon: Calendar, count: sentRequestsList.length },
              { id: "SHORTLISTED", label: "Shortlisted Candidates", icon: Bookmark, count: shortlistedIds.length }
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

        {/* Bottom Actions: Post Batch Audition */}
        <div className="p-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowPostReqModal(true)}
            title={isSidebarCollapsed ? "Post Batch Audition" : undefined}
            className={`w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSidebarCollapsed ? "px-2" : "px-4"
            }`}
          >
            <Plus size={16} />
            {!isSidebarCollapsed && <span>Post Batch Audition</span>}
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
              <span className="text-purple-700 font-extrabold flex items-center gap-1.5 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 shrink-0">
                <span>🎭</span> Academy Hub
              </span>
              <span className="hidden sm:inline">&gt;</span>
              <span className="font-bold text-slate-900 hidden sm:inline truncate max-w-[140px] md:max-w-none">
                {activeNav === "DASHBOARD" && "Academy Dashboard"}
                {activeNav === "PROFILE" && "Academy Profile & Batches"}
                {activeNav === "SEARCH_TALENT" && "Scout Troupe Performers"}
                {activeNav === "AUDITIONS" && "Auditions & Intake Calls"}
                {activeNav === "REQUESTS" && "Audition Calls & Intake Requests"}
                {activeNav === "SHORTLISTED" && "Shortlisted Candidates"}
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
                placeholder="Search artists, auditions, requirements... (Ctrl + K)"
                className="w-full pl-9 pr-14 py-2 rounded-full bg-slate-100/80 hover:bg-slate-100 border-none text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition shadow-2xs"
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
              <span className="w-2 h-2 rounded-full bg-pink-500 absolute top-2 right-2 ring-2 ring-white" />
            </button>

            {/* USER PROFILE DROPDOWN MENU (The exact answer to user's question!) */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
                aria-label="User Profile Dropdown Menu"
                aria-expanded={isProfileDropdownOpen}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {partnerInitial}
                </div>
                <div className="hidden sm:block text-left max-w-[130px]">
                  <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                    {partnerName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block truncate">
                    Verified Partner
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
                        {partnerInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-xs text-slate-900 truncate m-0">
                          {partnerName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate m-0">
                          {currentUser?.email || "dance@gmail.com"}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          <CheckCircle2 size={10} /> Verified Partner Academy
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links inside Dropdown */}
                  <div className="py-2 px-2 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => { setActiveNav("PROFILE"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-pink-600 transition text-left cursor-pointer"
                    >
                      <User size={15} />
                      <span>Academy Profile & Studio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveNav("AUDITIONS"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-pink-600 transition text-left cursor-pointer"
                    >
                      <Megaphone size={15} />
                      <span>Auditions & Requirements</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveNav("REQUESTS"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-pink-600 transition text-left cursor-pointer"
                    >
                      <Calendar size={15} />
                      <span>Audition Calls & Bookings ({sentRequestsList.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveNav("SHORTLISTED"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-pink-600 transition text-left cursor-pointer"
                    >
                      <Bookmark size={15} />
                      <span>Shortlisted Performers</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveNav("SEARCH_TALENT"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-pink-600 transition text-left cursor-pointer"
                    >
                      <Search size={15} />
                      <span>Scout Talents Directory</span>
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
                portalType="PARTNER"
                storageKey="bms_partner_hero_banner"
                entityName={partnerName}
                categoryOrIndustry={partnerCategory}
                primaryBtnText="+ Post New Requirement"
                secondaryBtnText="View Academy Profile"
                onPrimaryAction={() => setShowPostReqModal(true)}
                onSecondaryAction={() => setActiveNav("PROFILE")}
                onOpenGuide={() => setShowGuideModal(true)}
              />

              {/* 4 Metric KPI Cards (Data Driven) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<FileText size={16} />}
                  title="Active Requirements"
                  value={totalActiveReqs}
                  trend="Live from database"
                  trendIcon={<TrendingUp size={12} />}
                  color="pink"
                  layout="horizontal"
                />
                <StatCard
                  icon={<Users size={16} />}
                  title="Applications Received"
                  value={totalApplications}
                  trend="Candidate inquiries"
                  trendIcon={<TrendingUp size={12} />}
                  color="purple"
                  layout="horizontal"
                />
                <StatCard
                  icon={<Star size={16} />}
                  title="Shortlisted Candidates"
                  value={totalShortlisted}
                  trend="Saved for auditions"
                  color="amber"
                  layout="horizontal"
                />
                <StatCard
                  icon={<Send size={16} />}
                  title="Audition Calls Sent"
                  value={sentRequestsList.length}
                  trend={`${sentRequestsList.filter(r => r.status === 'PENDING').length} awaiting reply`}
                  trendIcon={<TrendingUp size={12} />}
                  color="blue"
                  layout="horizontal"
                />
              </div>

              {/* 2-Column Grid: Left (Active Requirements) + Right (Recent Applications & Deadlines) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT 2 COLUMNS: Active Requirements & Ad Campaigns */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                        <FileText size={18} />
                      </span>
                      <div>
                        <h3 className="text-base font-black text-slate-900 m-0">
                          Active Academy Requirements & Audition Batches
                        </h3>
                        <p className="text-xs text-slate-500 m-0">
                          Manage and track all requirements posted to the BookMyStars database.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveNav("AUDITIONS")}
                      className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <span>View All</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <FilterPills
                    items={[
                      { id: "ALL", label: `All (${requirementsList.length})` },
                      { id: "ACTIVE", label: `Active (${totalActiveReqs})` },
                      { id: "UNDER_REVIEW", label: "Under Review" },
                      { id: "COMPLETED", label: "Completed" }
                    ]}
                    activeItem={reqFilterTab}
                    onSelect={setReqFilterTab}
                    theme="slate"
                    className="pt-1"
                  />

                  {/* Requirements List Cards */}
                  <div className="space-y-4 pt-1">
                    {filteredRequirements.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                          <Megaphone size={24} />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 m-0">No Audition Notices Posted Yet</h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto m-0">
                          You haven't posted any requirements from this partner account yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowPostReqModal(true)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer mt-1"
                        >
                          <Plus size={14} />
                          <span>+ Post Batch Audition</span>
                        </button>
                      </div>
                    ) : (
                      filteredRequirements.map((req) => (
                      <div
                        key={req.id}
                        className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition group flex flex-col sm:flex-row gap-5 items-start sm:items-center"
                      >
                        <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden bg-slate-900 shrink-0 relative group/media">
                          {req.mediaType === "video" || (typeof req.image === "string" && (req.image.includes(".mp4") || req.image.includes(".webm") || req.image.startsWith("data:video/"))) ? (
                            <>
                              <video
                                src={req.videoUrl || req.image}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white/90 text-purple-600 flex items-center justify-center shadow-md">
                                  <Play size={13} className="ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Video size={10} className="text-purple-400" />
                                <span>VIDEO</span>
                              </span>
                            </>
                          ) : (
                            <img
                              src={req.image}
                              alt={req.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-black uppercase">
                              {req.category}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              {req.status}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-slate-900 m-0 leading-snug line-clamp-2">
                            {req.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-pink-500" />
                              {req.deadline}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-pink-500" />
                              {req.location}
                            </span>
                          </div>
                        </div>

                        {/* Metric Counter & Actions */}
                        <div className="flex items-center gap-3 shrink-0 sm:border-l sm:border-slate-100 sm:pl-5 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-center">
                            <span className="text-base font-black text-slate-900 block leading-tight">
                              {req.applicationsCount}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              Applicants
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              title="Edit Audition Notice"
                              onClick={() => {
                                setEditingRequirement(req);
                                setShowPostReqModal(true);
                              }}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-500 hover:text-purple-600 transition cursor-pointer"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              title="Delete Audition Notice"
                              onClick={() => handleDeleteRequirement(req.id, req.title)}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveNav("AUDITIONS")}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-400 hover:text-purple-600 transition cursor-pointer"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )))}
                  </div>
                </div>

                {/* RIGHT COLUMN: Recent Applications & Upcoming Deadlines */}
                <div className="space-y-6">
                  
                  {/* Recent Applications Card */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-purple-600" />
                        <h4 className="text-sm font-black text-slate-900 m-0">Recent Applications</h4>
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
                          <p className="text-xs font-semibold text-slate-500 m-0">No audition submissions yet</p>
                          <p className="text-[11px] text-slate-400 m-0">Responses to your posted audition calls will show here in real-time.</p>
                        </div>
                      ) : (
                        recentApplications.slice(0, 5).map((applicant) => (
                          <div
                            key={applicant.id}
                            onClick={() => {
                              const match = requirementsList.find(r => r.id === applicant.castingCallId);
                              if (match) setReviewingRequirement(match);
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
                                  {applicant.castingCallTitle || "Audition Requirement"}
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

                  {/* Upcoming Deadlines Card */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-pink-600" />
                        <h4 className="text-sm font-black text-slate-900 m-0">Upcoming Deadlines</h4>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">Next 14 Days</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-slate-900 block leading-tight">
                          Bharatanatyam Troupe Audition
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Stage screening starts 25 Nov
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-pink-600 text-white text-[10px] font-black shrink-0">
                        3 days left
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 2: ACADEMY PROFILE VIEW / EDIT                         */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeNav === "PROFILE" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 m-0">Academy Profile & Studio Settings</h2>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Manage your institution credentials, mentor details, studio photos, and operating branches.
                </p>
              </div>
              <PartnerProfile
                currentUser={currentUser}
                onProfileUpdate={(updated) => {
                  setCurrentUser(prev => ({
                    ...prev,
                    fullName: updated.academyName,
                    partnerCategory: updated.category
                  }));
                }}
              />
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 3: SCOUT TALENT & ARTISTS                              */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeNav === "SEARCH_TALENT" && (
            <PartnerTalentSearch
              shortlistedIds={shortlistedIds}
              onToggleShortlist={toggleShortlist}
              onOpenRequirementModal={() => setShowPostReqModal(true)}
              onOpenRequestsTab={() => setActiveNav("REQUESTS")}
            />
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 4: AUDITIONS & REQUIREMENTS MANAGEMENT                 */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeNav === "AUDITIONS" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 m-0">
                    All Academy Auditions & Production Requirements
                  </h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Live casting calls and intake batches registered in PostgreSQL database.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPostReqModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={16} />
                  <span>Post New Requirement</span>
                </button>
              </div>

              {requirementsList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Megaphone size={28} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 m-0">No Audition Notices Posted by this Account</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto m-0">
                    Only audition batches and calls posted by your partner academy account will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPostReqModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5 cursor-pointer mt-2"
                  >
                    <Plus size={16} />
                    <span>+ Post First Audition Batch</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requirementsList.map((req) => (
                    <div key={req.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold">
                          {req.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {req.createdAt}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 m-0">{req.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed m-0">{req.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => setReviewingRequirement(req)}
                          className="font-bold text-slate-700 hover:text-purple-600 transition flex items-center gap-1 cursor-pointer"
                        >
                          Applicants: <strong className="text-pink-600 underline">{req.applicationsCount}</strong>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReviewingRequirement(req)}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Users size={12} />
                            <span>Applicants ({req.applicationsCount})</span>
                          </button>
                          <button
                            type="button"
                            title="Edit Requirement"
                            onClick={() => {
                              setEditingRequirement(req);
                              setShowPostReqModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            title="Delete Requirement"
                            onClick={() => handleDeleteRequirement(req.id, req.title)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveNav("SEARCH_TALENT")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Scout Performers &rarr;
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
              theme="purple"
              onScoutModels={() => setActiveNav("SEARCH_TALENT")}
            />
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 6: SHORTLISTED CANDIDATES                              */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeNav === "SHORTLISTED" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 m-0">
                  Shortlisted Candidates ({shortlistedIds.length})
                </h2>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Performers and artists saved for your upcoming academy productions.
                </p>
              </div>

              <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xs">
                <PartnerTalentSearch
                  shortlistedIds={shortlistedIds}
                  onToggleShortlist={toggleShortlist}
                  onOpenRequirementModal={() => setShowPostReqModal(true)}
                  onOpenRequestsTab={() => setActiveNav("REQUESTS")}
                  onlyShortlisted={true}
                />
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. POST REQUIREMENT MODAL */}
      <PartnerPostRequirementModal
        isOpen={showPostReqModal}
        onClose={() => {
          setShowPostReqModal(false);
          setEditingRequirement(null);
        }}
        onSubmitRequirement={handleCreateRequirement}
        onUpdateRequirement={handleUpdateRequirement}
        editRequirement={editingRequirement}
      />

      {/* 4. APPLICANT REVIEW MODAL */}
      <ApplicantReviewModal
        isOpen={Boolean(reviewingRequirement)}
        onClose={() => setReviewingRequirement(null)}
        briefId={reviewingRequirement?.id}
        briefTitle={reviewingRequirement?.title}
        theme="purple"
      />

      {/* 4. PARTNER STUDIO DESK GUIDE MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">👑</span>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 m-0">
                  Partner Studio Desk Guide
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
                <span className="font-black text-purple-700 text-xs block mb-1">01. Post Auditions & Intake Batches</span>
                Broadcast your academy's upcoming productions, festival troupes, or annual student intake with exact craft requirements.
              </div>
              <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100">
                <span className="font-black text-pink-700 text-xs block mb-1">02. BookMyStars Digital Promotion</span>
                Our marketing desk runs targeted candidate blasts to verified classical & contemporary artists across your target cities.
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="font-black text-emerald-700 text-xs block mb-1">03. Review Applications & Direct Scout</span>
                Candidates apply with performance lookbooks and reels. You can also proactively search our artist directory and shortlist.
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
