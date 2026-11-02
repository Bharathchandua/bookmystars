import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Calendar,
  MapPin,
  Briefcase,
  ShieldCheck,
  Search,
  Check,
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import logo from "../../assets/logo.png";
import CountUpModule from "react-countup";
import Button from "../common/Button";
import { registerUser, logoutUser } from "../../features/bms/api/auth/authApi";
import { getPublicProfessions } from "../../features/bms/api/professions/professionsApi";
import { getPublicCrafts } from "../../features/bms/api/skills/skillsApi";
import { getPublicLanguages } from "../../features/bms/api/languages/languagesApi";
import { onLiveSync } from "../../shared/utils/liveSync";
const CountUp = typeof CountUpModule === "function" ? CountUpModule : (CountUpModule.default || CountUpModule);

/**
 * Compact Single-Line Horizontal Scrolling Language Picker
 * Avoids taking up vertical page height by providing a sleek 1-row scrollable carousel
 * with Left/Right navigation, instant text search, auto-pinned selections, and clean active summary.
 */
function ScrollableLanguagePicker({
  title,
  icon,
  required = false,
  selectedList = [],
  onChange,
  availableLanguages = [],
  themeColor = "#ee008f",
  themeBg = "#fff1f8",
  themeBorder = "#fbcfe8",
  subtitle = "",
  extraAction = null,
}) {
  const scrollRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleScroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      // Put selected languages at front so they're instantly visible, followed by unselected
      const selected = availableLanguages.filter((l) => selectedList.includes(l));
      const unselected = availableLanguages.filter((l) => !selectedList.includes(l));
      return [...selected, ...unselected];
    }
    return availableLanguages.filter((l) =>
      l.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [availableLanguages, selectedList, searchQuery]);

  const toggleLanguage = (lang) => {
    if (selectedList.includes(lang)) {
      onChange(selectedList.filter((l) => l !== lang));
    } else {
      onChange([...selectedList, lang]);
    }
  };

  return (
    <div className="auth-field" style={{ marginBottom: "0 !important" }}>
      {/* Header: Title, Extra Actions, Search Toggle, Selected Count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
          flexWrap: "wrap",
          gap: "8px"
        }}
      >
        <label
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#1e293b",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          {icon}
          <span>{title}</span>
          {required && <span className="pink">*</span>}
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {extraAction}

          {/* Quick Search Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowSearch((prev) => !prev);
              if (showSearch) setSearchQuery("");
            }}
            style={{
              background: showSearch ? themeBg : "transparent",
              border: showSearch ? `1px solid ${themeBorder}` : "none",
              color: showSearch ? themeColor : "#64748b",
              borderRadius: "6px",
              padding: "3px 7px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: "700"
            }}
            title="Search languages"
          >
            <Search size={12} />
            <span>{showSearch ? "Close" : "Find"}</span>
          </button>

          {/* Selected Counter */}
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: selectedList.length > 0 ? themeColor : "#94a3b8",
              backgroundColor: selectedList.length > 0 ? themeBg : "#f1f5f9",
              padding: "2px 8px",
              borderRadius: "10px",
              border: `1px solid ${selectedList.length > 0 ? themeBorder : "#e2e8f0"}`
            }}
          >
            {selectedList.length} selected
          </span>

          {selectedList.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "2px 4px"
              }}
              title="Clear all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Inline Search Bar (if search opened) */}
      {showSearch && (
        <div style={{ marginBottom: "8px", position: "relative" }}>
          <input
            type="text"
            placeholder="Type language name (e.g. Telugu, Spanish)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "7px 12px 7px 32px",
              borderRadius: "8px",
              border: `1.5px solid ${themeColor}`,
              fontSize: "12px",
              outline: "none",
              backgroundColor: "#ffffff",
              boxSizing: "border-box"
            }}
          />
          <Search
            size={13}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: themeColor
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Single-Row Scrolling Carousel Track (takes only 44px height instead of 5 rows) */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "4px 6px"
        }}
      >
        {/* Left Scroll Button */}
        <button
          type="button"
          onClick={() => handleScroll(-220)}
          style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            transition: "all 0.15s ease",
            zIndex: 2
          }}
          title="Scroll Left"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            overflowX: "auto",
            scrollBehavior: "smooth",
            padding: "4px 8px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            whiteSpace: "nowrap"
          }}
        >
          {filteredLanguages.length === 0 ? (
            <div style={{ fontSize: "12px", color: "#94a3b8", padding: "6px 12px" }}>
              No languages match "{searchQuery}"
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSel = selectedList.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  style={{
                    flexShrink: 0,
                    padding: "6px 13px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: isSel ? "800" : "600",
                    border: isSel ? `1.5px solid ${themeColor}` : "1px solid #cbd5e1",
                    backgroundColor: isSel ? themeColor : "#ffffff",
                    color: isSel ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: isSel ? `0 2px 6px ${themeColor}33` : "none"
                  }}
                >
                  <span>{isSel ? "✓" : "+"}</span>
                  <span>{lang}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Right Scroll Button */}
        <button
          type="button"
          onClick={() => handleScroll(220)}
          style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            transition: "all 0.15s ease",
            zIndex: 2
          }}
          title="Scroll Right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Active Selected Summary Badges */}
      {selectedList.length > 0 && (
        <div
          style={{
            marginTop: "6px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            color: "#64748b",
            flexWrap: "wrap"
          }}
        >
          <span style={{ fontWeight: "700", color: themeColor }}>Active:</span>
          {selectedList.map((lang) => (
            <span
              key={lang}
              style={{
                backgroundColor: themeBg,
                color: themeColor,
                border: `1px solid ${themeBorder}`,
                padding: "1px 7px",
                borderRadius: "6px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px"
              }}
            >
              {lang}
              <button
                type="button"
                onClick={() => toggleLanguage(lang)}
                style={{
                  background: "none",
                  border: "none",
                  color: themeColor,
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "10px",
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {subtitle && (
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function JoinFree() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("talent"); // 'talent' or 'professional'
  const [fullName, setFullName] = useState("");
  const [stageName, setStageName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileCode, setMobileCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [selectedProfiles, setSelectedProfiles] = useState([]); // multiselect
  const [dbCrafts, setDbCrafts] = useState([]);
  const [rawProfessions, setRawProfessions] = useState([
    { id: 1, name: "Actor", craftCategory: "Acting & Performance" },
    { id: 2, name: "Director", craftCategory: "Writing & Direction" },
    { id: 3, name: "Dancer", craftCategory: "Dance & Movement" },
    { id: 4, name: "Singer", craftCategory: "Music & Voice" },
    { id: 5, name: "Model", craftCategory: "Acting & Performance" },
    { id: 6, name: "Producer", craftCategory: "Writing & Direction" },
    { id: 7, name: "Cinematographer", craftCategory: "Technical & Camera" },
    { id: 8, name: "Film Editor", craftCategory: "Post-Production & VFX" },
    { id: 9, name: "Screenplay Writer", craftCategory: "Writing & Direction" },
    { id: 10, name: "Choreographer", craftCategory: "Dance & Movement" },
    { id: 11, name: "Stunt Performer", craftCategory: "Stunts & Action" },
    { id: 12, name: "Voice Artist", craftCategory: "Music & Voice" }
  ]);
  const [selectedCraft, setSelectedCraft] = useState("Acting & Performance");
  const [profSearch, setProfSearch] = useState("");
  const [loadingProfessions, setLoadingProfessions] = useState(false);
  const [languagesKnown, setLanguagesKnown] = useState(["English", "Hindi"]);
  const [actingLanguages, setActingLanguages] = useState(["Hindi"]);
  const [dbLanguages, setDbLanguages] = useState([]);
  const [howHeard, setHowHeard] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const CRAFT_METADATA = {
    "Acting & Performance": { icon: "🎭", label: "Acting & Performance" },
    "Writing & Direction": { icon: "🎬", label: "Writing & Direction" },
    "Technical & Camera": { icon: "🎥", label: "Technical & Camera" },
    "Cinematography & Camera": { icon: "🎥", label: "Cinematography & Camera" },
    "Music & Voice": { icon: "🎵", label: "Music & Voice" },
    "Music Direction & Composition": { icon: "🎼", label: "Music Direction & Composition" },
    "Playback Singing": { icon: "🎤", label: "Playback Singing" },
    "Voice Dubbing & Foley": { icon: "🎙️", label: "Voice Dubbing & Foley" },
    "Dance & Movement": { icon: "💃", label: "Dance & Movement" },
    "Choreography": { icon: "💃", label: "Choreography" },
    "Stunts & Action": { icon: "💥", label: "Stunts & Action" },
    "Stunt & Action Direction": { icon: "💥", label: "Stunt & Action Direction" },
    "Post-Production & VFX": { icon: "✂️", label: "Post-Production & VFX" },
    "Editing & Assembly": { icon: "🎞️", label: "Editing & Assembly" },
    "Visual Effects (VFX)": { icon: "✨", label: "Visual Effects (VFX)" },
    "Sound Recording & Design": { icon: "🎧", label: "Sound Recording & Design" },
    "Color Grading & DI": { icon: "🎨", label: "Color Grading & DI" },
    "Hair, Makeup & Costume": { icon: "💄", label: "Hair, Makeup & Costume" },
    "Makeup & Prosthetics": { icon: "💄", label: "Makeup & Prosthetics" },
    "Costume Design & Styling": { icon: "👗", label: "Costume Design & Styling" },
    "Art & Production Design": { icon: "🏛️", label: "Art & Production Design" },
    "Production Management": { icon: "📋", label: "Production Management" },
    "Screenplay & Writing": { icon: "✍️", label: "Screenplay & Writing" },
    "Direction & Filmmaking": { icon: "🎬", label: "Direction & Filmmaking" },
    "Casting Direction": { icon: "🌟", label: "Casting Direction" },
    "Lighting & Gaffer": { icon: "💡", label: "Lighting & Gaffer" },
    "PR, Publicity & Promotion": { icon: "📢", label: "PR, Publicity & Promotion" },
    "Still Photography": { icon: "📷", label: "Still Photography" },
    "Specialized Craft": { icon: "⚡", label: "Specialized Crafts" }
  };

  const availableCrafts = useMemo(() => {
    const list = [];
    // 1. All crafts live in PostgreSQL (/api/crafts)
    dbCrafts.forEach((c) => {
      const name = (c.name || c).trim();
      if (name && !list.includes(name)) list.push(name);
    });

    // 2. Also ensure any craft category present in rawProfessions is included
    rawProfessions.forEach((p) => {
      const cat = (p.craftCategory || "").trim();
      if (cat && !list.includes(cat)) list.push(cat);
    });

    return list.length > 0 ? list : [
      "Acting & Performance",
      "Writing & Direction",
      "Technical & Camera",
      "Music & Voice",
      "Dance & Movement",
      "Stunts & Action",
      "Post-Production & VFX",
      "Hair, Makeup & Costume",
      "Art & Production Design",
      "Specialized Craft"
    ];
  }, [dbCrafts, rawProfessions]);

  const displayedProfessions = useMemo(() => {
    if (profSearch.trim()) {
      const q = profSearch.toLowerCase();
      return rawProfessions.filter((p) => 
        p.name?.toLowerCase().includes(q) ||
        (p.craftCategory && p.craftCategory.toLowerCase().includes(q))
      );
    }
    return rawProfessions.filter((p) => (p.craftCategory || "General Craft") === selectedCraft);
  }, [rawProfessions, selectedCraft, profSearch]);

  const availableLanguagesList = useMemo(() => {
    if (dbLanguages && dbLanguages.length > 0) {
      return dbLanguages.map(l => (typeof l === "string" ? l : l.name));
    }
    return [
      "Hindi", "English", "Telugu", "Tamil", "Malayalam", 
      "Kannada", "Marathi", "Bengali", "Punjabi", "Gujarati", "Urdu"
    ];
  }, [dbLanguages]);

  // Live password validation rules (mockup requirements)
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/.test(password);

  const allRulesMet = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;

  // Load dynamic primary professions & crafts from PostgreSQL
  useEffect(() => {
    async function loadDynamicTaxonomy() {
      try {
        setLoadingProfessions(true);
        const [profData, craftData, langData] = await Promise.allSettled([
          getPublicProfessions(),
          getPublicCrafts(),
          getPublicLanguages()
        ]);
        if (profData.status === "fulfilled" && Array.isArray(profData.value) && profData.value.length > 0) {
          setRawProfessions(profData.value);
        }
        if (craftData.status === "fulfilled" && Array.isArray(craftData.value) && craftData.value.length > 0) {
          setDbCrafts(craftData.value);
        }
        if (langData.status === "fulfilled" && Array.isArray(langData.value) && langData.value.length > 0) {
          setDbLanguages(langData.value);
        }
      } catch (err) {
        console.warn("Could not load taxonomy from API, using fallback list:", err);
      } finally {
        setLoadingProfessions(false);
      }
    }

    loadDynamicTaxonomy();

    const unsubscribe = onLiveSync(["professions_updated", "crafts_updated", "skills_updated", "languages_updated"], () => {
      loadDynamicTaxonomy();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const handleProfileToggle = (profile) => {
    if (selectedProfiles.includes(profile)) {
      setSelectedProfiles(selectedProfiles.filter((p) => p !== profile));
    } else {
      setSelectedProfiles([...selectedProfiles, profile]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordMismatch(false);

    if (!allRulesMet) {
      setError("Please make sure all password requirements are met!");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms & Privacy Policy!");
      return;
    }

    if (!selectedProfiles || selectedProfiles.length === 0) {
      setError("Please select your primary profession!");
      return;
    }

    setLoading(true);
    logoutUser();
    try {
      const chosenProfession = selectedProfiles[0] || "Actor";

      await registerUser({
        accountType,
        fullName,
        stageName,
        email,
        mobileNumber,
        mobileCode,
        password,
        dob,
        gender,
        location,
        selectedProfiles,
        primaryProfession: chosenProfession,
        customProfession: chosenProfession,
        languages: languagesKnown,
        actingLanguages: actingLanguages,
        howHeard,
        agreeTerms,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const avatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&h=100&q=80"
  ];

  return (
    <div className="auth-page-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Global Top White Header Bar */}
      <header className="auth-header">
        <div className="container-fluid px-4 px-lg-5 nav-inner" style={{ width: "100%" }}>
          <Link to="/" className="logo text-decoration-none">
            <img src={logo} alt="Book My Stars" className="navbar-logo" />
          </Link>
          <div className="header-link">
            Already have an account? <Link to="/signin">Log In</Link>
          </div>
        </div>
      </header>

      <div className="auth-split-wrapper">
        {/* LEFT PANEL */}
        <div className="auth-split-left signup-bg">
          {/* Top Content */}
          <div className="left-top-content">
            <h1 className="headline">
              Join <span className="pink">Book My Stars</span><br />
              and launch your<br />
              journey in the<br />
              entertainment<br />
              industry
            </h1>
            
            <div className="mini-line"></div>

            <p className="sub-desc">
              Create your profile, get discovered and<br />
              connect with the right opportunities.
            </p>
          </div>

          {/* Flexible middle spacer */}
          <div className="left-spacer" style={{ flexGrow: 1, minHeight: "200px" }}></div>

          {/* Bottom Content */}
          <div className="left-bottom-content">
            {/* Mockup Feature List */}
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <User size={14} />
                </div>
                <div className="feature-text">
                  <h4>Discover Opportunities</h4>
                  <p>Find auditions, casting calls,<br />and projects that match your profile.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <User size={14} />
                </div>
                <div className="feature-text">
                  <h4>Build Your Profile</h4>
                  <p>Showcase your talent, portfolio,<br />and experience.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <User size={14} />
                </div>
                <div className="feature-text">
                  <h4>Connect & Collaborate</h4>
                  <p>Network with casting directors,<br />producers and industry experts.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <ShieldCheck size={14} />
                </div>
                <div className="feature-text">
                  <h4>Secure & Verified</h4>
                  <p>Your data is safe with us and<br />used to help you grow.</p>
                </div>
              </div>
            </div>

            {/* Trusted talents */}
            <div className="trusted-talents-section">
              <div className="trusted-text">Trusted by thousands of talents</div>
              <div className="avatar-group">
                {avatars.map((url, i) => (
                  <div className="avatar-circle" key={i}>
                    <img src={url} alt={`User face ${i + 1}`} />
                  </div>
                ))}
                <div className="avatar-circle avatar-more">
                  <CountUp start={0} end={10} duration={0.8} suffix="K+" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-split-right">
          <div className="right-form-container">
            <h2>Create Your Account</h2>
            <p className="right-subtitle">Fill in the details below to get started.</p>

            {error && (
              <div className="alert alert-danger py-2 px-3 mb-3 w-100" role="alert" style={{ fontSize: "13px", fontWeight: "600" }}>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Account Type Selector Cards */}
              <div className="role-selector-container">
                <div 
                  className={`role-card ${accountType === "talent" ? "active" : ""}`}
                  onClick={() => {
                    setAccountType("talent");
                    setSelectedProfiles([]);
                  }}
                >
                  <div className="role-icon-wrapper">
                    <User size={20} />
                  </div>
                  <div className="role-text-wrapper">
                    <h4>I'm a Talent</h4>
                    <p>&lt; 1 Year Exp (Newcomer / Fresher)</p>
                  </div>
                </div>

                <div 
                  className={`role-card ${accountType === "professional" ? "active" : ""}`}
                  onClick={() => {
                    setAccountType("professional");
                    setSelectedProfiles([]);
                  }}
                >
                  <div className="role-icon-wrapper">
                    <Briefcase size={20} />
                  </div>
                  <div className="role-text-wrapper">
                    <h4>I'm a Professional</h4>
                    <p>&gt; 1 Year Exp + Completed Work</p>
                  </div>
                </div>
              </div>

              {/* Grid 1: Full Name & Stage Name */}
              <div className="auth-grid-row-2col">
                <div className="auth-field">
                  <label htmlFor="fullName">Full Name <span className="pink">*</span></label>
                  <div className="auth-input-wrapper">
                    <input
                      type="text"
                      id="fullName"
                      className="auth-input"
                      style={{ paddingLeft: "16px" }}
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="stageName">Stage Name (Optional)</label>
                  <div className="auth-input-wrapper">
                    <input
                      type="text"
                      id="stageName"
                      className="auth-input"
                      style={{ paddingLeft: "16px" }}
                      placeholder="Enter your stage name"
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Grid 2: Email & Mobile Number */}
              <div className="auth-grid-row-2col">
                <div className="auth-field">
                  <label htmlFor="email">Email Address <span className="pink">*</span></label>
                  <div className="auth-input-wrapper">
                    <input
                      type="email"
                      id="email"
                      className="auth-input"
                      style={{ paddingLeft: "16px" }}
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="mobile">Mobile Number <span className="pink">*</span></label>
                  <div className="auth-mobile-wrapper">
                    <div className="auth-mobile-prefix">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      id="mobile"
                      className="auth-mobile-input"
                      placeholder="Enter mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Grid 3: Password & Confirm Password */}
              <div className="auth-grid-row-2col" style={{ marginBottom: "8px" }}>
                <div className="auth-field" style={{ marginBottom: "0 !important" }}>
                  <label htmlFor="password">Password <span className="pink">*</span></label>
                  <div className="auth-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="auth-input"
                      style={{ paddingLeft: "16px" }}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordMismatch(false);
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field" style={{ marginBottom: "0 !important" }}>
                  <label htmlFor="confirmPassword">Confirm Password <span className="pink">*</span></label>
                  <div className="auth-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      className="auth-input"
                      style={{ paddingLeft: "16px" }}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordMismatch(false);
                      }}
                      style={{
                        paddingLeft: "16px",
                        borderColor: passwordMismatch ? "#d93025" : "",
                        boxShadow: passwordMismatch ? "0 0 0 4px rgba(217, 48, 37, 0.08)" : ""
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Password Criteria checklist */}
              <div className="auth-field" style={{ marginBottom: "28px" }}>
                <div className="password-criteria-row">
                  <div className={`criteria-item ${hasMinLength ? "met" : ""}`}>
                    <span className="criteria-icon">{hasMinLength ? "✓" : "•"}</span>
                    Min. 8 characters
                  </div>
                  <div className={`criteria-item ${hasUppercase ? "met" : ""}`}>
                    <span className="criteria-icon">{hasUppercase ? "✓" : "•"}</span>
                    1 uppercase
                  </div>
                  <div className={`criteria-item ${hasNumber ? "met" : ""}`}>
                    <span className="criteria-icon">{hasNumber ? "✓" : "•"}</span>
                    1 number
                  </div>
                  <div className={`criteria-item ${hasSpecialChar ? "met" : ""}`}>
                    <span className="criteria-icon">{hasSpecialChar ? "✓" : "•"}</span>
                    1 special character
                  </div>
                </div>
                {passwordMismatch && (
                  <p style={{ color: "#d93025", fontSize: "13px", margin: "8px 0 0 0", fontWeight: "600" }}>
                    Passwords do not match.
                  </p>
                )}
              </div>

              {/* Grid 4: DOB & Gender */}
              <div className="auth-grid-row-2col">
                <div className="auth-field">
                  <label htmlFor="dob">Date of Birth <span className="pink">*</span></label>
                  <div className="auth-input-wrapper">
                    <input
                      type="date"
                      id="dob"
                      className="auth-input"
                      style={{ paddingLeft: "16px", paddingRight: "16px" }}
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="gender">Gender <span className="pink">*</span></label>
                  <select
                    id="gender"
                    className="auth-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Location */}
              <div className="auth-field">
                <label htmlFor="location">Location <span className="pink">*</span></label>
                <div className="auth-input-wrapper">
                  <MapPin size={18} className="input-icon" style={{ left: "16px" }} />
                  <input
                    type="text"
                    id="location"
                    className="auth-input"
                    placeholder="Enter your city"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 6: Creative Craft & Primary Profession (Clean Side-by-Side Dropdowns) */}
              <div className="auth-grid-row-2col" style={{ marginBottom: "16px" }}>
                {/* Dropdown 1: Craft / Department */}
                <div className="auth-field" style={{ marginBottom: "0 !important" }}>
                  <label htmlFor="craftSelect">
                    Creative Craft / Department <span className="pink">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <select
                      id="craftSelect"
                      className="auth-select"
                      value={selectedCraft}
                      onChange={(e) => {
                        const newCraft = e.target.value;
                        setSelectedCraft(newCraft);
                        // Filter professions for this craft
                        const profs = rawProfessions.filter(p => (p.craftCategory || "General Craft") === newCraft);
                        if (profs.length > 0) {
                          setSelectedProfiles([profs[0].name]);
                        } else {
                          setSelectedProfiles([]);
                        }
                      }}
                      required
                    >
                      <option value="" disabled>-- Select Your Craft --</option>
                      {availableCrafts.map((craft) => {
                        const meta = CRAFT_METADATA[craft] || { icon: "🎬" };
                        const count = rawProfessions.filter(p => (p.craftCategory || "General Craft") === craft).length;
                        return (
                          <option key={craft} value={craft}>
                            {meta.icon} {craft} ({count} roles)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Dropdown 2: Specific Profession */}
                <div className="auth-field" style={{ marginBottom: "0 !important" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label htmlFor="professionSelect" style={{ margin: 0 }}>
                      Primary Profession / Role <span className="pink">*</span>
                    </label>
                    {loadingProfessions && (
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>Syncing...</span>
                    )}
                  </div>
                  <div className="auth-input-wrapper">
                    <select
                      id="professionSelect"
                      className="auth-select"
                      value={selectedProfiles[0] || ""}
                      onChange={(e) => setSelectedProfiles([e.target.value])}
                      disabled={!selectedCraft}
                      required
                    >
                      <option value="" disabled>
                        {selectedCraft ? `-- Select your role in ${selectedCraft} --` : "-- Choose Craft first --"}
                      </option>
                      {(() => {
                        const craftRoles = rawProfessions.filter(p => (p.craftCategory || "General Craft") === selectedCraft);
                        if (craftRoles.length === 0) {
                          return (
                            <option value={`${selectedCraft} Specialist`}>
                              {selectedCraft} Specialist (General)
                            </option>
                          );
                        }
                        return craftRoles.map((prof) => (
                          <option key={prof.id || prof.name} value={prof.name}>
                            {prof.name}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                </div>
              </div>

              {/* Subtle Selected Role Confirmation */}
              {selectedProfiles[0] && (
                <div style={{ marginTop: "-6px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
                  <span>Selected Role:</span>
                  <span style={{ fontWeight: "800", color: "#ee008f", backgroundColor: "#fff1f8", padding: "3px 10px", borderRadius: "8px", border: "1px solid #fbcfe8", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <Check size={12} />
                    <span>{selectedProfiles[0]}</span>
                    <span style={{ color: "#94a3b8", fontWeight: "600" }}>({selectedCraft})</span>
                  </span>
                </div>
              )}

              {accountType === "professional" && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", color: "#1e40af", marginBottom: "16px" }}>
                  ⚠️ <strong>Note for Professionals:</strong> 1+ years of verified industry experience with completed work is required. If not updated upon login, your account will be automatically set to Talent.
                </div>
              )}

              {/* Languages Known & Performance Languages Selection (Compact 1-Line Horizontal Scrolling) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                {/* 1. Languages Known (Conversational) */}
                <ScrollableLanguagePicker
                  title="Languages Known (Conversational)"
                  icon={<Globe size={15} color="#ee008f" />}
                  required={true}
                  selectedList={languagesKnown}
                  onChange={setLanguagesKnown}
                  availableLanguages={availableLanguagesList}
                  themeColor="#ee008f"
                  themeBg="#fff1f8"
                  themeBorder="#fbcfe8"
                  subtitle="Scroll horizontally or click arrows to explore all cinema languages."
                />

                {/* 2. Performance / Acting Languages */}
                <ScrollableLanguagePicker
                  title="Performance / Acting Languages (Dialogues & Auditions)"
                  icon={<span style={{ fontSize: "14px" }}>🎭</span>}
                  required={false}
                  selectedList={actingLanguages}
                  onChange={setActingLanguages}
                  availableLanguages={availableLanguagesList}
                  themeColor="#7c3aed"
                  themeBg="#faf5ff"
                  themeBorder="#e9d5ff"
                  subtitle="Choose the languages in which you can fluently act, deliver monologues, dub, or sing."
                  extraAction={
                    languagesKnown.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActingLanguages([...languagesKnown])}
                        style={{
                          backgroundColor: "#f5f3ff",
                          border: "1px solid #ddd6fe",
                          color: "#7c3aed",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px"
                        }}
                        title="Copy selected conversational languages into acting languages"
                      >
                        <Sparkles size={11} />
                        <span>Same as Conversational</span>
                      </button>
                    ) : null
                  }
                />
              </div>

              {/* Row 7: How did you hear about us? */}
              <div className="auth-field" style={{ marginBottom: "28px" }}>
                <label htmlFor="howHeard">How did you hear about us?</label>
                <select
                  id="howHeard"
                  className="auth-select"
                  value={howHeard}
                  onChange={(e) => setHowHeard(e.target.value)}
                >
                  <option value="">Select an option</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="word-of-mouth">Friends / Family</option>
                  <option value="search">Search Engine</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Agreement Option */}
              <div className="auth-options" style={{ marginBottom: "28px" }}>
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    className="auth-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                  <span className="checkbox-text-wrapper">
                    <span className="chk-line-wrapper">
                      <span className="chk-text-segment">I agree to the </span>
                      <a href="#terms" className="auth-forgot chk-link-segment" style={{ fontSize: "14px", fontWeight: "700" }}>Terms of Service</a>
                    </span>
                    <span className="chk-line-wrapper">
                      <span className="chk-text-segment">and </span>
                      <a href="#privacy" className="auth-forgot chk-link-segment" style={{ fontSize: "14px", fontWeight: "700" }}>Privacy Policy</a>
                    </span>
                  </span>
                </label>
              </div>

              {/* Submit btn */}
              <Button type="submit" variant="auth-btn" disabled={loading} style={{ padding: "15px" }}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="right-divider">OR</div>

            {/* Social options */}
            <div className="social-btn-container">
              <Button type="button" variant="social-login-btn" onClick={() => navigate("/")}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.39 2.673 1.482 6.564l3.784 3.201z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.275c0-.825-.075-1.62-.213-2.385H12v4.51h6.46a5.523 5.523 0 0 1-2.4 3.627l3.722 2.883c2.176-2.007 3.708-4.957 3.708-8.635z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.266 14.235A7.05 7.05 0 0 1 4.909 12c0-.785.137-1.54.357-2.235L1.482 6.564A11.934 11.934 0 0 0 0 12c0 1.92.455 3.73 1.258 5.345l4.008-3.11z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.955-1.075 7.94-2.915l-3.722-2.883c-1.03.69-2.35 1.107-4.218 1.107-3.255 0-6.014-2.196-7.002-5.155l-4.008 3.11A11.933 11.933 0 0 0 12 24z"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button type="button" variant="social-login-btn" onClick={() => navigate("/")}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </Button>
            </div>

            {/* Bottom notice */}
            <div className="privacy-banner">
              <ShieldCheck size={22} className="privacy-icon" />
              <div className="privacy-text">
                <h5>We never post without your permission</h5>
                <p>Your privacy is our priority.</p>
              </div>
            </div>
          </div>

          {/* Back to Home Link */}
          <Link to="/" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#64748b", fontWeight: "600", marginTop: "24px" }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>

      {/* Success Modal Overlay */}
      {success && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(5, 7, 45, 0.6)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div className="auth-card" style={{
            maxWidth: "400px",
            animation: "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            padding: "40px 30px",
            textAlign: "center"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(34, 197, 94, 0.1)",
              border: "2px solid #22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              color: "#22c55e",
              boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)",
              animation: "pulseGlow 2s infinite",
              margin: "0 auto 24px"
            }}>
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 11 2 2 4-4" />
              </svg>
            </div>
            
            <h2 style={{ fontSize: "22px", color: "#05072d", fontWeight: "900", marginBottom: "12px", textAlign: "center" }}>
              WELCOME TO BOOK MY STARS
            </h2>
            
            <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5", margin: "0 0 20px 0", textAlign: "center" }}>
              Your registration is successful! You can now log in to access your profile dashboard.
            </p>
            
            <Button 
              type="button" 
              variant="auth-btn" 
              onClick={() => {
                logoutUser();
                setSuccess(false);
                navigate("/signin");
              }}
              style={{
                padding: "12px 28px",
                fontSize: "14px",
                fontWeight: "800",
                width: "auto",
                margin: "0 auto"
              }}
            >
              Proceed to Sign In
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}