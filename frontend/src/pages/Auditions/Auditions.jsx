import PagesButton from "../common/PagesButton";
import { useState, useEffect } from "react";
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
  ChevronDown
} from "lucide-react";

export default function Auditions() {
  // Tabs State
  const [activeTab, setActiveTab] = useState("auditions");

  // Filters State
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("Newest First");

  // Filter Dropdown Toggles (Custom dropdown simulation)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Modals State
  const [selectedAudition, setSelectedAudition] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [uploadFileType, setUploadFileType] = useState("Video");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Mock data for Audition Invites
  const initialAuditions = [
    {
      id: 1,
      project: "The Last Chapter",
      type: "Feature Film",
      role: "Lead Role",
      character: "Arjun Sharma",
      deadline: "15 May 2024",
      dateObj: new Date("2024-05-15"),
      location: "Mumbai",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop&q=80",
      description: "An emotional drama detailing the final moments of a family business empire. Arjun Sharma is a complex, brooding protagonist dealing with trust issues.",
      castingDirector: "Karan Johar / Dharma Casting",
      requirements: "Prepare a 2-minute dramatic monologue. Experience in emotional acting preferred."
    },
    {
      id: 2,
      project: "City Lights",
      type: "Web Series",
      role: "Supporting Role",
      character: "Rohan Mehta",
      deadline: "18 May 2024",
      dateObj: new Date("2024-05-18"),
      location: "Mumbai",
      poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&auto=format&fit=crop&q=80",
      description: "A fast-paced crime thriller set in the underbelly of South Mumbai. Rohan Mehta is a witty hacker who aids the local detective agency.",
      castingDirector: "Mukesh Chhabra Casting Co.",
      requirements: "Slight comedic timing and standard Hindi speaking proficiency. Self-tape audition required."
    },
    {
      id: 3,
      project: "Love Stories",
      type: "Short Film",
      role: "Lead Role",
      character: "Vikram Singh",
      deadline: "20 May 2024",
      dateObj: new Date("2024-05-20"),
      location: "Delhi",
      poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&auto=format&fit=crop&q=80",
      description: "An anthology of modern romance set across different metropolitan cities in India. Vikram is an old-school romantic seeking his lost pen pal.",
      castingDirector: "Shanoo Sharma / Yash Raj Films",
      requirements: "Fluent English and Hindi. Prepare the romantic scene sides attached in the invite download."
    },
    {
      id: 4,
      project: "Corporate Tales",
      type: "Ad Film",
      role: "Supporting Role",
      character: "Aditya Verma",
      deadline: "22 May 2024",
      dateObj: new Date("2024-05-22"),
      location: "Mumbai",
      poster: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80",
      description: "A premium TV commercial campaign for a leading digital banking solution. Aditya represents a tech-savvy young manager.",
      castingDirector: "Aditya Birla Group / Red Ice Films",
      requirements: "Sharp corporate look, formal attire for the audition tape. Slate height and hand profiles."
    },
    {
      id: 5,
      project: "Dream Project",
      type: "Music Video",
      role: "Lead Role",
      character: "Karan Malhotra",
      deadline: "25 May 2024",
      dateObj: new Date("2024-05-25"),
      location: "Mumbai",
      poster: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
      description: "A high-production music video for a romantic acoustic single by a leading Bollywood playback singer.",
      castingDirector: "T-Series Casting Team",
      requirements: "Strong expression mapping and screen presence. Lip-sync test during physical audition."
    }
  ];

  // Mock data for Casting Opportunities (Castings Tab)
  const castingCalls = [
    {
      id: 101,
      project: "Historical Epic: Maurya",
      type: "Feature Film",
      role: "Lead General",
      character: "Senapati Pushyamitra",
      deadline: "30 May 2024",
      dateObj: new Date("2024-05-30"),
      location: "Mumbai",
      poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&auto=format&fit=crop&q=80",
      description: "A grand scale period drama centered on the Maurya dynasty. Senapati Pushyamitra is a battle-hardened commander who values loyalty.",
      castingDirector: "Tess Joseph Casting",
      requirements: "Requires athletic physique, basic martial arts training, and commanding voice modulation."
    },
    {
      id: 102,
      project: "The Tech Billionaire",
      type: "Web Series",
      role: "Co-Lead",
      character: "Siddharth Roy",
      deadline: "02 June 2024",
      dateObj: new Date("2024-06-02"),
      location: "Delhi",
      poster: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&auto=format&fit=crop&q=80",
      description: "A dramatic look at the boom-and-bust cycle of digital startups in India. Siddharth is a brilliant developer who makes moral compromises.",
      castingDirector: "Nandini Shrikent Casting",
      requirements: "Age range 24-30. Fluent English speaker. Experience in intense character dialogue."
    },
    {
      id: 103,
      project: "Perfume Launch Campaign",
      type: "Ad Film",
      role: "Main Model",
      character: "Groomed Lead",
      deadline: "05 June 2024",
      dateObj: new Date("2024-06-05"),
      location: "Mumbai",
      poster: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=300&auto=format&fit=crop&q=80",
      description: "A luxury lifestyle brand commercial to be shot in Europe. Needs a strong modeling portfolio.",
      castingDirector: "Elle Models Casting Department",
      requirements: "Height 5'11\" or above. Premium grooming, sleek look, self-tape walking profile."
    }
  ];

  // Mock data for Recent Applications
  const initialApplications = [
    {
      id: 1,
      project: "Urban Dreams",
      type: "Web Series",
      appliedDate: "10 May 2024",
      dateObj: new Date("2024-05-10"),
      status: "Under Review",
      role: "Lead",
      thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80",
      history: [
        { title: "Application Submitted", date: "10 May 2024", done: true },
        { title: "Profile Viewed by Mukesh Chhabra Co.", date: "12 May 2024", done: true },
        { title: "Casting Director Reviewing Audition Tape", date: "Ongoing", done: false }
      ]
    },
    {
      id: 2,
      project: "The Journey",
      type: "Feature Film",
      appliedDate: "8 May 2024",
      dateObj: new Date("2024-05-08"),
      status: "Shortlisted",
      role: "Supporting",
      thumbnail: "https://images.unsplash.com/photo-1492446845049-9c50cc313f00?w=150&auto=format&fit=crop&q=80",
      history: [
        { title: "Application Submitted", date: "8 May 2024", done: true },
        { title: "Profile and Showreel Checked", date: "9 May 2024", done: true },
        { title: "Shortlisted for Round 2 Callbacks", date: "11 May 2024", done: true }
      ]
    },
    {
      id: 3,
      project: "Digital World",
      type: "Ad Film",
      appliedDate: "5 May 2024",
      dateObj: new Date("2024-05-05"),
      status: "Submitted",
      role: "Lead",
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80",
      history: [
        { title: "Application Submitted", date: "5 May 2024", done: true },
        { title: "Pending Director Opening", date: "Pending", done: false }
      ]
    }
  ];

  // Dynamic filter application
  const filterList = (list) => {
    let result = [...list];

    // Filter by Type
    if (selectedType !== "All Types") {
      result = result.filter(item => item.type === selectedType);
    }

    // Filter by Status (For Applications)
    if (selectedStatus !== "All Status" && list[0]?.status !== undefined) {
      result = result.filter(item => item.status === selectedStatus);
    }

    // Sort
    if (sortBy === "Newest First") {
      result.sort((a, b) => b.dateObj - a.dateObj);
    } else if (sortBy === "Oldest First") {
      result.sort((a, b) => a.dateObj - b.dateObj);
    } else if (sortBy === "Deadline (Soonest)") {
      result.sort((a, b) => a.dateObj - b.dateObj);
    }

    return result;
  };

  const filteredAuditions = filterList(initialAuditions);
  const filteredCastings = filterList(castingCalls);
  const filteredApplications = filterList(initialApplications);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowTypeDropdown(false);
      setShowStatusDropdown(false);
      setShowSortDropdown(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Upload handler simulation
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
    }, 1800);
  };

  // Apply handler simulation
  const handleApplySubmit = () => {
    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setSelectedAudition(null);
    }, 1800);
  };

  // Header extras upload button custom component
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
      searchPlaceholder="Search auditions, projects..."
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
                  Auditions
                </PagesButton>
                <PagesButton
                  onClick={() => setActiveTab("castings")}
                  className={`ac-tab-btn ${activeTab === "castings" ? "active" : ""}`}
                >
                  Castings
                </PagesButton>
                <PagesButton
                  onClick={() => setActiveTab("my-applications")}
                  className={`ac-tab-btn ${activeTab === "my-applications" ? "active" : ""}`}
                >
                  My Applications
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
                      {["All Types", "Feature Film", "Web Series", "Short Film", "Ad Film", "Music Video"].map((t) => (
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

                {/* Application Status Filter */}
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
                      {["All Status", "Under Review", "Shortlisted", "Submitted"].map((s) => (
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

            {/* Stats Row */}
            <div className="ac-stats-row">
              <div className="ac-stat-card">
                <div className="ac-stat-icon-wrapper pink">
                  <Star size={18} fill="currentColor" />
                </div>
                <div className="ac-stat-info">
                  <span className="ac-stat-label">Total Opportunities</span>
                  <span className="ac-stat-value">24</span>
                  <span className="ac-stat-status">Active</span>
                </div>
              </div>

              <div className="ac-stat-card">
                <div className="ac-stat-icon-wrapper purple">
                  <Mail size={18} />
                </div>
                <div className="ac-stat-info">
                  <span className="ac-stat-label">Audition Invites</span>
                  <span className="ac-stat-value">5</span>
                  <span className="ac-stat-status">New invites</span>
                </div>
              </div>

              <div className="ac-stat-card">
                <div className="ac-stat-icon-wrapper pink">
                  <Send size={18} />
                </div>
                <div className="ac-stat-info">
                  <span className="ac-stat-label">Applications Sent</span>
                  <span className="ac-stat-value">12</span>
                  <span className="ac-stat-status">Total sent</span>
                </div>
              </div>

              <div className="ac-stat-card">
                <div className="ac-stat-icon-wrapper purple">
                  <CalendarDays size={18} />
                </div>
                <div className="ac-stat-info">
                  <span className="ac-stat-label">Callbacks</span>
                  <span className="ac-stat-value">3</span>
                  <span className="ac-stat-status">This month</span>
                </div>
              </div>

              <div className="ac-stat-card">
                <div className="ac-stat-icon-wrapper purple">
                  <CheckCircle size={18} />
                </div>
                <div className="ac-stat-info">
                  <span className="ac-stat-label">Bookings</span>
                  <span className="ac-stat-value">2</span>
                  <span className="ac-stat-status">This year</span>
                </div>
              </div>
            </div>
            
            {/* Tab: Auditions List */}
            {activeTab === "auditions" && (
              <>
                  <div className="ac-section-header">
                    <h2>Audition Invites ({filteredAuditions.length})</h2>
                    <PagesButton className="ac-view-all-link">View All</PagesButton>
                  </div>

                  <div className="ac-list">
                    {filteredAuditions.length > 0 ? (
                      filteredAuditions.map((item) => (
                        <div key={item.id} className="ac-invite-item">
                          
                          <div className="ac-invite-media">
                            <img
                              src={item.poster}
                              alt={item.project}
                              className="ac-poster-img"
                            />
                            <div className="ac-invite-info">
                              <span className="ac-project-name">{item.project}</span>
                              <span className="ac-project-type">{item.type}</span>
                            </div>
                          </div>

                          <div className="ac-invite-meta-block">
                            <span className="ac-meta-label">Role</span>
                            <span className="ac-meta-val role-name">{item.role}</span>
                            <span className="ac-meta-val role-person">{item.character}</span>
                          </div>

                          <div className="ac-invite-meta-block">
                            <span className="ac-meta-label">Deadline</span>
                            <span className="ac-meta-val">{item.deadline}</span>
                          </div>

                          <div className="ac-invite-meta-block">
                            <span className="ac-meta-label">Location</span>
                            <span className="ac-meta-val flex items-center gap-1">
                              <MapPin size={13} className="text-slate-400" />
                              {item.location}
                            </span>
                          </div>

                          <div className="ac-action-col">
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
                      <div className="py-8 text-center text-slate-500 font-medium text-xs">
                        No audition invites match your search criteria.
                      </div>
                    )}
                  </div>

                  <div className="ac-section-header second-section">
                    <h2>Recent Applications ({filteredApplications.length})</h2>
                    <PagesButton className="ac-view-all-link">View All</PagesButton>
                  </div>

                  <RecentApplications
                    applications={filteredApplications}
                    onViewUpdate={setSelectedApplication}
                    emptyMessage="No recent applications match your search criteria."
                  />
              </>
            )}

            {/* Tab: Castings List */}
            {activeTab === "castings" && (
              <>
                <div className="ac-section-header">
                  <h2>Casting Opportunities ({filteredCastings.length})</h2>
                  <PagesButton className="ac-view-all-link">View All</PagesButton>
                </div>

                <div className="ac-list">
                  {filteredCastings.length > 0 ? (
                    filteredCastings.map((item) => (
                      <div key={item.id} className="ac-invite-item">
                        
                        <div className="ac-invite-media">
                          <img
                            src={item.poster}
                            alt={item.project}
                            className="ac-poster-img"
                          />
                          <div className="ac-invite-info">
                            <span className="ac-project-name">{item.project}</span>
                            <span className="ac-project-type">{item.type}</span>
                          </div>
                        </div>

                        <div className="ac-invite-meta-block">
                          <span className="ac-meta-label">Role</span>
                          <span className="ac-meta-val role-name">{item.role}</span>
                          <span className="ac-meta-val role-person">{item.character}</span>
                        </div>

                        <div className="ac-invite-meta-block">
                          <span className="ac-meta-label">Deadline</span>
                          <span className="ac-meta-val">{item.deadline}</span>
                        </div>

                        <div className="ac-invite-meta-block">
                          <span className="ac-meta-label">Location</span>
                          <span className="ac-meta-val flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            {item.location}
                          </span>
                        </div>

                        <div className="ac-action-col">
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
                    <div className="py-8 text-center text-slate-500 font-medium text-xs">
                      No casting calls match your search criteria.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Tab: My Applications List */}
            {activeTab === "my-applications" && (
              <>
                <div className="ac-section-header">
                  <h2>All Applications ({filteredApplications.length})</h2>
                  <PagesButton className="ac-view-all-link">View All</PagesButton>
                </div>

                <RecentApplications
                  applications={filteredApplications}
                  onViewUpdate={setSelectedApplication}
                  emptyMessage="No applications match your status filters."
                />
              </>
            )}

          </div>

          {/* Right Sidebar Column */}
          <div className="ac-sidebar-col">
            
            <UpcomingAuditions onViewCalendar={() => setShowCalendarModal(true)} />

            <QuickActions
              onUploadMedia={() => setShowUploadModal(true)}
              onAvailabilityCalendar={() => setShowCalendarModal(true)}
            />

            <CastingTips />

            <NeedHelp />

          </div>
        </div>

        {/* Modal: Audition Invite Details */}
        {selectedAudition && (
          <div className="ac-modal-overlay" onClick={() => setSelectedAudition(null)}>
            <div className="ac-modal-content animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="ac-modal-header">
                <h3>Audition Details: {selectedAudition.project}</h3>
                <PagesButton
                  onClick={() => setSelectedAudition(null)}
                  className="ac-modal-close-btn"
                >
                  <X size={18} />
                </PagesButton>
              </div>

              <div className="ac-modal-body">
                {applySuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <Check size={24} strokeWidth={3} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Application Sent Successfully!</h4>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Your profile and audition credentials have been submitted to the casting agency.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <img
                        src={selectedAudition.poster}
                        alt={selectedAudition.project}
                        className="w-16 h-20 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="flex flex-col justify-center text-left">
                        <span className="text-sm font-bold text-slate-800">{selectedAudition.project}</span>
                        <span className="text-xs text-slate-500 font-medium">{selectedAudition.type}</span>
                        <span className="text-[11px] text-slate-400 mt-1">Casting Agency: {selectedAudition.castingDirector}</span>
                      </div>
                    </div>

                    <div className="ac-modal-info-grid">
                      <div className="ac-modal-info-item">
                        <span className="label">Requested Role</span>
                        <span className="value">{selectedAudition.role}</span>
                      </div>
                      <div className="ac-modal-info-item">
                        <span className="label">Character Name</span>
                        <span className="value">{selectedAudition.character}</span>
                      </div>
                      <div className="ac-modal-info-item">
                        <span className="label">Deadline</span>
                        <span className="value">{selectedAudition.deadline}</span>
                      </div>
                      <div className="ac-modal-info-item">
                        <span className="label">Location</span>
                        <span className="value">{selectedAudition.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[10.5px] color-slate-400 font-bold uppercase tracking-wider">Project Synopsis</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {selectedAudition.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[10.5px] color-slate-400 font-bold uppercase tracking-wider">Submission Requirements</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-pink-50/30 text-pink-900 border border-pink-100 p-3 rounded-lg">
                        {selectedAudition.requirements}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {!applySuccess && (
                <div className="ac-modal-footer">
                  <PagesButton
                    onClick={() => setSelectedAudition(null)}
                    className="ac-outline-btn border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300"
                    style={{ borderColor: '#cbd5e1', color: '#475569' }}
                  >
                    Cancel
                  </PagesButton>
                  <PagesButton
                    onClick={handleApplySubmit}
                    className="ac-solid-btn w-auto"
                    style={{ padding: '8px 18px' }}
                  >
                    Submit Application
                  </PagesButton>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Application Status Update */}
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
                        {/* Bullet */}
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
                    alert("Opening messaging system...");
                    setSelectedApplication(null);
                  }}
                  className="ac-solid-btn w-auto bg-purple-600 hover:bg-purple-700"
                  style={{ padding: '8px 18px', backgroundColor: '#7c3aed' }}
                >
                  Message Agency
                </PagesButton>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Upload Audition */}
        {showUploadModal && (
          <div className="ac-modal-overlay" onClick={() => setShowUploadModal(null)}>
            <div className="ac-modal-content animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="ac-modal-header">
                <h3>Upload Audition Material</h3>
                <PagesButton
                  onClick={() => setShowUploadModal(null)}
                  className="ac-modal-close-btn"
                >
                  <X size={18} />
                </PagesButton>
              </div>

              <form onSubmit={handleUploadSubmit}>
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

                      {/* Dropzone */}
                      <div className="border-2 border-dashed border-slate-200 hover:border-pink-400 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 bg-slate-50/50 transition-colors duration-200 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100">
                          <Upload size={16} />
                        </div>
                        <div className="flex flex-col text-xs text-slate-500 font-medium">
                          <span>Drag and drop your file here, or <span className="text-pink-600 underline">browse</span></span>
                          <span className="text-[10px] text-slate-400 mt-1">
                            {uploadFileType === "Video" && "MP4, MOV, AVI (Max 150MB)"}
                            {uploadFileType === "Photo" && "JPG, PNG, WEBP (Max 15MB)"}
                            {uploadFileType === "Document" && "PDF, DOCX, PPTX (Max 20MB)"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-bold text-slate-700">Link with Active Audition (Optional)</label>
                        <select className="p-2 border border-slate-200 rounded-lg text-xs font-medium bg-white outline-none">
                          <option value="">Do not link - save to General Media</option>
                          <option value="1">The Last Chapter (Lead Role)</option>
                          <option value="2">City Lights (Supporting Role)</option>
                          <option value="3">Love Stories (Lead Role)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {!uploadSuccess && (
                  <div className="ac-modal-footer">
                    <PagesButton
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="ac-outline-btn border-slate-200 text-slate-600 hover:bg-slate-50"
                      style={{ borderColor: '#cbd5e1', color: '#475569' }}
                    >
                      Cancel
                    </PagesButton>
                    <PagesButton
                      type="submit"
                      className="ac-solid-btn w-auto"
                      style={{ padding: '8px 18px' }}
                    >
                      Upload File
                    </PagesButton>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        <MiniCalendar 
          isOpen={showCalendarModal} 
          onClose={() => setShowCalendarModal(false)} 
          renderOnlyModal={true} 
        />

      </div>
    </AppLayout>
  );
}
