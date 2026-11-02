import PagesButton from "../common/PagesButton";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../Layout/AppLayout.jsx";
import MiniCalendar from "../Dashboard/MiniCalendar.jsx";
import "./auditions.css";
import "./auditions-mobile.css";

import RecentApplications from "./RecentApplications.jsx";
import UpcomingAuditions from "./UpcomingAuditions.jsx";
import QuickActions from "./QuickActions.jsx";
import CastingTips from "./CastingTips.jsx";
import NeedHelp from "./NeedHelp.jsx";
import {
  Star,
  Mail,
  Send,
  CalendarDays,
  CheckCircle,
  MapPin,
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Upload,
  X,
  Sparkles,
  Search,
  Check,
  ChevronDown,
  MessageSquare,
  Loader2,
  ExternalLink,
  UserCheck,
  UserX
} from "lucide-react";
import {
  getPublicCastingCalls,
  getMyCastingCalls,
  getReceivedCastingApplications,
  getIncomingBookingRequests,
  getMyCastingApplications,
  updateApplicantStatus,
  updateBookingRequestStatus,
  getFullImageUrl,
  getStoredUser
} from "../../features/bms/api";
import { showSuccess, showError, showWarning } from "../../shared/utils/alert";

export default function Auditions() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();

  // Tabs State: "auditions" (calls for me), "castings" (applicants on my posts), "my-applications" (applications I sent)
  const [activeTab, setActiveTab] = useState("auditions");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("Newest First");

  // Filter Dropdowns
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Live Database State
  const [loading, setLoading] = useState(true);
  const [publicCastings, setPublicCastings] = useState([]);
  const [myCastingCalls, setMyCastingCalls] = useState([]);
  const [receivedApplicants, setReceivedApplicants] = useState([]);
  const [auditionInvites, setAuditionInvites] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // Modals State
  const [selectedAudition, setSelectedAudition] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [uploadFileType, setUploadFileType] = useState("Video");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [updatingAction, setUpdatingAction] = useState(false);

  // Load all live database records
  const loadData = async () => {
    try {
      setLoading(true);
      const [allCastings, myPosts, receivedApps, incomingBookings, mySubmitted] = await Promise.all([
        getPublicCastingCalls().catch(() => []),
        getMyCastingCalls().catch(() => []),
        getReceivedCastingApplications().catch(() => []),
        getIncomingBookingRequests().catch(() => []),
        getMyCastingApplications().catch(() => [])
      ]);

      setPublicCastings(Array.isArray(allCastings) ? allCastings : []);
      setMyCastingCalls(Array.isArray(myPosts) ? myPosts : []);
      setReceivedApplicants(Array.isArray(receivedApps) ? receivedApps : []);
      setAuditionInvites(Array.isArray(incomingBookings) ? incomingBookings : []);
      setMyApplications(Array.isArray(mySubmitted) ? mySubmitted : []);
    } catch (err) {
      console.warn("Error loading auditions & castings hub data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleCreated = () => loadData();
    window.addEventListener("opportunity_created", handleCreated);
    window.addEventListener("opportunity_applied", handleCreated);
    return () => {
      window.removeEventListener("opportunity_created", handleCreated);
      window.removeEventListener("opportunity_applied", handleCreated);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowTypeDropdown(false);
      setShowStatusDropdown(false);
      setShowSortDropdown(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // ─── Actions for Audition Calls (Tab 1) ──────────────────────────────────
  const handleUpdateBookingStatus = async (requestId, newStatus) => {
    try {
      setUpdatingAction(true);
      await updateBookingRequestStatus(requestId, newStatus);
      showSuccess(
        newStatus === "ACCEPTED" ? "Audition Confirmed!" : "Call Declined",
        newStatus === "ACCEPTED"
          ? "You have accepted this audition call. The casting director has been notified."
          : "You have declined this audition call."
      );
      setSelectedAudition(null);
      loadData();
    } catch (err) {
      showError("Action Failed", err.message || "Could not update audition status.");
    } finally {
      setUpdatingAction(false);
    }
  };

  // ─── Actions for Applicants on My Castings (Tab 2) ────────────────────────
  const handleUpdateApplicantStatus = async (appId, newStatus) => {
    try {
      setUpdatingAction(true);
      await updateApplicantStatus(appId, newStatus);
      showSuccess(
        "Status Updated",
        `Applicant has been marked as ${newStatus}.`
      );
      setSelectedCandidate(null);
      loadData();
    } catch (err) {
      showError("Action Failed", err.message || "Could not update applicant status.");
    } finally {
      setUpdatingAction(false);
    }
  };

  // ─── Dynamic Filtering for Audition Calls (Tab 1) ─────────────────────────
  const getFilteredAuditions = () => {
    let list = [...auditionInvites];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        item =>
          (item.projectTitle || "").toLowerCase().includes(q) ||
          (item.professionalName || "").toLowerCase().includes(q) ||
          (item.professionalCompany || "").toLowerCase().includes(q) ||
          (item.location || "").toLowerCase().includes(q)
      );
    }

    if (selectedType !== "All Types") {
      list = list.filter(item => (item.projectType || "") === selectedType);
    }

    if (selectedStatus !== "All Status") {
      if (selectedStatus === "Pending / Under Review") {
        list = list.filter(item => item.status === "PENDING");
      } else if (selectedStatus === "Selected / Accepted") {
        list = list.filter(item => item.status === "ACCEPTED");
      } else if (selectedStatus === "Declined / Rejected") {
        list = list.filter(item => item.status === "DECLINED");
      }
    }

    if (sortBy === "Newest First") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === "Oldest First") {
      list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === "Deadline (Soonest)") {
      list.sort((a, b) => new Date(a.bookingDate || 0) - new Date(b.bookingDate || 0));
    }

    return list;
  };

  // ─── Dynamic Filtering for Applicants on My Posts (Tab 2) ─────────────────
  const getFilteredApplicants = () => {
    let list = [...receivedApplicants];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        item =>
          (item.applicantName || "").toLowerCase().includes(q) ||
          (item.castingCallTitle || "").toLowerCase().includes(q) ||
          (item.applicantLocation || "").toLowerCase().includes(q)
      );
    }

    if (selectedStatus !== "All Status") {
      if (selectedStatus === "Pending / Under Review") {
        list = list.filter(item => item.status === "APPLIED" || item.status === "UNDER_REVIEW");
      } else if (selectedStatus === "Shortlisted") {
        list = list.filter(item => item.status === "SHORTLISTED");
      } else if (selectedStatus === "Selected / Accepted") {
        list = list.filter(item => item.status === "SELECTED");
      } else if (selectedStatus === "Declined / Rejected") {
        list = list.filter(item => item.status === "REJECTED");
      }
    }

    if (sortBy === "Newest First") {
      list.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
    } else if (sortBy === "Oldest First") {
      list.sort((a, b) => new Date(a.appliedAt || 0) - new Date(b.appliedAt || 0));
    }

    return list;
  };

  // ─── Dynamic Filtering for My Applications (Tab 3) ────────────────────────
  const getFilteredApplications = () => {
    let list = myApplications.map(app => {
      let statusLabel = "Submitted";
      if (app.status === "UNDER_REVIEW") statusLabel = "Under Review";
      else if (app.status === "SHORTLISTED") statusLabel = "Shortlisted";
      else if (app.status === "SELECTED") statusLabel = "Selected";
      else if (app.status === "REJECTED") statusLabel = "Declined";

      const matchedPost = publicCastings.find(c => c.id === app.castingCallId) || myCastingCalls.find(c => c.id === app.castingCallId);
      const poster = matchedPost?.posterUrl 
        ? (matchedPost.posterUrl.startsWith("http") ? matchedPost.posterUrl : getFullImageUrl(matchedPost.posterUrl))
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.castingCallTitle || "Audition")}&background=f1f5f9&color=475569&bold=true`;

      return {
        id: app.id,
        project: app.castingCallTitle || "Casting Project",
        type: matchedPost?.projectType || "Audition Application",
        appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
        dateObj: new Date(app.appliedAt || Date.now()),
        status: statusLabel,
        role: app.coverNote ? (app.coverNote.length > 30 ? app.coverNote.slice(0, 30) + "..." : app.coverNote) : (matchedPost?.roleType || "Audition Submission"),
        proposedRate: app.proposedRate,
        thumbnail: poster,
        history: [
          { title: "Application Submitted to Director", date: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Submitted", done: true },
          { title: "Candidate Profile & Portfolio Inspected", date: app.status !== "APPLIED" ? "Reviewed" : "Pending", done: app.status !== "APPLIED" },
          { title: `Application Status: ${statusLabel}`, date: app.updatedAt ? new Date(app.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Ongoing", done: app.status === "SHORTLISTED" || app.status === "SELECTED" }
        ],
        raw: app
      };
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => item.project.toLowerCase().includes(q) || item.role.toLowerCase().includes(q));
    }

    if (selectedStatus !== "All Status") {
      list = list.filter(item => item.status === selectedStatus);
    }

    return list;
  };

  const filteredAuditions = getFilteredAuditions();
  const filteredApplicants = getFilteredApplicants();
  const filteredApplications = getFilteredApplications();

  // Metric Stats Calculations (100% database driven)
  const totalOpportunitiesCount = publicCastings.length;
  const auditionInvitesCount = auditionInvites.length;
  const applicationsSentCount = myApplications.length;
  const callbacksCount = receivedApplicants.filter(a => a.status === "SHORTLISTED").length + myApplications.filter(a => a.status === "SHORTLISTED").length;
  const bookingsCount = auditionInvites.filter(b => b.status === "ACCEPTED").length + receivedApplicants.filter(a => a.status === "SELECTED").length;

  // Header extras upload button (preserving original layout)
  const headerExtrasNode = (
    <PagesButton
      onClick={() => setShowUploadModal(true)}
      className="ac-header-upload-btn"
      aria-label="Upload New Audition"
    >
      <Upload size={14} />
      <span>Upload</span>
    </PagesButton>
  );

  return (
    <AppLayout
      pageTitle="Auditions & Castings"
      subTitle="Find opportunities and manage your auditions"
      searchPlaceholder="Search auditions, projects, talents..."
      headerExtras={headerExtrasNode}
    >
      <div className="ac-container">
        
        {/* Two Column Grid */}
        <div className="ac-grid">
          
          {/* Main Left Column */}
          <div className="ac-main-col">
            
            {/* Navigation Tabs & Dropdown Filters Row */}
            <div className="ac-header-row">
              <div className="ac-tabs-container">
                <PagesButton
                  onClick={() => setActiveTab("auditions")}
                  className={`ac-tab-btn ${activeTab === "auditions" ? "active" : ""}`}
                >
                  Auditions ({auditionInvites.length})
                </PagesButton>
                <PagesButton
                  onClick={() => setActiveTab("castings")}
                  className={`ac-tab-btn ${activeTab === "castings" ? "active" : ""}`}
                >
                  Castings ({receivedApplicants.length})
                </PagesButton>
                <PagesButton
                  onClick={() => setActiveTab("my-applications")}
                  className={`ac-tab-btn ${activeTab === "my-applications" ? "active" : ""}`}
                >
                  My Applications ({myApplications.length})
                </PagesButton>
              </div>

              <div className="ac-filters-container">
                {/* Project Type Filter */}
                <div className="ac-dropdown-container" onClick={(e) => e.stopPropagation()}>
                  <PagesButton
                    onClick={() => {
                      setShowTypeDropdown(!showTypeDropdown);
                      setShowStatusDropdown(false);
                      setShowSortDropdown(false);
                    }}
                    className="ac-select-db"
                  >
                    <span>{selectedType}</span>
                    <ChevronDown size={14} className="text-slate-500" />
                  </PagesButton>
                  {showTypeDropdown && (
                    <div className="ac-dropdown-menu">
                      {["All Types", "Feature Film", "Web Series", "Commercial / TVC", "Music Video", "Short Film", "Ad Film"].map((t) => (
                        <PagesButton
                          key={t}
                          onClick={() => {
                            setSelectedType(t);
                            setShowTypeDropdown(false);
                          }}
                          className={`ac-dropdown-item ${selectedType === t ? "active" : ""}`}
                        >
                          <span>{t}</span>
                          {selectedType === t && <Check size={12} className="text-pink-600" />}
                        </PagesButton>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div className="ac-dropdown-container" onClick={(e) => e.stopPropagation()}>
                  <PagesButton
                    onClick={() => {
                      setShowStatusDropdown(!showStatusDropdown);
                      setShowTypeDropdown(false);
                      setShowSortDropdown(false);
                    }}
                    className="ac-select-db"
                  >
                    <span>{selectedStatus}</span>
                    <ChevronDown size={14} className="text-slate-500" />
                  </PagesButton>
                  {showStatusDropdown && (
                    <div className="ac-dropdown-menu">
                      {["All Status", "Pending / Under Review", "Shortlisted", "Selected / Accepted", "Declined / Rejected"].map((s) => (
                        <PagesButton
                          key={s}
                          onClick={() => {
                            setSelectedStatus(s);
                            setShowStatusDropdown(false);
                          }}
                          className={`ac-dropdown-item ${selectedStatus === s ? "active" : ""}`}
                        >
                          <span>{s}</span>
                          {selectedStatus === s && <Check size={12} className="text-pink-600" />}
                        </PagesButton>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="ac-dropdown-container" onClick={(e) => e.stopPropagation()}>
                  <div className="ac-sort-wrapper">
                    <span className="ac-filter-label">Sort by:</span>
                    <PagesButton
                      onClick={() => {
                        setShowSortDropdown(!showSortDropdown);
                        setShowTypeDropdown(false);
                        setShowStatusDropdown(false);
                      }}
                      className="ac-select-db"
                    >
                      <span>{sortBy}</span>
                      <ChevronDown size={14} className="text-slate-500" />
                    </PagesButton>
                  </div>
                  {showSortDropdown && (
                    <div className="ac-dropdown-menu">
                      {["Newest First", "Oldest First", "Deadline (Soonest)"].map((sortOption) => (
                        <PagesButton
                          key={sortOption}
                          onClick={() => {
                            setSortBy(sortOption);
                            setShowSortDropdown(false);
                          }}
                          className={`ac-dropdown-item ${sortBy === sortOption ? "active" : ""}`}
                        >
                          <span>{sortOption}</span>
                          {sortBy === sortOption && <Check size={12} className="text-pink-600" />}
                        </PagesButton>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Row (Preserving Exact Original Layout & Dynamic DB Values) */}
            <div className="ac-stats-row">
              <div className="ac-stat-card">
                <div className="ac-stat-icon-wrapper pink">
                  <Star size={18} fill="currentColor" />
                </div>
                <div className="ac-stat-info">
                  <span className="ac-stat-label">Total Opportunities</span>
                  <span className="ac-stat-value">{totalOpportunitiesCount}</span>
                  <span className="ac-stat-status">Active</span>
                </div>
              </div>

              <div className="ac-stat-card">
                <div className="ac-stat-icon-wrapper purple">
                  <Mail size={18} />
                </div>
                <div className="ac-stat-info">
                  <span className="ac-stat-label">Audition Invites</span>
                  <span className="ac-stat-value">{auditionInvitesCount}</span>
                  <span className="ac-stat-status">For You</span>
                </div>
              </div>

              <div className="ac-stat-card">
                <div className="ac-stat-icon-wrapper pink">
                  <Send size={18} />
                </div>
                <div className="ac-stat-info">
                  <span className="ac-stat-label">Applications Sent</span>
                  <span className="ac-stat-value">{applicationsSentCount}</span>
                  <span className="ac-stat-status">Total sent</span>
                </div>
              </div>

              <div className="ac-stat-card">
                <div className="ac-stat-icon-wrapper purple">
                  <CalendarDays size={18} />
                </div>
                <div className="ac-stat-info">
                  <span className="ac-stat-label">Callbacks</span>
                  <span className="ac-stat-value">{callbacksCount}</span>
                  <span className="ac-stat-status">Shortlisted</span>
                </div>
              </div>

              <div className="ac-stat-card">
                <div className="ac-stat-icon-wrapper purple">
                  <CheckCircle size={18} />
                </div>
                <div className="ac-stat-info">
                  <span className="ac-stat-label">Bookings</span>
                  <span className="ac-stat-value">{bookingsCount}</span>
                  <span className="ac-stat-status">Confirmed</span>
                </div>
              </div>
            </div>
            
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB 1: AUDITIONS (Audition Calls & Direct Invites Received by Me) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === "auditions" && (
              <>
                <div className="ac-section-header">
                  <h2>Audition Invites & Calls Received ({filteredAuditions.length})</h2>
                  <PagesButton className="ac-view-all-link" onClick={() => setSelectedStatus("All Status")}>
                    View All
                  </PagesButton>
                </div>

                <div className="ac-list">
                  {filteredAuditions.length > 0 ? (
                    filteredAuditions.map((item) => (
                      <div key={item.id} className="ac-invite-item">
                        
                        <div className="ac-invite-media">
                          <img
                            src={
                              item.professionalPhotoUrl
                                ? (item.professionalPhotoUrl.startsWith("http") ? item.professionalPhotoUrl : getFullImageUrl(item.professionalPhotoUrl))
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.professionalCompany || item.professionalName || "Director")}&background=f3e8ff&color=7c3aed&bold=true`
                            }
                            alt={item.projectTitle || "Audition Project"}
                            className="ac-poster-img"
                            style={{ objectFit: "cover" }}
                          />
                          <div className="ac-invite-info">
                            <span className="ac-project-name">{item.projectTitle || "Untitled Audition Call"}</span>
                            <span className="ac-project-type">{item.projectType || "Direct Audition Call"}</span>
                          </div>
                        </div>

                        <div className="ac-invite-meta-block">
                          <span className="ac-meta-label">Role</span>
                          <span className="ac-meta-val role-name">
                            {item.offeredRate ? `₹ ${item.offeredRate}` : "Audition Invite"}
                          </span>
                          <span className="ac-meta-val role-person" style={{ color: "#7c3aed", fontWeight: "700" }}>
                            {item.professionalCompany || item.professionalName || "Casting Director"}
                          </span>
                        </div>

                        <div className="ac-invite-meta-block">
                          <span className="ac-meta-label">Audition Date</span>
                          <span className="ac-meta-val">
                            {item.bookingDate || "Date TBD"}
                          </span>
                        </div>

                        <div className="ac-invite-meta-block">
                          <span className="ac-meta-label">Location</span>
                          <span className="ac-meta-val flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            {item.location || "Location TBD"}
                          </span>
                        </div>

                        <div className="ac-action-col" style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                          {item.status && item.status !== "PENDING" && (
                            <span style={{
                              fontSize: "10.5px",
                              fontWeight: "800",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              background: item.status === "ACCEPTED" ? "#f0fdf4" : "#fef2f2",
                              color: item.status === "ACCEPTED" ? "#16a34a" : "#dc2626",
                              border: `1px solid ${item.status === "ACCEPTED" ? "#bbf7d0" : "#fecaca"}`
                            }}>
                              {item.status}
                            </span>
                          )}
                          <PagesButton
                            onClick={() => setSelectedAudition(item)}
                            className="ac-outline-btn"
                          >
                            View Details
                          </PagesButton>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-500 font-medium text-xs bg-white rounded-2xl border border-slate-200">
                      <div className="text-3xl mb-2">🎬</div>
                      <div className="font-bold text-slate-700 text-sm">No Audition Calls Received Yet</div>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        When casting directors, agencies, or producers book you for an audition, their invitation call sheets appear here.
                      </p>
                    </div>
                  )}
                </div>

                {/* Second section: Recent applications summary */}
                <div className="ac-section-header second-section">
                  <h2>Recent Applications You Sent ({filteredApplications.length})</h2>
                  <PagesButton className="ac-view-all-link" onClick={() => setActiveTab("my-applications")}>
                    View All
                  </PagesButton>
                </div>

                <RecentApplications
                  applications={filteredApplications.slice(0, 3)}
                  onViewUpdate={setSelectedApplication}
                  emptyMessage="You have not submitted any audition applications yet."
                />
              </>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB 2: CASTINGS (Applicants on My Opportunities)               */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === "castings" && (
              <>
                <div className="ac-section-header">
                  <h2>Applicants on My Opportunities ({filteredApplicants.length})</h2>
                  <PagesButton className="ac-view-all-link" onClick={() => setSelectedStatus("All Status")}>
                    View All
                  </PagesButton>
                </div>

                <div className="ac-list">
                  {filteredApplicants.length > 0 ? (
                    filteredApplicants.map((item) => {
                      const photoUrl = item.applicantPhoto
                        ? (item.applicantPhoto.startsWith("http") ? item.applicantPhoto : getFullImageUrl(item.applicantPhoto))
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.applicantName || "Talent")}&background=fdf2f8&color=be185d&bold=true`;

                      const craftLabel = item.applicantProfileTypes && item.applicantProfileTypes.length > 0
                        ? Array.from(item.applicantProfileTypes).join(", ")
                        : "Talent";

                      return (
                        <div key={item.id} className="ac-invite-item">
                          
                          {/* Candidate Media Thumbnail */}
                          <div className="ac-invite-media">
                            <img
                              src={photoUrl}
                              alt={item.applicantName || "Candidate"}
                              className="ac-poster-img"
                              style={{ objectFit: "cover", borderRadius: "10px" }}
                            />
                            <div className="ac-invite-info">
                              <span className="ac-project-name">{item.applicantName || "Anonymous Candidate"}</span>
                              <span className="ac-project-type" style={{ color: "#ee008f", fontWeight: "700" }}>
                                {craftLabel}
                              </span>
                            </div>
                          </div>

                          {/* Applied For Post */}
                          <div className="ac-invite-meta-block">
                            <span className="ac-meta-label">Applied For</span>
                            <span className="ac-meta-val role-name" style={{ color: "#0f172a" }}>
                              {item.castingCallTitle || "My Casting Call"}
                            </span>
                            <span className="ac-meta-val role-person">
                              {item.applicantLocation || "Location Not Set"}
                            </span>
                          </div>

                          {/* Applied Date */}
                          <div className="ac-invite-meta-block">
                            <span className="ac-meta-label">Applied On</span>
                            <span className="ac-meta-val">
                              {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently"}
                            </span>
                          </div>

                          {/* Proposed Rate */}
                          <div className="ac-invite-meta-block">
                            <span className="ac-meta-label">Proposed Rate</span>
                            <span className="ac-meta-val font-extrabold text-emerald-600">
                              {item.proposedRate ? `₹ ${item.proposedRate.toLocaleString("en-IN")}` : (item.applicantDayRate || "Negotiable")}
                            </span>
                          </div>

                          {/* Status & Review Button */}
                          <div className="ac-action-col" style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                            <span style={{
                              fontSize: "10.5px",
                              fontWeight: "800",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              background:
                                item.status === "SELECTED" ? "#f0fdf4" :
                                item.status === "SHORTLISTED" ? "#fefce8" :
                                item.status === "REJECTED" ? "#fef2f2" : "#f1f5f9",
                              color:
                                item.status === "SELECTED" ? "#16a34a" :
                                item.status === "SHORTLISTED" ? "#ca8a04" :
                                item.status === "REJECTED" ? "#dc2626" : "#475569",
                              border: `1px solid ${
                                item.status === "SELECTED" ? "#bbf7d0" :
                                item.status === "SHORTLISTED" ? "#fef08a" :
                                item.status === "REJECTED" ? "#fecaca" : "#cbd5e1"
                              }`
                            }}>
                              {item.status || "APPLIED"}
                            </span>

                            <PagesButton
                              onClick={() => setSelectedCandidate(item)}
                              className="ac-outline-btn"
                            >
                              Review Candidate
                            </PagesButton>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-500 font-medium text-xs bg-white rounded-2xl border border-slate-200">
                      <div className="text-3xl mb-2">👥</div>
                      <div className="font-bold text-slate-700 text-sm">No Candidate Applicants Yet</div>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        When talents apply for the opportunities you post on the Opportunities page, their candidate profiles appear here.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB 3: MY APPLICATIONS (Auditions Submitted to Others)         */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === "my-applications" && (
              <>
                <div className="ac-section-header">
                  <h2>All Applications You Submitted ({filteredApplications.length})</h2>
                  <PagesButton className="ac-view-all-link" onClick={() => setSelectedStatus("All Status")}>
                    View All
                  </PagesButton>
                </div>

                <RecentApplications
                  applications={filteredApplications}
                  onViewUpdate={setSelectedApplication}
                  emptyMessage="No audition applications match your filters."
                />
              </>
            )}

          </div>

          {/* Right Sidebar Column (Preserving Exact Original Layout) */}
          <div className="ac-sidebar-col">
            
            <UpcomingAuditions 
              items={auditionInvites}
              onViewCalendar={() => setShowCalendarModal(true)} 
              onSelectItem={(item) => setSelectedAudition(item)}
            />

            <QuickActions
              onUploadMedia={() => setShowUploadModal(true)}
              onAvailabilityCalendar={() => setShowCalendarModal(true)}
            />

            <CastingTips />

            <NeedHelp />

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MODAL 1: Audition Invite Details (Tab 1)                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {selectedAudition && (
          <div className="ac-modal-overlay" onClick={() => setSelectedAudition(null)}>
            <div className="ac-modal-content animate-fadeIn" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
              <div className="ac-modal-header" style={{ background: "linear-gradient(to right, #fdf4ff, #faf5ff)" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Audition Call: {selectedAudition.projectTitle || "Feature Film"}
                  </h3>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    From: {selectedAudition.professionalCompany || selectedAudition.professionalName || "Casting Director"}
                  </span>
                </div>
                <PagesButton
                  onClick={() => setSelectedAudition(null)}
                  className="ac-modal-close-btn"
                >
                  <X size={18} />
                </PagesButton>
              </div>

              <div className="ac-modal-body" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                
                {/* Meta details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "12px 14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", textTransform: "uppercase" }}>📅 Audition Date</span>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>{selectedAudition.bookingDate || "Open Call"}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", textTransform: "uppercase" }}>📍 Audition Studio</span>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>{selectedAudition.location || "Location not specified"}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", textTransform: "uppercase" }}>💰 Offered Budget</span>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#16a34a" }}>
                      {selectedAudition.offeredRate ? `₹ ${selectedAudition.offeredRate}` : "Standard Offer"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", textTransform: "uppercase" }}>📌 Call Status</span>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: selectedAudition.status === "ACCEPTED" ? "#16a34a" : "#ca8a04" }}>
                      {selectedAudition.status || "PENDING"}
                    </span>
                  </div>
                </div>

                {/* Audition Instructions / Note */}
                <div style={{ background: "#fdf2f8", border: "1px solid #fbcfe8", padding: "12px 14px", borderRadius: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#831843", display: "block", marginBottom: "4px" }}>
                    📜 Audition Instructions & Details:
                  </span>
                  <p style={{ fontSize: "12.5px", color: "#9d174d", margin: 0, lineHeight: 1.5 }}>
                    {selectedAudition.message || "No specific instructions provided for this audition call."}
                  </p>
                </div>

              </div>

              <div className="ac-modal-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                <PagesButton
                  onClick={() => {
                    setSelectedAudition(null);
                    navigate("/messages", {
                      state: {
                        targetUser: {
                          id: selectedAudition.professionalId,
                          name: selectedAudition.professionalName || "Casting Director",
                          role: "Casting Director",
                          avatar: selectedAudition.professionalPhotoUrl
                        },
                        opportunityTitle: selectedAudition.projectTitle
                      }
                    });
                  }}
                  className="ac-outline-btn"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <MessageSquare size={14} color="#ee008f" />
                  <span>Chat Director</span>
                </PagesButton>

                <div style={{ display: "flex", gap: "8px" }}>
                  {selectedAudition.status !== "DECLINED" && (
                    <PagesButton
                      onClick={() => handleUpdateBookingStatus(selectedAudition.id, "DECLINED")}
                      disabled={updatingAction}
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#dc2626",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      Decline
                    </PagesButton>
                  )}

                  {selectedAudition.status !== "ACCEPTED" && (
                    <PagesButton
                      onClick={() => handleUpdateBookingStatus(selectedAudition.id, "ACCEPTED")}
                      disabled={updatingAction}
                      className="ac-solid-btn"
                      style={{
                        background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
                        padding: "8px 20px",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {updatingAction ? <Loader2 size={14} className="animate-spin" /> : "✓ Confirm & Accept Call"}
                    </PagesButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MODAL 2: Candidate Applicant Review (Tab 2)                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {selectedCandidate && (
          <div className="ac-modal-overlay" onClick={() => setSelectedCandidate(null)}>
            <div className="ac-modal-content animate-fadeIn" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
              <div className="ac-modal-header" style={{ background: "linear-gradient(to right, #fdf4ff, #faf5ff)" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Candidate Review: {selectedCandidate.applicantName}
                  </h3>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    Applied for: {selectedCandidate.castingCallTitle}
                  </span>
                </div>
                <PagesButton
                  onClick={() => setSelectedCandidate(null)}
                  className="ac-modal-close-btn"
                >
                  <X size={18} />
                </PagesButton>
              </div>

              <div className="ac-modal-body" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                
                {/* Profile card summary */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <img
                    src={
                      selectedCandidate.applicantPhoto
                        ? (selectedCandidate.applicantPhoto.startsWith("http") ? selectedCandidate.applicantPhoto : getFullImageUrl(selectedCandidate.applicantPhoto))
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCandidate.applicantName || "Talent")}&background=fdf2f8&color=be185d&bold=true`
                    }
                    alt={selectedCandidate.applicantName}
                    style={{ width: "54px", height: "54px", borderRadius: "12px", objectFit: "cover", border: "2px solid #fbcfe8" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "14.5px", fontWeight: "800", color: "#0f172a" }}>{selectedCandidate.applicantName}</span>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#be185d", background: "#fdf2f8", padding: "2px 8px", borderRadius: "6px" }}>
                        {selectedCandidate.applicantProfileTypes && selectedCandidate.applicantProfileTypes.length > 0 ? Array.from(selectedCandidate.applicantProfileTypes).join(", ") : "Talent"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      Location: {selectedCandidate.applicantLocation || "Not specified"} • Proposed: <strong style={{ color: "#16a34a" }}>₹ {selectedCandidate.proposedRate ? selectedCandidate.proposedRate.toLocaleString("en-IN") : "Negotiable"}</strong>
                    </div>
                  </div>
                </div>

                {/* Cover Note */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "12px 14px", borderRadius: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#334155", display: "block", marginBottom: "4px" }}>
                    Candidate Cover Note:
                  </span>
                  <p style={{ fontSize: "12.5px", color: "#475569", margin: 0, lineHeight: 1.5 }}>
                    {selectedCandidate.coverNote || "No cover note provided with this submission."}
                  </p>
                </div>

              </div>

              <div className="ac-modal-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                <PagesButton
                  onClick={() => {
                    setSelectedCandidate(null);
                    navigate("/messages", {
                      state: {
                        targetUser: {
                          id: selectedCandidate.applicantId,
                          name: selectedCandidate.applicantName,
                          role: "Talent",
                          avatar: selectedCandidate.applicantPhoto
                        },
                        opportunityTitle: selectedCandidate.castingCallTitle
                      }
                    });
                  }}
                  className="ac-outline-btn"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <MessageSquare size={14} color="#ee008f" />
                  <span>Chat with Talent</span>
                </PagesButton>

                <div style={{ display: "flex", gap: "8px" }}>
                  <PagesButton
                    onClick={() => handleUpdateApplicantStatus(selectedCandidate.id, "REJECTED")}
                    disabled={updatingAction}
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Decline
                  </PagesButton>

                  <PagesButton
                    onClick={() => handleUpdateApplicantStatus(selectedCandidate.id, "SHORTLISTED")}
                    disabled={updatingAction}
                    style={{
                      background: "#fefce8",
                      border: "1px solid #fef08a",
                      color: "#ca8a04",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: "800",
                      cursor: "pointer"
                    }}
                  >
                    ✨ Shortlist
                  </PagesButton>

                  <PagesButton
                    onClick={() => handleUpdateApplicantStatus(selectedCandidate.id, "SELECTED")}
                    disabled={updatingAction}
                    className="ac-solid-btn"
                    style={{
                      background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
                      padding: "8px 18px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    {updatingAction ? <Loader2 size={14} className="animate-spin" /> : "✓ Select Candidate"}
                  </PagesButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MODAL 3: Application Status Update (Tab 3)                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {selectedApplication && (
          <div className="ac-modal-overlay" onClick={() => setSelectedApplication(null)}>
            <div className="ac-modal-content animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="ac-modal-header">
                <h3>Application Status: {selectedApplication.project}</h3>
                <PagesButton
                  onClick={() => setSelectedApplication(null)}
                  className="ac-modal-close-btn"
                >
                  <X size={18} />
                </PagesButton>
              </div>

              <div className="ac-modal-body" style={{ overflowY: "hidden" }}>
                <div className="flex gap-4">
                  <img
                    src={selectedApplication.thumbnail}
                    alt={selectedApplication.project}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex flex-col justify-center text-left">
                    <span className="text-sm font-bold text-slate-800">{selectedApplication.project}</span>
                    <span className="text-xs text-slate-500 font-medium">{selectedApplication.type}</span>
                    <span className="text-xs font-semibold text-slate-600 mt-0.5">Role: {selectedApplication.role}</span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="flex flex-col gap-4 mt-2 text-left">
                  <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider">Application Journey</span>
                  <div className="ac-timeline-container">
                    {selectedApplication.history.map((step, idx) => (
                      <div key={idx} className="ac-timeline-item">
                        <div className={`ac-timeline-bullet ${step.done ? "done" : ""}`}>
                          {step.done && <Check size={8} strokeWidth={4} />}
                        </div>
                        <div className="ac-timeline-content">
                          <span className={`ac-timeline-title ${step.done ? "done" : ""}`}>
                            {step.title}
                          </span>
                          <span className="ac-timeline-date">
                            {step.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ac-modal-footer">
                <PagesButton
                  onClick={() => setSelectedApplication(null)}
                  className="ac-outline-btn border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300"
                  style={{ borderColor: '#cbd5e1', color: '#475569' }}
                >
                  Close
                </PagesButton>
                <PagesButton
                  onClick={() => {
                    navigate("/messages");
                    setSelectedApplication(null);
                  }}
                  className="ac-solid-btn w-auto"
                  style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #ee008f, #7c3aed)' }}
                >
                  Message Director
                </PagesButton>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MODAL 4: Upload Audition Material                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {showUploadModal && (
          <div className="ac-modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="ac-modal-content animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="ac-modal-header">
                <h3>Upload Audition Material</h3>
                <PagesButton
                  onClick={() => setShowUploadModal(false)}
                  className="ac-modal-close-btn"
                >
                  <X size={18} />
                </PagesButton>
              </div>

              <div className="ac-modal-body">
                {uploadSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <Check size={24} strokeWidth={3} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Upload Successful!</h4>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Your file has been uploaded to your portfolio and synced with your auditions stack.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-xs font-bold text-slate-700">Material Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Video", "Photo", "Document"].map((type) => (
                          <PagesButton
                            key={type}
                            type="button"
                            onClick={() => setUploadFileType(type)}
                            className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all duration-200
                              ${uploadFileType === type
                                ? "border-pink-500 bg-pink-50/50 text-pink-600"
                                : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}
                          >
                            {type}
                          </PagesButton>
                        ))}
                      </div>
                    </div>

                    <div 
                      onClick={() => navigate("/mymedia")}
                      className="border-2 border-dashed border-slate-200 hover:border-pink-400 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 bg-slate-50/50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100">
                        <Upload size={16} />
                      </div>
                      <div className="flex flex-col text-xs text-slate-500 font-medium">
                        <span>Click to open <strong className="text-pink-600">My Media Portfolio Studio</strong></span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Manage reels, audition audios, headshots and casting tapes
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="ac-modal-footer">
                <PagesButton
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="ac-outline-btn border-slate-200 text-slate-600 hover:bg-slate-50"
                  style={{ borderColor: '#cbd5e1', color: '#475569' }}
                >
                  Close
                </PagesButton>
              </div>
            </div>
          </div>
        )}

        {/* Mini Calendar Modal */}
        <MiniCalendar 
          isOpen={showCalendarModal} 
          onClose={() => setShowCalendarModal(false)} 
          renderOnlyModal={true} 
        />

      </div>
    </AppLayout>
  );
}
