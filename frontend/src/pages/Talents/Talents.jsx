import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppLayout from "../Layout/AppLayout.jsx";
import MiniCalendar from "../Dashboard/MiniCalendar.jsx";
import BookingRequestModal from "../Professional/BookingRequestModal.jsx";
import TalentWorkModal from "../Professional/TalentWorkModal.jsx";
import PagesButton from "../common/PagesButton";
import {
  Search,
  MapPin,
  Briefcase,
  Calendar,
  Lock,
  Globe,
  Film,
  Users,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  MessageSquare,
  ArrowRight,
  Headphones,
  Check,
  Star,
  RefreshCw,
  Loader2,
  List,
  LayoutGrid
} from "lucide-react";
import { getTalentsDirectory } from "../../features/bms/api/talents/talentsApi";
import { getPublicLanguages } from "../../features/bms/api/languages/languagesApi";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";
import { getStoredUser } from "../../features/bms/api/auth/authApi";
import { showSuccess, showError } from "../../shared/utils/alert";
import "./talents.css";

const CRAFT_TABS = [
  { id: "ALL", label: "All Crafts", value: null, icon: "✨" },
  { id: "ACTOR", label: "Actors", value: "ACTOR", icon: "🎭" },
  { id: "MODEL", label: "Models", value: "MODEL", icon: "💃" },
  { id: "DIRECTOR", label: "Directors", value: "DIRECTOR", icon: "🎬" },
  { id: "PRODUCER", label: "Producers & Studios", value: "PRODUCER", icon: "💼" },
  { id: "CASTING", label: "Casting Directors", value: "CASTING", icon: "📢" },
  { id: "CINEMATOGRAPHER", label: "Cinematographers (DOP)", value: "CINEMATOGRAPHER", icon: "🎥" },
  { id: "WRITER", label: "Screenwriters", value: "WRITER", icon: "✍️" },
  { id: "EDITOR", label: "Editors & Post", value: "EDITOR", icon: "✂️" },
  { id: "DANCER", label: "Dancers", value: "DANCER", icon: "🕺" },
  { id: "SINGER", label: "Singers & Music", value: "SINGER", icon: "🎤" },
  { id: "OTHER", label: "Other Crafts", value: "OTHER", icon: "🌟" }
];

const parseCraftParam = (craft) => {
  if (!craft) return null;
  const upper = craft.toUpperCase();
  if (upper.includes("ACTOR")) return "ACTOR";
  if (upper.includes("MODEL")) return "MODEL";
  if (upper.includes("DIRECT")) return "DIRECTOR";
  if (upper.includes("PRODUC") || upper.includes("STUDIO")) return "PRODUCER";
  if (upper.includes("CAST")) return "CASTING";
  if (upper.includes("WRITER") || upper.includes("SCRIPT")) return "WRITER";
  if (upper.includes("CINEMA") || upper.includes("DOP") || upper.includes("CAMERA")) return "CINEMATOGRAPHER";
  if (upper.includes("EDIT")) return "EDITOR";
  if (upper.includes("DANCE")) return "DANCER";
  if (upper.includes("SING") || upper.includes("MUSIC")) return "SINGER";
  return upper;
};

