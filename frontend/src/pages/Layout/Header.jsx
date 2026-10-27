import PagesButton from "../common/PagesButton";
import { useState, useRef, useEffect, useCallback } from "react";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, Bell, ChevronDown, Menu, LogOut, User, Settings, Shield, 
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
  respondToProfileAccessRequest 
} from "../../features/bms/api";
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
    // Replace protected route with "/" so browser Back on /signin goes directly to Home
    window.history.replaceState(null, "", "/");
    navigate("/signin");
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
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notifFilter, setNotifFilter] = useState("ALL");

  const isProfessional = (storedUser?.accountType || "").toUpperCase() === "PROFESSIONAL";

  // Fetch real notifications based on user role
  const fetchLiveNotifications = useCallback(async () => {
    try {
      if (isProfessional) {
        const sent = await getSentBookingRequests();
        setSentBookings(Array.isArray(sent) ? sent : []);
      } else {
        const [bookings, reqs] = await Promise.all([
          getIncomingBookingRequests().catch(() => []),
          getProfileAccessRequests().catch(() => [])
        ]);
        setIncomingBookings(Array.isArray(bookings) ? bookings : []);
        setAccessRequests(Array.isArray(reqs) ? reqs : []);
      }
    } catch (e) {
      console.error("Failed to load header notifications:", e);
    }
  }, [isProfessional]);

  useEffect(() => {
    fetchLiveNotifications();
    // Auto-poll every 10 seconds to detect new requests or status changes
    const interval = setInterval(fetchLiveNotifications, 10000);
    const handleUpdate = () => fetchLiveNotifications();
    window.addEventListener("booking_status_updated", handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("booking_status_updated", handleUpdate);
    };
  }, [fetchLiveNotifications]);

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

  // Unread badge count
  const unreadCount = isProfessional
    ? sentBookings.filter(b => b.status === "ACCEPTED" || b.status === "DECLINED").length
    : (incomingBookings.filter(b => b.status === "PENDING").length + accessRequests.filter(r => r.status === "PENDING").length);

  const roles = ["Actor", "Model", "Performer", "Singer", "Dancer"];

  const notifRef = useRef(null);
  const profileRef = useRef(null);

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
          <Menu size={22} style={{ color: '#334155' }} />
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

              {/* Notification Filter Bar Tabs */}
              <div className="db-notif-tabs" style={{ display: "flex", gap: "6px", padding: "8px 12px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                {!isProfessional ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setNotifFilter("ALL")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: notifFilter === "ALL" ? 700 : 500,
                        border: notifFilter === "ALL" ? "1px solid #ee008f" : "1px solid #e2e8f0",
                        background: notifFilter === "ALL" ? "#ee008f" : "#ffffff",
                        color: notifFilter === "ALL" ? "#ffffff" : "#64748b",
                        cursor: "pointer"
                      }}
                    >
                      All ({incomingBookings.length + accessRequests.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifFilter("BOOKINGS")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: notifFilter === "BOOKINGS" ? 700 : 500,
                        border: notifFilter === "BOOKINGS" ? "1px solid #ee008f" : "1px solid #e2e8f0",
                        background: notifFilter === "BOOKINGS" ? "#ee008f" : "#ffffff",
                        color: notifFilter === "BOOKINGS" ? "#ffffff" : "#64748b",
                        cursor: "pointer"
                      }}
                    >
                      🎬 Shoots ({incomingBookings.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifFilter("ACCESS")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: notifFilter === "ACCESS" ? 700 : 500,
                        border: notifFilter === "ACCESS" ? "1px solid #ee008f" : "1px solid #e2e8f0",
                        background: notifFilter === "ACCESS" ? "#ee008f" : "#ffffff",
                        color: notifFilter === "ACCESS" ? "#ffffff" : "#64748b",
                        cursor: "pointer"
                      }}
                    >
                      🔒 Access ({accessRequests.length})
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setNotifFilter("ALL")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: notifFilter === "ALL" ? 700 : 500,
                        border: notifFilter === "ALL" ? "1px solid #ee008f" : "1px solid #e2e8f0",
                        background: notifFilter === "ALL" ? "#ee008f" : "#ffffff",
                        color: notifFilter === "ALL" ? "#ffffff" : "#64748b",
                        cursor: "pointer"
                      }}
                    >
                      All ({sentBookings.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifFilter("PENDING")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: notifFilter === "PENDING" ? 700 : 500,
                        border: notifFilter === "PENDING" ? "1px solid #f59e0b" : "1px solid #e2e8f0",
                        background: notifFilter === "PENDING" ? "#f59e0b" : "#ffffff",
                        color: notifFilter === "PENDING" ? "#ffffff" : "#64748b",
                        cursor: "pointer"
                      }}
                    >
                      ⏳ Pending ({sentBookings.filter(b => b.status === "PENDING").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifFilter("ACCEPTED")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: notifFilter === "ACCEPTED" ? 700 : 500,
                        border: notifFilter === "ACCEPTED" ? "1px solid #10b981" : "1px solid #e2e8f0",
                        background: notifFilter === "ACCEPTED" ? "#10b981" : "#ffffff",
                        color: notifFilter === "ACCEPTED" ? "#ffffff" : "#64748b",
                        cursor: "pointer"
                      }}
                    >
                      ✅ Accepted ({sentBookings.filter(b => b.status === "ACCEPTED").length})
                    </button>
                  </>
                )}
              </div>

              <div className="db-notif-list-container" style={{ maxHeight: "440px", overflowY: "auto", overflowX: "hidden" }}>
                {/* 1. TALENT VIEW: Incoming Director Booking Requests */}
                {!isProfessional && (notifFilter === "ALL" || notifFilter === "BOOKINGS") && incomingBookings.map((b) => (
                  <div
                    key={`book-${b.id}`}
                    className={`db-notif-req-card ${b.status === "PENDING" ? "pending" : (b.status === "ACCEPTED" ? "accepted" : "declined")}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Film size={14} style={{ color: "#ee008f" }} />
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                          🎬 Shoot Booking Request
                        </span>
                      </div>
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>

                    <div style={{ fontSize: "11.5px", color: "#334155", lineHeight: 1.4 }}>
                      From <strong>{b.professionalName || "Casting Director"}</strong>
                      {b.professionalCompany && ` (${b.professionalCompany})`}
                    </div>

                    <div style={{
                      background: "rgba(0,0,0,0.03)",
                      padding: "8px 10px",
                      borderRadius: 8,
                      fontSize: "11px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      marginTop: 2
                    }}>
                      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "12px" }}>
                        Project: {b.projectTitle} <span style={{ fontWeight: 500, color: "#64748b" }}>({b.projectType || "Shoot"})</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, color: "#475569" }}>
                        <span>📅 Date: <strong>{b.bookingDate}</strong></span>
                        {b.offeredRate && <span>💰 Rate: <strong>₹{b.offeredRate}</strong></span>}
                        {b.location && <span>📍 Location: <strong>{b.location}</strong></span>}
                      </div>
                      {b.message && (
                        <div style={{ fontStyle: "italic", color: "#64748b", marginTop: 2 }}>
                          &ldquo;{b.message}&rdquo;
                        </div>
                      )}
                      {(b.professionalEmail || b.professionalMobile) && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: "10.5px", color: "#64748b", borderTop: "1px dashed #e2e8f0", paddingTop: 4, marginTop: 2 }}>
                          {b.professionalEmail && <span>✉️ {b.professionalEmail}</span>}
                          {b.professionalMobile && <span>📞 {b.professionalMobile}</span>}
                        </div>
                      )}
                    </div>

                    {/* Status / Action Buttons */}
                    {b.status === "PENDING" ? (
                      <div className="db-notif-actions">
                        <button
                          type="button"
                          disabled={actionLoadingId === b.id}
                          onClick={(e) => handleAcceptBooking(b.id, e)}
                          className="db-notif-btn-accept"
                        >
                          {actionLoadingId === b.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                          Accept Request
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === b.id}
                          onClick={(e) => handleRejectBooking(b.id, e)}
                          className="db-notif-btn-reject"
                        >
                          <X size={13} /> Reject
                        </button>
                      </div>
                    ) : b.status === "ACCEPTED" ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={14} /> Shoot accepted & scheduled!
                        </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNotifications(false);
                              navigate("/messages", { state: { targetChatId: `book-${b.id}`, bookingId: b.id } });
                            }}
                            className="db-notif-btn-chat"
                          >
                          <MessageSquare size={12} /> Go to Chat
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#b91c1c", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <XCircle size={13} /> You declined this shoot offer.
                      </div>
                    )}
                  </div>
                ))}

                {/* 2. TALENT VIEW: Incoming Profile View Requests */}
                {!isProfessional && (notifFilter === "ALL" || notifFilter === "ACCESS") && accessRequests.map((req) => (
                  <div
                    key={`req-${req.id}`}
                    className={`db-notif-req-card ${req.status === "PENDING" ? "pending" : (req.status === "APPROVED" ? "accepted" : "declined")}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Lock size={13} style={{ color: "#d97706" }} />
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                          🔒 Private Portfolio Access
                        </span>
                      </div>
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>

                    <div style={{ fontSize: "11.5px", color: "#334155" }}>
                      <strong>{req.requesterName}</strong> requested access to view your portfolio.
                    </div>

                    {req.status === "PENDING" ? (
                      <div className="db-notif-actions">
                        <button
                          type="button"
                          disabled={actionLoadingId === req.id}
                          onClick={(e) => handleRespondAccess(req.id, true, e)}
                          className="db-notif-btn-accept"
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === req.id}
                          onClick={(e) => handleRespondAccess(req.id, false, e)}
                          className="db-notif-btn-reject"
                        >
                          <X size={13} /> Decline
                        </button>
                      </div>
                    ) : req.status === "APPROVED" ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={13} /> Portfolio access granted
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifications(false);
                            navigate("/messages", { state: { targetChatId: `req-${req.id}`, requestId: req.id } });
                          }}
                          className="db-notif-btn-chat"
                        >
                          <MessageSquare size={12} /> Go to Chat
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#b91c1c", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <XCircle size={13} /> Request declined
                      </div>
                    )}
                  </div>
                ))}

                {/* 3. DIRECTOR VIEW: Sent Booking Requests with Live Acceptance / Rejection */}
                {isProfessional && sentBookings
                  .filter((b) => notifFilter === "ALL" || b.status === notifFilter)
                  .map((b) => (
                    <div
                      key={`sent-${b.id}`}
                      className={`db-notif-req-card ${b.status === "ACCEPTED" ? "accepted" : (b.status === "DECLINED" ? "declined" : "pending")}`}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {b.status === "ACCEPTED" ? (
                            <CheckCircle2 size={15} style={{ color: "#10b981" }} />
                          ) : b.status === "DECLINED" ? (
                            <XCircle size={15} style={{ color: "#ef4444" }} />
                          ) : (
                            <Clock size={14} style={{ color: "#f59e0b" }} />
                          )}
                          <span style={{ fontSize: "12px", fontWeight: 700, color: b.status === "ACCEPTED" ? "#15803d" : (b.status === "DECLINED" ? "#b91c1c" : "#0f172a") }}>
                            {b.status === "ACCEPTED" ? "✅ Offer Accepted!" : (b.status === "DECLINED" ? "❌ Offer Declined" : "⏳ Request Pending")}
                          </span>
                        </div>
                        <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recent"}
                        </span>
                      </div>

                      <div style={{ fontSize: "11.5px", color: "#334155", lineHeight: 1.4 }}>
                        {b.status === "ACCEPTED" ? (
                          <span>
                            <strong>{b.talentName}</strong> has <strong>ACCEPTED</strong> your shoot booking for <strong>&ldquo;{b.projectTitle}&rdquo;</strong>!
                          </span>
                        ) : b.status === "DECLINED" ? (
                          <span>
                            <strong>{b.talentName}</strong> has <strong>declined</strong> your shoot offer for <strong>&ldquo;{b.projectTitle}&rdquo;</strong>.
                          </span>
                        ) : (
                          <span>
                            Shoot request sent to <strong>{b.talentName}</strong> for <strong>&ldquo;{b.projectTitle}&rdquo;</strong> is awaiting decision.
                          </span>
                        )}
                      </div>

                      <div style={{
                        background: "rgba(0,0,0,0.03)",
                        padding: "8px 10px",
                        borderRadius: 8,
                        fontSize: "11px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        marginTop: 2
                      }}>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "12px" }}>
                          Project: {b.projectTitle} <span style={{ fontWeight: 500, color: "#64748b" }}>({b.projectType || "Shoot"})</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, color: "#475569" }}>
                          <span>📅 Date: <strong>{b.bookingDate}</strong></span>
                          {b.offeredRate && <span>💰 Rate: <strong>₹{b.offeredRate}</strong></span>}
                          {b.location && <span>📍 Location: <strong>{b.location}</strong></span>}
                        </div>
                        {b.message && (
                          <div style={{ fontStyle: "italic", color: "#64748b", marginTop: 2 }}>
                            &ldquo;{b.message}&rdquo;
                          </div>
                        )}
                        {b.talentEmail && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "10.5px", color: "#64748b", borderTop: "1px dashed #e2e8f0", paddingTop: 4, marginTop: 2 }}>
                            <span>✉️ Talent: {b.talentEmail}</span>
                          </div>
                        )}
                      </div>

                      {/* If ACCEPTED -> Action button: Go to Chat */}
                      {b.status === "ACCEPTED" && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#15803d" }}>
                            Ready to chat & coordinate details
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNotifications(false);
                              navigate("/messages", { state: { targetChatId: `book-${b.id}`, bookingId: b.id } });
                            }}
                            className="db-notif-btn-chat"
                          >
                            <MessageSquare size={12} /> Go to Chat
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {/* Empty state if no notifications match filter */}
                {((!isProfessional && 
                    ((notifFilter === "ALL" && incomingBookings.length === 0 && accessRequests.length === 0) ||
                     (notifFilter === "BOOKINGS" && incomingBookings.length === 0) ||
                     (notifFilter === "ACCESS" && accessRequests.length === 0))) ||
                  (isProfessional && 
                    ((notifFilter === "ALL" && sentBookings.length === 0) ||
                     (notifFilter !== "ALL" && sentBookings.filter(b => b.status === notifFilter).length === 0)))) && (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8" }}>
                    <Bell size={28} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>No notifications found</div>
                    <div style={{ fontSize: "11.5px", marginTop: 2 }}>
                      {isProfessional ? "Requests sent to talents will appear here." : "Booking requests and offers will appear here."}
                    </div>
                  </div>
                )}
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
              <span className="db-notif-badge">5</span>
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

