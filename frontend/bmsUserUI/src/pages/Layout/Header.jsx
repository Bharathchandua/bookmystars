import PagesButton from "../common/PagesButton";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, Bell, ChevronDown, ChevronRight, ChevronLeft, ArrowRight, Menu, LogOut, User, Settings, Shield, 
  Check, MessageSquare, X, Clock, Calendar, Film, CheckCircle2, XCircle, 
  Lock, IndianRupee, MapPin, Loader2, Sparkles, LayoutDashboard, ExternalLink, Camera 
} from "lucide-react";
import { 
  getStoredUser, 
  getCurrentUserProfile, 
  getFullImageUrl, 
  logoutUser,
  getIncomingBookingRequests,
  updateBookingRequestStatus,
  getSentBookingRequests,
  getProfileAccessRequests,
  respondToProfileAccessRequest,
  getMyConversations
} from "../../features/bms/api";
import { getMyCastingApplications } from "../../features/bms/api/opportunities/castingApplicationsApi";
import { showSuccess, showError } from "../../shared/utils/alert";

export default function Header({ 
  toggleSidebar, 
  sidebarOpen, 
  onOpenSidebar, 
  onCloseSidebar, 
  profileName,
  profilePhoto,
  pageTitle,
  subTitle,
  searchPlaceholder,
  headerExtras,
  showMessages,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange
}) {
  const navigate = useNavigate();
  const storedUser = getStoredUser();

  const handleLogout = () => {
    logoutUser();
    setShowProfileMenu(false);
    navigate("/");
  };
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [currentPhoto, setCurrentPhoto] = useState(
    profilePhoto ? getFullImageUrl(profilePhoto) : (localStorage.getItem("bms_profile_photo") ? getFullImageUrl(localStorage.getItem("bms_profile_photo")) : "")
  );

  useEffect(() => {
    if (profilePhoto && !profilePhoto.includes("images.unsplash.com")) {
      const resolved = getFullImageUrl(profilePhoto);
      setCurrentPhoto(resolved);
      localStorage.setItem("bms_profile_photo", resolved);
    }
  }, [profilePhoto]);

  useEffect(() => {
    const handlePhotoUpdate = () => {
      const saved = localStorage.getItem("bms_profile_photo");
      if (saved) setCurrentPhoto(getFullImageUrl(saved));
      const user = getStoredUser();
      if (user) setCurrentUser(user);
    };
    window.addEventListener("profile_photo_updated", handlePhotoUpdate);
    return () => window.removeEventListener("profile_photo_updated", handlePhotoUpdate);
  }, []);

  // Fetch real profile data on mount to ensure photo & name are always fresh
  useEffect(() => {
    async function loadUserMeta() {
      try {
        const profile = await getCurrentUserProfile();
        if (profile) {
          if (profile.profilePhoto) {
            const resolved = getFullImageUrl(profile.profilePhoto);
            setCurrentPhoto(resolved);
            localStorage.setItem("bms_profile_photo", resolved);
          } else {
            setCurrentPhoto("");
            localStorage.removeItem("bms_profile_photo");
          }
          if (profile.fullName) {
            const types = profile.profileTypes ? Array.from(profile.profileTypes) : [];
            const role = storedUser?.accountType === "PROFESSIONAL" 
              ? "Casting Director"
              : (types.length > 0 ? types[0].charAt(0) + types[0].slice(1).toLowerCase() : "Talent");
            setCurrentUser(prev => ({
              ...prev,
              fullName: profile.fullName,
              role: role
            }));
          }
        }
      } catch (err) {
        // Fallback to local stored user
      }
    }
    loadUserMeta();
  }, []);

  const displayName = profileName || currentUser?.fullName || storedUser?.fullName || "Your Name";
  const displayPhoto = currentPhoto;
  const userRole = storedUser?.accountType === "PROFESSIONAL"
    ? (currentUser?.role && currentUser.role !== "Talent" ? currentUser.role : "Casting Director")
    : (currentUser?.role || storedUser?.role || "Talent");

  const getShortName = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
    return name;
  };

  const displayShortName = getShortName(displayName);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("Actor");

  const isSearchControlled = externalSearchQuery !== undefined && externalOnSearchChange !== undefined;
  const searchQuery = isSearchControlled ? externalSearchQuery : localSearchQuery;
  const setSearchQuery = isSearchControlled ? externalOnSearchChange : setLocalSearchQuery;

  const [incomingBookings, setIncomingBookings] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [sentBookings, setSentBookings] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const isFetchingConvsRef = useRef(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notifFilter, setNotifFilter] = useState("ALL");

  const isProfessional = (storedUser?.accountType || "").toUpperCase() === "PROFESSIONAL";

  // Helper for safe relative timestamps and safe dates
  const formatNotifTime = (dateStr) => {
    if (!dateStr) return "Recent";
    if (Array.isArray(dateStr)) {
      const [y, m, d] = dateStr;
      return `${d || 1}/${m || 1}/${y || 2026}`;
    }
    if (typeof dateStr === "object") return "Recent";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return typeof dateStr === "string" ? dateStr : "Recent";
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const formatSafeDate = (d) => {
    if (!d) return "";
    if (Array.isArray(d)) return `${d[2] || d[0]}/${d[1]}/${d[0] || d[2]}`;
    if (typeof d === "object") return "";
    return String(d);
  };

  // Fetch real notifications across all sidebar domains
  const fetchLiveNotifications = useCallback(async () => {
    try {
      if (isProfessional) {
        const [sent, convs] = await Promise.all([
          getSentBookingRequests().catch(() => []),
          getMyConversations().catch(() => [])
        ]);
        setSentBookings(Array.isArray(sent) ? sent : []);
        setConversations(Array.isArray(convs) ? convs : []);
      } else {
        const [bookings, reqs, apps, convs] = await Promise.all([
          getIncomingBookingRequests().catch(() => []),
          getProfileAccessRequests().catch(() => []),
          getMyCastingApplications().catch(() => []),
          getMyConversations().catch(() => [])
        ]);
        setIncomingBookings(Array.isArray(bookings) ? bookings : []);
        setAccessRequests(Array.isArray(reqs) ? reqs : []);
        setMyApplications(Array.isArray(apps) ? apps : []);
        setConversations(Array.isArray(convs) ? convs : []);
      }
    } catch (e) {
      console.error("Failed to load header notifications:", e);
    }
  }, [isProfessional]);

  // Fetch real-time unread messages count for navbar badge
  const fetchLiveMessageCount = useCallback(async () => {
    if (document.hidden) return;
    if (isFetchingConvsRef.current) return;
    isFetchingConvsRef.current = true;
    try {
      const convs = await getMyConversations();
      if (Array.isArray(convs)) {
        const total = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadMessageCount(total);
      }
    } catch (e) {
      // ignore
    } finally {
      isFetchingConvsRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchLiveNotifications();
    fetchLiveMessageCount();

    // Auto-poll notifications every 10s and unread messages every 12s
    const interval = setInterval(() => {
      fetchLiveNotifications();
      fetchLiveMessageCount();
    }, 12000);

    const handleBookingUpdate = () => fetchLiveNotifications();
    const handleUnreadUpdate = (e) => {
      if (e?.detail !== undefined && typeof e.detail === "number") {
        setUnreadMessageCount(e.detail);
      } else {
        fetchLiveMessageCount();
      }
    };

    window.addEventListener("booking_status_updated", handleBookingUpdate);
    window.addEventListener("messages_unread_count", handleUnreadUpdate);
    window.addEventListener("messages_updated", handleUnreadUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("booking_status_updated", handleBookingUpdate);
      window.removeEventListener("messages_unread_count", handleUnreadUpdate);
      window.removeEventListener("messages_updated", handleUnreadUpdate);
    };
  }, [fetchLiveNotifications, fetchLiveMessageCount]);

  // Handle Talent Accepting Director Booking Request
  const handleAcceptBooking = async (bookingId, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoadingId(bookingId);
      await updateBookingRequestStatus(bookingId, "ACCEPTED");
      setIncomingBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: "ACCEPTED" } : b)
      );
      window.dispatchEvent(new Event("booking_status_updated"));
      showSuccess("Booking Accepted! 🎉", "The booking request has been confirmed.");
    } catch (err) {
      showError("Booking Action Failed", err.message || "Failed to accept booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Talent Rejecting Director Booking Request
  const handleRejectBooking = async (bookingId, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoadingId(bookingId);
      await updateBookingRequestStatus(bookingId, "DECLINED");
      setIncomingBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: "DECLINED" } : b)
      );
      window.dispatchEvent(new Event("booking_status_updated"));
      showSuccess("Booking Declined", "The booking request has been declined.");
    } catch (err) {
      showError("Booking Action Failed", err.message || "Failed to decline booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Talent Responding to Private Profile Access Request
  const handleRespondAccess = async (requestId, approved, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoadingId(requestId);
      await respondToProfileAccessRequest(requestId, approved);
      setAccessRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status: approved ? "APPROVED" : "REJECTED" } : r)
      );
      window.dispatchEvent(new Event("booking_status_updated"));
      showSuccess("Access Request", `Profile access has been ${approved ? "Approved" : "Declined"}.`);
    } catch (err) {
      showError("Access Action Failed", err.message || "Failed to respond to access request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Normalized notification items across all sidebar modules
  const allNotifications = useMemo(() => {
    const list = [];

    // 1. Shoots & Bookings (from Bookings tab)
    if (isProfessional) {
      (sentBookings || []).forEach((b) => {
        list.push({
          id: `sent-book-${b.id}`,
          category: "SHOOTS",
          targetPath: "/bookings",
          tabName: "Bookings",
          icon: Film,
          iconBg: "#fce7f3",
          iconColor: "#ee008f",
          title: b.talentName ? `Shoot with ${b.talentName}` : (b.projectTitle || "Shoot Booking"),
          subtitle: b.status === "ACCEPTED" 
            ? `Accepted for "${b.projectTitle || "Project"}" on ${formatSafeDate(b.bookingDate) || "Scheduled Dates"}`
            : b.status === "DECLINED"
            ? `Declined for "${b.projectTitle || "Project"}"`
            : `Awaiting response for "${b.projectTitle || "Project"}"`,
          status: b.status || "PENDING",
          statusBg: b.status === "ACCEPTED" ? "#dcfce7" : b.status === "DECLINED" ? "#fee2e2" : "#fef3c7",
          statusColor: b.status === "ACCEPTED" ? "#15803d" : b.status === "DECLINED" ? "#b91c1c" : "#b45309",
          createdAt: b.createdAt || b.bookingDate,
          isUnread: b.status === "ACCEPTED" || b.status === "PENDING"
        });
      });
    } else {
      (incomingBookings || []).forEach((b) => {
        list.push({
          id: `in-book-${b.id}`,
          rawId: b.id,
          category: "SHOOTS",
          targetPath: "/bookings",
          tabName: "Bookings",
          icon: Film,
          iconBg: "#fce7f3",
          iconColor: "#ee008f",
          title: b.professionalName || b.professionalCompany || "Casting Director",
          subtitle: `Shoot offer: "${b.projectTitle || "Project"}" • ${formatSafeDate(b.bookingDate) || "Upcoming Dates"}`,
          status: b.status || "PENDING",
          statusBg: b.status === "ACCEPTED" ? "#dcfce7" : b.status === "DECLINED" ? "#fee2e2" : "#fef3c7",
          statusColor: b.status === "ACCEPTED" ? "#15803d" : b.status === "DECLINED" ? "#b91c1c" : "#b45309",
          createdAt: b.createdAt || b.bookingDate,
          isUnread: b.status === "PENDING",
          canAction: b.status === "PENDING",
          actionType: "BOOKING"
        });
      });
    }

    // 2. Unread Messages (from Messages tab)
    (conversations || []).filter(c => (c.unreadCount || 0) > 0).forEach((c) => {
      list.push({
        id: `msg-${c.threadKey || c.conversationId}`,
        category: "MESSAGES",
        targetPath: "/messages",
        tabName: "Messages",
        icon: MessageSquare,
        iconBg: "#e0f2fe",
        iconColor: "#0284c7",
        title: c.otherUserName || "New Message",
        subtitle: c.lastMessage || `${c.unreadCount} unread message(s) in inbox`,
        status: `${c.unreadCount} new`,
        statusBg: "#e0f2fe",
        statusColor: "#0369a1",
        createdAt: c.lastMessageAt || c.updatedAt,
        isUnread: true
      });
    });

    // 3. Casting Applications / Auditions (from Auditions tab)
    (myApplications || []).forEach((a) => {
      list.push({
        id: `app-${a.id}`,
        category: "AUDITIONS",
        targetPath: "/auditions",
        tabName: "Auditions",
        icon: Sparkles,
        iconBg: "#f3e8ff",
        iconColor: "#9333ea",
        title: a.castingCallTitle || "Casting Call",
        subtitle: `Application for "${a.characterRoleName || "Role"}" is ${a.status || "In Review"}`,
        status: a.status || "APPLIED",
        statusBg: (a.status === "SHORTLISTED" || a.status === "SELECTED" || a.status === "HIRED") ? "#dcfce7" : "#f3e8ff",
        statusColor: (a.status === "SHORTLISTED" || a.status === "SELECTED" || a.status === "HIRED") ? "#15803d" : "#7e22ce",
        createdAt: a.appliedAt || a.createdAt,
        isUnread: a.status === "SHORTLISTED" || a.status === "SELECTED"
      });
    });

    // 4. Profile Access Requests (from Profile tab)
    (accessRequests || []).forEach((r) => {
      list.push({
        id: `access-${r.id}`,
        rawId: r.id,
        category: "ACCESS",
        targetPath: "/profile",
        tabName: "Profile",
        icon: Lock,
        iconBg: "#fef3c7",
        iconColor: "#d97706",
        title: r.requesterName || "Casting Agency",
        subtitle: "Requested access to view private portfolio",
        status: r.status || "PENDING",
        statusBg: r.status === "APPROVED" ? "#dcfce7" : r.status === "REJECTED" ? "#fee2e2" : "#fef3c7",
        statusColor: r.status === "APPROVED" ? "#15803d" : r.status === "REJECTED" ? "#b91c1c" : "#b45309",
        createdAt: r.requestedAt || r.createdAt,
        isUnread: r.status === "PENDING",
        canAction: r.status === "PENDING",
        actionType: "ACCESS"
      });
    });

    return list.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }, [isProfessional, sentBookings, incomingBookings, conversations, myApplications, accessRequests]);

  const filteredNotifications = useMemo(() => {
    if (notifFilter === "ALL") return allNotifications;
    return allNotifications.filter(n => n.category === notifFilter);
  }, [allNotifications, notifFilter]);

  // Unread badge count
  const unreadCount = allNotifications.filter(n => n.isUnread).length;

  const roles = ["Actor", "Model", "Performer", "Singer", "Dancer"];

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const tabsScrollRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({
        left: direction === "left" ? -120 : 120,
        behavior: "smooth"
      });
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`db-header ${pageTitle === "Profile" ? "db-header--profile" : ""} ${pageTitle === "Auditions & Castings" ? "db-header--auditions" : ""}`}>
      
      {/* Left side: Title & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <PagesButton
          onClick={toggleSidebar}
          className="db-mobile-menu-btn p-1.5 rounded-lg lg:hidden flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
          style={{ background: 'transparent', border: 'none', color: '#334155' }}
        >
          {sidebarOpen ? <X size={22} style={{ color: '#334155' }} /> : <Menu size={22} style={{ color: '#334155' }} />}
        </PagesButton>
        <div className="flex flex-col text-left">
          <h1 className="leading-tight">{pageTitle || "Dashboard"}</h1>
          {subTitle && <span className="text-[11px] text-slate-500 font-medium mt-0.5">{subTitle}</span>}
        </div>
      </div>

      {/* Right side: Search, Notifications & Profile */}
      <div className="db-header-right">
        
        {/* Search Bar */}
        <div className="db-search-wrapper">
          <input
            type="text"
            placeholder={searchPlaceholder || "Search anything..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="db-search-input"
          />
          <Search size={18} className="db-search-icon" />
        </div>

        {/* Extra actions injected by the current page (e.g. Profile: Share, Heart, Dots) */}
        {headerExtras && headerExtras}

        {/* Notifications Icon & Dropdown */}
        <div className="relative" ref={notifRef}>
          <PagesButton
            onClick={() => {
              const nextState = !showNotifications;
              setShowNotifications(nextState);
              if (nextState) {
                fetchLiveNotifications();
                // Mark notifications as viewed so the purple dashboard banner disappears
                localStorage.setItem("bms_bookings_notification_viewed", "true");
                window.dispatchEvent(new Event("bookings_notification_viewed"));
              }
            }}
            className="db-notif-btn"
            aria-label="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && <span className="db-notif-badge">{unreadCount}</span>}
          </PagesButton>

          {/* Notifications Dropdown menu */}
          {showNotifications && (
            <div className="db-dropdown-menu db-notif-menu animate-fadeIn">
              <div className="db-dropdown-header">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <h5>Notifications</h5>
                  {unreadCount > 0 && (
                    <span style={{
                      background: "#ee008f",
                      color: "#fff",
                      fontSize: "10.5px",
                      fontWeight: 800,
                      padding: "1px 7px",
                      borderRadius: 10
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <PagesButton
                  onClick={() => fetchLiveNotifications()}
                  className="db-notif-mark-read"
                  title="Refresh notifications"
                >
                  Refresh
                </PagesButton>
              </div>

              {/* Notification Filter Bar Tabs with Arrow Buttons and No Scrollbar */}
              <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", padding: "4px 6px" }}>
                <button
                  type="button"
                  onClick={() => scrollTabs("left")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#94a3b8",
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    flexShrink: 0
                  }}
                  title="Scroll categories left"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>

                <div
                  ref={tabsScrollRef}
                  className="db-notif-tabs"
                  style={{
                    display: "flex",
                    gap: "6px",
                    padding: "6px 2px",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    flex: 1
                  }}
                >
                  {[
                    { id: "ALL", label: `All (${allNotifications.length})` },
                    { id: "SHOOTS", label: `🎬 Shoots (${allNotifications.filter(n => n.category === "SHOOTS").length})` },
                    { id: "MESSAGES", label: `💬 Messages (${allNotifications.filter(n => n.category === "MESSAGES").length})` },
                    { id: "AUDITIONS", label: `✨ Auditions (${allNotifications.filter(n => n.category === "AUDITIONS").length})` },
                    { id: "ACCESS", label: `🔒 Access (${allNotifications.filter(n => n.category === "ACCESS").length})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setNotifFilter(tab.id)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: notifFilter === tab.id ? 700 : 500,
                        border: notifFilter === tab.id ? "1px solid #ee008f" : "1px solid #e2e8f0",
                        background: notifFilter === tab.id ? "#ee008f" : "#ffffff",
                        color: notifFilter === tab.id ? "#ffffff" : "#64748b",
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollTabs("right")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#94a3b8",
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    flexShrink: 0
                  }}
                  title="Scroll categories right"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Clean, Essential Notifications List without scrollbar */}
              <div
                className="db-notif-list-container"
                style={{
                  maxHeight: "420px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none"
                }}
              >
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((item) => {
                    const ItemIcon = item.icon || Bell;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(item.targetPath);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "12px 14px",
                          borderBottom: "1px solid #f1f5f9",
                          cursor: "pointer",
                          background: item.isUnread ? "#faf5ff" : "#ffffff",
                          transition: "background 0.15s ease",
                          position: "relative"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = item.isUnread ? "#faf5ff" : "#ffffff"; }}
                      >
                        {/* Icon Circle */}
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: item.iconBg || "#f1f5f9",
                            color: item.iconColor || "#ee008f",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px"
                          }}
                        >
                          <ItemIcon size={17} />
                        </div>

                        {/* Essential Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "3px" }}>
                            <span
                              style={{
                                fontSize: "12.5px",
                                fontWeight: item.isUnread ? 700 : 600,
                                color: "#0f172a",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              {String(item.title || "")}
                            </span>
                            <span style={{ fontSize: "10.5px", color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>
                              {formatNotifTime(item.createdAt)}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: "11.5px",
                              color: "#475569",
                              lineHeight: "1.35",
                              marginBottom: "6px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical"
                            }}
                          >
                            {String(item.subtitle || "")}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: "#f1f5f9",
                                  color: "#64748b"
                                }}
                              >
                                {String(item.tabName || "")}
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  padding: "2px 7px",
                                  borderRadius: "10px",
                                  background: item.statusBg,
                                  color: item.statusColor,
                                  textTransform: "capitalize"
                                }}
                              >
                                {String(item.status || "").toLowerCase()}
                              </span>
                            </div>

                            {/* Minimal Inline Action Buttons */}
                            {item.canAction && (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                                {item.actionType === "BOOKING" ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === item.rawId}
                                      onClick={(e) => handleAcceptBooking(item.rawId, e)}
                                      style={{
                                        padding: "3px 8px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        background: "#10b981",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "3px"
                                      }}
                                    >
                                      {actionLoadingId === item.rawId ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === item.rawId}
                                      onClick={(e) => handleRejectBooking(item.rawId, e)}
                                      style={{
                                        padding: "3px 8px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        background: "#ef4444",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "3px"
                                      }}
                                    >
                                      <X size={11} /> Decline
                                    </button>
                                  </>
                                ) : item.actionType === "ACCESS" ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === item.rawId}
                                      onClick={(e) => handleRespondAccess(item.rawId, true, e)}
                                      style={{
                                        padding: "3px 8px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        background: "#10b981",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "3px"
                                      }}
                                    >
                                      <Check size={11} /> Approve
                                    </button>
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === item.rawId}
                                      onClick={(e) => handleRespondAccess(item.rawId, false, e)}
                                      style={{
                                        padding: "3px 8px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        background: "#ef4444",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "3px"
                                      }}
                                    >
                                      <X size={11} /> Decline
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Arrow Button in Notification Item */}
                        <div
                          className="db-notif-arrow-btn"
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "#f1f5f9",
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            alignSelf: "center",
                            transition: "all 0.15s ease",
                            marginLeft: "4px"
                          }}
                          title={`Go to ${item.tabName}`}
                        >
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8" }}>
                    <Bell size={28} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>No notifications found</div>
                    <div style={{ fontSize: "11.5px", marginTop: 2 }}>
                      Updates across shoots, auditions, messages, and access will appear here.
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Footer Bar with Arrow Link */}
              <div
                style={{
                  padding: "10px 14px",
                  background: "#f8fafc",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                  {filteredNotifications.length} update{filteredNotifications.length !== 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    const target = notifFilter === "SHOOTS"
                      ? "/bookings"
                      : notifFilter === "MESSAGES"
                      ? "/messages"
                      : notifFilter === "AUDITIONS"
                      ? "/auditions"
                      : notifFilter === "ACCESS"
                      ? "/profile"
                      : "/bookings";
                    navigate(target);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#ee008f",
                    fontWeight: 700,
                    fontSize: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer"
                  }}
                >
                  <span>Open {notifFilter === "SHOOTS" ? "Bookings" : notifFilter === "MESSAGES" ? "Messages" : notifFilter === "AUDITIONS" ? "Auditions" : notifFilter === "ACCESS" ? "Profile" : "Bookings"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages Icon */}
        {showMessages && (
          <div className="relative">
            <Link
              to="/messages"
              className="db-notif-btn flex items-center justify-center"
              aria-label="Messages"
            >
              <MessageSquare size={22} />
              {unreadMessageCount > 0 && (
                <span className="db-notif-badge">{unreadMessageCount}</span>
              )}
            </Link>
          </div>
        )}

        {/* Vertical Separator */}
        <div className="db-header-separator h-8 w-[1px] bg-slate-200 mx-1" />

        {/* Profile Switcher Section */}
        <div className="relative" ref={profileRef}>
          <PagesButton
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="db-profile-trigger"
          >
            {/* Avatar image */}
            <div className="db-profile-avatar" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fce7f3" }}>
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={displayName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#e91e8c" }}>
                  {displayName.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            {/* User meta */}
            <div className="text-left db-header-user-info">
              <h4 className="text-[13px] font-bold text-slate-800 leading-none">
                <span className="name-full">{displayName}</span>
                <span className="name-short">{displayShortName}</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">{userRole}</span>
            </div>
            <ChevronDown size={14} className={`db-profile-chevron text-slate-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} />
          </PagesButton>

          {/* Profile Dropdown menu */}
          {showProfileMenu && (
            <div className="db-dropdown-menu db-profile-menu animate-fadeIn">
              <div 
                className="px-4 py-3 border-b border-slate-100 text-left cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/profile");
                }}
                title="Click to view & edit your full profile"
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-800 leading-none">{displayName}</h4>
                    <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">{userRole}</span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#ee008f", backgroundColor: "#fff1f8", padding: "2px 8px", borderRadius: "6px" }}>
                    Edit Profile →
                  </span>
                </div>
              </div>

              {/* Role Switcher Section */}
              <div className="px-2 py-2 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase block px-2 mb-1.5">Switch Profile Role</span>
                <div className="flex flex-col gap-0.5">
                  {roles.map((r) => (
                    <PagesButton
                      key={r}
                      onClick={() => {
                        setSelectedRole(r);
                        setShowProfileMenu(false);
                      }}
                      className={`db-role-btn ${selectedRole === r ? "active" : ""}`}
                    >
                      <span>{r}</span>
                      {selectedRole === r && <span className="w-1.5 h-1.5 bg-pink-600 rounded-full" />}
                    </PagesButton>
                  ))}
                </div>
              </div>
              
              <div className="p-1 flex flex-col gap-0.5">
                <PagesButton
                  className="db-dropdown-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile");
                  }}
                >
                  <User size={15} style={{ color: "#ee008f" }} />
                  <span style={{ fontWeight: "700", color: "#0f172a" }}>My Profile & Portfolio</span>
                </PagesButton>

                <PagesButton
                  className="db-dropdown-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/dashboard");
                  }}
                >
                  <LayoutDashboard size={15} className="text-slate-400" />
                  <span>My Dashboard</span>
                </PagesButton>

                <PagesButton
                  className="db-dropdown-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    const uid = currentUser?.userId || storedUser?.userId || storedUser?.id || 7;
                    navigate(`/public-profile/${uid}`);
                  }}
                >
                  <ExternalLink size={15} className="text-slate-400" />
                  <span>View Public Profile</span>
                </PagesButton>

                <PagesButton
                  className="db-dropdown-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/my-media");
                  }}
                >
                  <Film size={15} className="text-slate-400" />
                  <span>My Media & Audios</span>
                </PagesButton>
                
                <PagesButton
                  className="db-dropdown-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile?tab=overview");
                  }}
                >
                  <Settings size={15} className="text-slate-400" />
                  <span>Account Settings</span>
                </PagesButton>

                <PagesButton
                  className="db-dropdown-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile?tab=availability");
                  }}
                >
                  <Shield size={15} className="text-slate-400" />
                  <span>Security & Privacy</span>
                </PagesButton>

                <div className="border-t border-slate-100 my-1" />

                <PagesButton className="db-dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={15} className="text-red-500" />
                  <span>Logout</span>
                </PagesButton>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