export default function Talents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const storedUser = getStoredUser();

  // Craft filter from URL or state
  const craftParam = searchParams.get("craft");
  const [selectedCraft, setSelectedCraft] = useState(() => parseCraftParam(craftParam));

  // Secondary filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedExp, setSelectedExp] = useState("Any Experience");
  const [selectedAvailability, setSelectedAvailability] = useState("All Availability");
  const [sortBy, setSortBy] = useState("Newest First");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  // Database state
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [bookingTalent, setBookingTalent] = useState(null);
  const [workModalTalent, setWorkModalTalent] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Sync craft from URL search param
  useEffect(() => {
    setSelectedCraft(parseCraftParam(craftParam));
  }, [craftParam]);

  // Load database talents
  const loadTalents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTalentsDirectory({
        type: selectedCraft,
        query: searchQuery
      });
      setTalents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Error fetching talents directory:", err);
      setTalents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCraft, searchQuery]);

  useEffect(() => {
    loadTalents();
    getPublicLanguages()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableLanguages(data);
        }
      })
      .catch(() => {});
  }, [loadTalents]);

  // Handle switching craft tab
  const handleSelectCraftTab = (craftValue) => {
    setSelectedCraft(craftValue);
    if (craftValue) {
      setSearchParams({ craft: craftValue.toLowerCase() });
    } else {
      setSearchParams({});
    }
  };

  // Filter & sort talents locally for instant responsive experience
  const filteredTalents = useMemo(() => {
    let list = [...talents];

    // City filter
    if (selectedCity !== "All Cities") {
      list = list.filter((t) =>
        (t.location || "").toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Language filter (checks acting languages and spoken languages)
    if (selectedLanguage !== "All Languages") {
      const q = selectedLanguage.toLowerCase().trim();
      list = list.filter((t) =>
        (t.actingLanguages || "").toLowerCase().includes(q) ||
        (t.languages || "").toLowerCase().includes(q)
      );
    }

    // Experience filter
    if (selectedExp !== "Any Experience") {
      if (selectedExp === "1-3 yrs") {
        list = list.filter((t) => (t.yearsExperience || 0) >= 1 && (t.yearsExperience || 0) <= 3);
      } else if (selectedExp === "3-5 yrs") {
        list = list.filter((t) => (t.yearsExperience || 0) >= 3 && (t.yearsExperience || 0) <= 5);
      } else if (selectedExp === "5+ yrs") {
        list = list.filter((t) => (t.yearsExperience || 0) >= 5);
      }
    }

    // Availability filter
    if (selectedAvailability !== "All Availability") {
      if (selectedAvailability === "Available for Shoot") {
        list = list.filter((t) => !t.isPrivate);
      } else if (selectedAvailability === "Verified Talents") {
        list = list.filter((t) => t.fullName && t.email);
      }
    }

    // Sorting
    if (sortBy === "Experience: High to Low") {
      list.sort((a, b) => (b.yearsExperience || 0) - (a.yearsExperience || 0));
    } else if (sortBy === "Name: A-Z") {
      list.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
    } else {
      // Newest first by userId descending
      list.sort((a, b) => (b.userId || 0) - (a.userId || 0));
    }

    return list;
  }, [talents, selectedCity, selectedLanguage, selectedExp, selectedAvailability, sortBy]);

  // Stats calculation
  const totalTalentsCount = talents.length;
  const actorsModelsCount = talents.filter((t) =>
    (t.profileTypes && (t.profileTypes.includes("ACTOR") || t.profileTypes.includes("MODEL"))) ||
    (t.customProfession && (t.customProfession.toLowerCase().includes("actor") || t.customProfession.toLowerCase().includes("model")))
  ).length;
  const crewCount = talents.filter((t) =>
    (t.profileTypes && (t.profileTypes.includes("DIRECTOR") || t.profileTypes.includes("PRODUCER") || t.profileTypes.includes("OTHER"))) ||
    (t.customProfession && !t.customProfession.toLowerCase().includes("actor") && !t.customProfession.toLowerCase().includes("model"))
  ).length;
  const availableTodayCount = talents.filter((t) => !t.isPrivate).length;

  const headerExtrasNode = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <button
        type="button"
        onClick={() => navigate("/profile")}
        style={{
          background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          padding: "8px 16px",
          fontSize: "12.5px",
          fontWeight: "800",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(238, 0, 143, 0.3)",
          whiteSpace: "nowrap"
        }}
      >
        <Sparkles size={14} />
        <span>My Talent Profile</span>
      </button>
    </div>
  );

  return (
    <AppLayout
      pageTitle="Talent Directory & Casting Search"
      subTitle="Discover registered actors, models, cinematographers, and cinema craft professionals"
      searchPlaceholder="Search talents by name, craft, skills, or city..."
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      headerExtras={headerExtrasNode}
    >
      <div className="talents-page">
        
        {/* ─── Hero Section ─────────────────────────── */}
        <div className="talents-hero">
          <div className="talents-hero-left">
            <div className="talents-hero-badge">
              <Users size={13} /> Registered Cinema Community
            </div>
            <h1 className="talents-hero-title">
              Discover & Cast <span className="pink">Cinema Talents</span>
            </h1>
            <p className="talents-hero-sub">
              Assemble your lead cast, discover verified performers, and contract technical crews with shoot availability across India.
            </p>
          </div>
        </div>

        {/* ─── Two-Column Grid Layout ───────────────── */}
        <div className="talents-two-col">
          
          {/* Main Left Column */}
          <div className="talents-left-col">
            
            {/* Category Craft Tabs */}
            <div className="talents-tabs-container">
              {CRAFT_TABS.map((tab) => {
                const isActive = selectedCraft === tab.value;
                return (
                  <PagesButton
                    key={tab.id}
                    onClick={() => handleSelectCraftTab(tab.value)}
                    className={`talents-tab-pill ${isActive ? "active" : ""}`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </PagesButton>
                );
              })}
            </div>

            {/* Filter Controls Row */}
            <div className="talents-filter-bar">
              <div className="talents-search-wrapper">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, skills or keywords..."
                  className="talents-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="talents-dropdowns-group">
                {/* City Filter */}
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="talents-select"
                >
                  <option value="All Cities">📍 All Cities</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Delhi">Delhi</option>
                </select>

                {/* Performance Language Filter */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="talents-select"
                  style={{
                    border: selectedLanguage !== "All Languages" ? "1.5px solid #7c3aed" : "1px solid #cbd5e1",
                    color: selectedLanguage !== "All Languages" ? "#7c3aed" : "inherit",
                    fontWeight: selectedLanguage !== "All Languages" ? "700" : "500"
                  }}
                >
                  <option value="All Languages">🌐 All Languages</option>
                  {availableLanguages.map((lang) => {
                    const name = typeof lang === "string" ? lang : lang.name;
                    return (
                      <option key={name} value={name}>
                        🌐 {name}
                      </option>
                    );
                  })}
                </select>

                {/* Experience Filter */}
                <select
                  value={selectedExp}
                  onChange={(e) => setSelectedExp(e.target.value)}
                  className="talents-select"
                >
                  <option value="Any Experience">💼 Any Experience</option>
                  <option value="1-3 yrs">1-3 Years</option>
                  <option value="3-5 yrs">3-5 Years</option>
                  <option value="5+ yrs">5+ Years Veteran</option>
                </select>

                {/* Shoot Availability */}
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="talents-select"
                >
                  <option value="All Availability">📅 All Availability</option>
                  <option value="Available for Shoot">Available for Shoot</option>
                  <option value="Verified Talents">Verified Talents</option>
                </select>

                {/* Sort Filter */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="talents-select"
                >
                  <option value="Newest First">Newest First</option>
                  <option value="Experience: High to Low">Experience (High-Low)</option>
                  <option value="Name: A-Z">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Metric Stat Counters */}
            <div className="talents-stats-grid">
              <div className="talents-stat-card">
                <div className="talents-stat-icon pink">
                  <Users size={20} />
                </div>
                <div className="talents-stat-info">
                  <span className="talents-stat-label">Total Talents</span>
                  <span className="talents-stat-value">{totalTalentsCount}</span>
                </div>
              </div>

              <div className="talents-stat-card">
                <div className="talents-stat-icon emerald">
                  <CheckCircle2 size={20} />
                </div>
                <div className="talents-stat-info">
                  <span className="talents-stat-label">Available for Shoot</span>
                  <span className="talents-stat-value">{availableTodayCount}</span>
                </div>
              </div>

              <div className="talents-stat-card">
                <div className="talents-stat-icon purple">
                  <Sparkles size={20} />
                </div>
                <div className="talents-stat-info">
                  <span className="talents-stat-label">Actors & Models</span>
                  <span className="talents-stat-value">{actorsModelsCount}</span>
                </div>
              </div>

              <div className="talents-stat-card">
                <div className="talents-stat-icon blue">
                  <Film size={20} />
                </div>
                <div className="talents-stat-info">
                  <span className="talents-stat-label">Crew & Technicians</span>
                  <span className="talents-stat-value">{crewCount}</span>
                </div>
              </div>
            </div>

            {/* Results Count Bar */}
            <div className="talents-results-bar">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span>
                  {filteredTalents.length} Registered {selectedCraft ? selectedCraft : "Cinema"} Talents Found in Database
                </span>
                {(selectedCraft || selectedCity !== "All Cities" || selectedLanguage !== "All Languages" || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectCraftTab(null);
                      setSelectedCity("All Cities");
                      setSelectedLanguage("All Languages");
                      setSelectedExp("Any Experience");
                      setSelectedAvailability("All Availability");
                      setSearchQuery("");
                    }}
                    className="talents-clear-btn"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Segmented View Mode Switcher (Pill Toggle) */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "#f1f5f9",
                padding: "3px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0"
              }}>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  title="List view"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "5px 9px",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: viewMode === "list" ? "#ffffff" : "transparent",
                    color: viewMode === "list" ? "#0f172a" : "#64748b",
                    boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "5px 9px",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: viewMode === "grid" ? "#ffffff" : "transparent",
                    color: viewMode === "grid" ? "#0f172a" : "#64748b",
                    boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            </div>

            {/* Talents Roster Cards Grid */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
                <Loader2 size={30} className="animate-spin text-pink-600 mx-auto mb-2" />
                <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#64748b" }}>Loading verified talents from database...</span>
              </div>
            ) : filteredTalents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "18px", border: "1.5px dashed #cbd5e1" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎭</div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>No Registered Talents Found</h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0, maxWidth: "420px", margin: "0 auto" }}>
                  There are currently no talents registered under this category or search filter. Try selecting "All Crafts" or clearing your city filter.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="talents-cards-grid">
                {filteredTalents.map((talent) => {
                  const photoUrl = talent.profilePhoto ? getFullImageUrl(talent.profilePhoto) : null;
                  const craftDisplay = talent.profileTypes && talent.profileTypes.length > 0
                    ? talent.profileTypes.join(", ")
                    : (talent.customProfession || "Cinema Talent");

                  return (
                    <div key={talent.userId} className="talent-item-card">
                      <div>
                        {/* Top Profile Header */}
                        <div className="talent-card-header">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={talent.fullName}
                              className="talent-card-avatar"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="talent-card-avatar-placeholder"
                            style={{ display: photoUrl ? "none" : "flex" }}
                          >
                            {talent.fullName?.charAt(0)?.toUpperCase() || "T"}
                          </div>

                          <div className="talent-card-meta-top">
                            <div className="talent-name-row">
                              <span className="talent-full-name">{talent.fullName}</span>
                              {talent.isPrivate ? (
                                <span className="talent-privacy-badge private">
                                  <Lock size={10} style={{ display: "inline", marginRight: 2 }} /> Private
                                </span>
                              ) : (
                                <span className="talent-privacy-badge public">
                                  <Globe size={10} style={{ display: "inline", marginRight: 2 }} /> Public
                                </span>
                              )}
                            </div>

                            {talent.stageName && talent.stageName.trim() !== talent.fullName.trim() && (
                              <span className="talent-stage-pill">"{talent.stageName}"</span>
                            )}

                            {/* Craft badges */}
                            <div className="talent-crafts-row">
                              {talent.profileTypes && talent.profileTypes.map((pt, idx) => (
                                <span key={idx} className="talent-craft-pill">
                                  {pt}
                                </span>
                              ))}
                              {talent.customProfession && (
                                <span className="talent-craft-pill" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                                  {talent.customProfession}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bio Excerpt */}
                        <p className="talent-bio-text">
                          {talent.about || "Verified cinema talent ready for collaborations, auditions, and professional film/commercial productions."}
                        </p>

                        {/* Meta information tags */}
                        <div className="talent-info-badges">
                          {talent.location && (
                            <span className="talent-info-badge">
                              <MapPin size={13} className="text-pink-600" />
                              {talent.location}
                            </span>
                          )}

                          {(talent.actingLanguages || talent.languages) && (
                            <span className="talent-info-badge" style={{ backgroundColor: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" }}>
                              <Globe size={13} className="text-purple-600" />
                              <span>{talent.actingLanguages ? `Acts in: ${talent.actingLanguages}` : talent.languages}</span>
                            </span>
                          )}

                          {talent.yearsExperience !== null && talent.yearsExperience !== undefined && (
                            <span className="talent-info-badge">
                              <Briefcase size={13} className="text-slate-500" />
                              {talent.yearsExperience} yrs exp
                            </span>
                          )}

                          <span className="talent-info-badge talent-rate-tag">
                            💰 {talent.dayRate ? `₹ ${talent.dayRate}` : "Flexible / Day"}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="talent-card-footer">
                        <PagesButton
                          onClick={() => {
                            if (talent.isPrivate) {
                              navigate(`/public-profile/${talent.userId}`);
                            } else {
                              setWorkModalTalent(talent);
                            }
                          }}
                          className="btn-talent-profile"
                        >
                          <Film size={14} />
                          <span>View Profile</span>
                        </PagesButton>

                        <PagesButton
                          onClick={() => setBookingTalent(talent)}
                          className="btn-talent-book"
                        >
                          <Calendar size={14} />
                          <span>Book Talent</span>
                        </PagesButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredTalents.map((talent) => {
                  const photoUrl = talent.profilePhoto ? getFullImageUrl(talent.profilePhoto) : null;
                  const craftDisplay = talent.profileTypes && talent.profileTypes.length > 0
                    ? talent.profileTypes.join(", ")
                    : (talent.customProfession || "Cinema Talent");

                  return (
                    <div
                      key={talent.userId}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                        transition: "all 0.15s ease",
                        flexWrap: "wrap"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
                      }}
                    >
                      {/* Left: Avatar + Identity */}
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "240px", flex: "1 1 240px" }}>
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={talent.fullName}
                            style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #f1f5f9" }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          style={{
                            display: photoUrl ? "none" : "flex",
                            width: "52px",
                            height: "52px",
                            borderRadius: "50%",
                            backgroundColor: "#fdf2f8",
                            color: "#db2777",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "800",
                            fontSize: "18px",
                            flexShrink: 0,
                            border: "2px solid #fce7f3"
                          }}
                        >
                          {talent.fullName?.charAt(0)?.toUpperCase() || "T"}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>{talent.fullName}</span>
                            {talent.isPrivate ? (
                              <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#64748b" }}>
                                <Lock size={10} style={{ display: "inline", marginRight: 2 }} /> Private
                              </span>
                            ) : (
                              <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#ecfdf5", color: "#059669" }}>
                                <Globe size={10} style={{ display: "inline", marginRight: 2 }} /> Public
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: "700", color: "#ee008f", marginTop: "2px" }}>
                            {craftDisplay}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            {talent.location && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                <MapPin size={11} className="text-pink-600" /> {talent.location}
                              </span>
                            )}
                            {talent.yearsExperience !== null && talent.yearsExperience !== undefined && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                <Briefcase size={11} /> {talent.yearsExperience} yrs exp
                              </span>
                            )}
                            {(talent.actingLanguages || talent.languages) && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: "#6d28d9", fontWeight: "700" }}>
                                <Globe size={11} /> {talent.actingLanguages ? `Acts in: ${talent.actingLanguages}` : talent.languages}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Bio */}
                      <div style={{ flex: "2 1 200px", minWidth: "180px", fontSize: "12px", color: "#64748b" }}>
                        <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>
                          {talent.about || "Verified cinema talent ready for collaborations, auditions, and professional film/commercial productions."}
                        </p>
                      </div>

                      {/* Right: Rate & Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "13px", fontWeight: "800", color: "#059669" }}>
                            {talent.dayRate ? `₹ ${talent.dayRate}` : "Flexible"}
                          </div>
                          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600" }}>per day rate</div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <PagesButton
                            onClick={() => {
                              if (talent.isPrivate) {
                                navigate(`/public-profile/${talent.userId}`);
                              } else {
                                setWorkModalTalent(talent);
                              }
                            }}
                            className="btn-talent-profile"
                            style={{ padding: "8px 14px", fontSize: "12px" }}
                          >
                            <Film size={13} />
                            <span>Profile</span>
                          </PagesButton>

                          <PagesButton
                            onClick={() => setBookingTalent(talent)}
                            className="btn-talent-book"
                            style={{ padding: "8px 14px", fontSize: "12px" }}
                          >
                            <Calendar size={13} />
                            <span>Book</span>
                          </PagesButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="talents-right-col">
            
            {/* Quick Actions Card */}
            <div className="talents-sidebar-card">
              <div className="talents-sidebar-header">
                <h3 className="talents-sidebar-title">Quick Actions</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <PagesButton
                  onClick={() => navigate("/opportunities")}
                  className="talents-quick-item"
                >
                  <div className="talents-quick-icon">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>Opportunities Hub</div>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>Post & apply for casting calls</div>
                  </div>
                </PagesButton>

                <PagesButton
                  onClick={() => navigate("/auditions")}
                  className="talents-quick-item"
                >
                  <div className="talents-quick-icon">
                    <Film size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>Auditions & Castings</div>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>Manage calls received & applications</div>
                  </div>
                </PagesButton>

                <PagesButton
                  onClick={() => setShowCalendarModal(true)}
                  className="talents-quick-item"
                >
                  <div className="talents-quick-icon">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>Shoot Availability</div>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>Check master calendar dates</div>
                  </div>
                </PagesButton>
              </div>
            </div>

            {/* Need Help Card */}
            <div
              className="talents-sidebar-card"
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                color: "#ffffff",
                border: "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f472b6" }}>
                  <Headphones size={20} />
                </div>
                <h4 style={{ fontSize: "14px", fontWeight: "800", margin: 0, color: "#ffffff" }}>Casting Concierge</h4>
              </div>
              <p style={{ fontSize: "12.5px", color: "#94a3b8", lineHeight: 1.5, margin: "0 0 14px" }}>
                Need help locking in specialized DOPs, lead actors, or booking private celebrity artists?
              </p>
              <button
                type="button"
                onClick={() => showSuccess("Concierge Connected", "Our executive casting team has received your inquiry.")}
                style={{
                  width: "100%",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: "#ee008f",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "800",
                  fontSize: "12.5px",
                  cursor: "pointer"
                }}
              >
                Contact Casting Desk
              </button>
            </div>

          </div>
        </div>

        {/* ─── Modal 1: Send Shoot / Booking Request ───────── */}
        {bookingTalent && (
          <BookingRequestModal
            isOpen={Boolean(bookingTalent)}
            talent={bookingTalent}
            onClose={() => setBookingTalent(null)}
            onSuccess={() => {
              showSuccess(
                "Request Sent!",
                `Your booking request has been sent to ${bookingTalent.fullName}. It is now in their Opportunities tab.`
              );
              setBookingTalent(null);
            }}
          />
        )}

        {/* ─── Modal 2: Talent Work & Portfolio Showcase ───── */}
        {workModalTalent && (
          <TalentWorkModal
            isOpen={Boolean(workModalTalent)}
            talent={workModalTalent}
            onClose={() => setWorkModalTalent(null)}
            onOpenBookingModal={() => {
              const t = workModalTalent;
              setWorkModalTalent(null);
              setBookingTalent(t);
            }}
          />
        )}

        {/* ─── Modal 3: Calendar Modal ────────────────────── */}
        <MiniCalendar
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          renderOnlyModal={true}
        />

      </div>
    </AppLayout>
  );
}
