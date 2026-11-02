import { useState, useRef, useEffect } from "react";
import { X, Upload, Video, Film, Sparkles, AlertCircle, CheckCircle2, Globe } from "lucide-react";
import { createCastingCall, uploadOpportunityMedia } from "../../features/bms/api/opportunities/opportunitiesApi";
import { getPublicLanguages } from "../../features/bms/api/languages/languagesApi";
import { showSuccess, showError, showWarning } from "../../shared/utils/alert";
import { emitLiveSync } from "../../shared/utils/liveSync";

const PROJECT_TYPES = [
  "Feature Film",
  "Web Series",
  "Commercial / TVC",
  "Music Video",
  "Short Film",
  "Fashion Shoot",
  "Theatre & Live Show",
  "Other"
];

const CRAFT_ROLES = [
  { value: "ACTOR", label: "🎭 Actor / Lead Role" },
  { value: "MODEL", label: "✨ Model / High Fashion" },
  { value: "DANCER", label: "💃 Dancer / Choreographer" },
  { value: "SINGER", label: "🎤 Singer / Vocalist" },
  { value: "DIRECTOR", label: "🎬 Director / Filmmaker" },
  { value: "PRODUCER", label: "💼 Producer / Executive" },
  { value: "OTHER", label: "🎥 Cinematographer / DOP" },
  { value: "OTHER", label: "✂️ Editor / Post Production" },
  { value: "OTHER", label: "💄 Makeup & Hair Stylist" },
  { value: "OTHER", label: "🎨 Art Director / Production Designer" },
  { value: "OTHER", label: "✍️ Scriptwriter / Dialogue Writer" },
  { value: "OTHER", label: "🌟 Custom Cinema Craft" }
];

export default function PostOpportunityModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState("Feature Film");
  const [roleType, setRoleType] = useState("ACTOR");
  const [customCraft, setCustomCraft] = useState("");
  const [location, setLocation] = useState("Mumbai");
  const [budget, setBudget] = useState("");
  const [shootStartDate, setShootStartDate] = useState("");
  const [shootEndDate, setShootEndDate] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  // New Demographic criteria fields (Age & Gender mandatory, Height & Weight optional)
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Any");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Post Type / Discipline & Required Languages
  const [postType, setPostType] = useState("ACTING");
  const [customDiscipline, setCustomDiscipline] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState(["Hindi", "English"]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    let mounted = true;
    getPublicLanguages()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setAvailableLanguages(data);
        } else {
          setAvailableLanguages([
            { id: 1, name: "Hindi" },
            { id: 2, name: "English" },
            { id: 3, name: "Telugu" },
            { id: 4, name: "Tamil" },
            { id: 5, name: "Malayalam" },
            { id: 6, name: "Kannada" },
            { id: 7, name: "Marathi" },
            { id: 8, name: "Bengali" },
            { id: 9, name: "Punjabi" },
            { id: 10, name: "Gujarati" },
            { id: 11, name: "Urdu" }
          ]);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setAvailableLanguages([
          { id: 1, name: "Hindi" },
          { id: 2, name: "English" },
          { id: 3, name: "Telugu" },
          { id: 4, name: "Tamil" },
          { id: 5, name: "Malayalam" },
          { id: 6, name: "Kannada" },
          { id: 7, name: "Marathi" },
          { id: 8, name: "Bengali" },
          { id: 9, name: "Punjabi" },
          { id: 10, name: "Gujarati" },
          { id: 11, name: "Urdu" }
        ]);
      });
    return () => { mounted = false; };
  }, []);

  // Media files
  const [videoFile, setVideoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const videoInputRef = useRef(null);
  const posterInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter a project title");
      return;
    }

    if (!age.trim()) {
      setErrorMsg("Age requirement is mandatory. Please enter required age or age range (e.g. 20-30 or 25+).");
      return;
    }

    if (!gender.trim()) {
      setErrorMsg("Gender requirement is mandatory. Please select required gender.");
      return;
    }

    setSubmitting(true);
    try {
      let uploadedVideoUrl = null;
      let uploadedPosterUrl = null;

      // 1. Upload Video if selected
      if (videoFile) {
        setUploadingMedia(true);
        try {
          const res = await uploadOpportunityMedia(videoFile);
          uploadedVideoUrl = res.fileUrl;
        } catch (err) {
          console.warn("Video upload error:", err);
          uploadedVideoUrl = URL.createObjectURL(videoFile);
        }
      }

      // 2. Upload Poster if selected
      if (posterFile) {
        setUploadingMedia(true);
        try {
          const res = await uploadOpportunityMedia(posterFile);
          uploadedPosterUrl = res.fileUrl;
        } catch (err) {
          console.warn("Poster upload error:", err);
          uploadedPosterUrl = URL.createObjectURL(posterFile);
        }
      }

      if (postType === "CUSTOM" && !customDiscipline.trim()) {
        setErrorMsg("Please specify your custom discipline / post type name.");
        return;
      }

      setUploadingMedia(false);

      let parsedBudget = null;
      const cleanNum = budget.replace(/[^0-9]/g, "");
      if (cleanNum) {
        parsedBudget = parseFloat(cleanNum);
      }

      const resolvedPostType = postType === "CUSTOM"
        ? customDiscipline.trim()
        : postType;
      const resolvedRoleType = postType === "CUSTOM"
        ? "OTHER"
        : roleType;
      const resolvedCustomCraft = postType === "CUSTOM"
        ? (customDiscipline.trim() || customCraft.trim() || null)
        : (customCraft.trim() || null);

      const payload = {
        title: title.trim(),
        projectType: projectType,
        postType: resolvedPostType,
        requiredLanguages: selectedLanguages.join(", "),
        roleType: resolvedRoleType,
        customCraft: resolvedCustomCraft,
        age: age.trim(),
        gender: gender.trim(),
        height: height.trim() || null,
        weight: weight.trim() || null,
        description: description.trim(),
        requirements: requirements.trim(),
        location: location.trim(),
        budget: parsedBudget,
        shootStartDate: shootStartDate || null,
        shootEndDate: shootEndDate || null,
        applicationDeadline: applicationDeadline || null,
        videoUrl: uploadedVideoUrl,
        posterUrl: uploadedPosterUrl || "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80",
        status: "IN_REVIEW"
      };

      const result = await createCastingCall(payload);
      setSuccessMsg("Submitted for review! Sent to Casting Director for approval.");
      showSuccess(
        "Submitted for Review! 🎬",
        "Your casting call has been sent to our Casting Director (Rohit) for review. Once approved, it will be published live to the public."
      );

      setTimeout(() => {
        if (onCreated) onCreated(result);
        emitLiveSync("opportunity_created", result);
        onClose();
      }, 1200);

    } catch (err) {
      setErrorMsg(err.message || "Failed to post opportunity. Please check details.");
      showError("Posting Failed", err.message || "Failed to post opportunity. Please check details.");
    } finally {
      setSubmitting(false);
      setUploadingMedia(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(5px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          border: "1px solid #e2e8f0"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(to right, #fdf4ff, #faf5ff)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff"
            }}>
              <Film size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Post a New Cinema Opportunity / Casting
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Cast talents, hire camera crew, or assemble production partners.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b"
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {errorMsg && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", color: "#dc2626", fontSize: "12.5px" }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", color: "#16a34a", fontSize: "12.5px" }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Row 1: Title & Project Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "5px" }}>
                Project / Film Title <span style={{ color: "#ee008f" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shadows of Truth (Feature Film)"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "5px" }}>
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", background: "#ffffff" }}
              >
                {PROJECT_TYPES.map(pt => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Discipline / Post Type Selector */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "800", color: "#334155", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <span>🎭</span> Casting Discipline / Post Type <span style={{ color: "#ee008f" }}>*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
              {[
                { type: "ACTING", label: "Acting", icon: "🎭" },
                { type: "SINGING", label: "Singing", icon: "🎤" },
                { type: "DANCING", label: "Dancing", icon: "💃" },
                { type: "MODELING", label: "Modeling", icon: "✨" },
                { type: "CREW", label: "Crew & Tech", icon: "🎬" },
                { type: "CUSTOM", label: "Custom +", icon: "➕" },
              ].map(item => {
                const isSel = postType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setPostType(item.type)}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "10px",
                      border: isSel ? "2px solid #ee008f" : "1px solid #cbd5e1",
                      backgroundColor: isSel ? "#fdf2f8" : "#ffffff",
                      color: isSel ? "#be185d" : "#475569",
                      fontWeight: isSel ? "800" : "600",
                      fontSize: "11.5px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "3px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {postType === "CUSTOM" && (
              <div style={{ marginTop: "10px", padding: "10px 14px", backgroundColor: "#fffbeb", borderRadius: "10px", border: "1.5px dashed #f59e0b" }}>
                <label style={{ fontSize: "11.5px", fontWeight: "800", color: "#b45309", display: "block", marginBottom: "4px" }}>
                  Specify Custom Discipline / Post Type <span style={{ color: "#ee008f" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customDiscipline}
                  onChange={(e) => setCustomDiscipline(e.target.value)}
                  placeholder="e.g. Voiceover Artist, Stunts, Stand-up Comedy, Musician, Scriptwriter"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d97706",
                    fontSize: "13px",
                    backgroundColor: "#ffffff",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
                <div style={{ fontSize: "11px", color: "#92400e", marginTop: "4px" }}>
                  🌟 This custom discipline will be displayed on the notice and filterable across the casting desk.
                </div>
              </div>
            )}
          </div>

          {/* Row: Required Audition / Performance Languages */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "800", color: "#334155", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Globe size={14} color="#7c3aed" /> Required Audition & Performance Languages
              </span>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#7c3aed" }}>
                {selectedLanguages.length} selected
              </span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "110px", overflowY: "auto", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              {availableLanguages.map(lang => {
                const langName = typeof lang === "string" ? lang : lang.name;
                const isSel = selectedLanguages.includes(langName);
                return (
                  <button
                    key={lang.id || langName}
                    type="button"
                    onClick={() => {
                      if (isSel) {
                        setSelectedLanguages(selectedLanguages.filter(l => l !== langName));
                      } else {
                        setSelectedLanguages([...selectedLanguages, langName]);
                      }
                    }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "16px",
                      fontSize: "11px",
                      fontWeight: isSel ? "800" : "600",
                      border: isSel ? "1.5px solid #7c3aed" : "1px solid #cbd5e1",
                      backgroundColor: isSel ? "#7c3aed" : "#ffffff",
                      color: isSel ? "#ffffff" : "#475569",
                      cursor: "pointer",
                      transition: "all 0.1s ease"
                    }}
                  >
                    {isSel ? "✓ " : "+ "}{langName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Craft Required & Custom Craft */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "5px" }}>
                Talent / Craft Needed <span style={{ color: "#ee008f" }}>*</span>
              </label>
              <select
                value={roleType}
                onChange={(e) => {
                  setRoleType(e.target.value);
                  if (e.target.value !== "OTHER") setCustomCraft("");
                }}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", background: "#ffffff" }}
              >
                {CRAFT_ROLES.map(cr => (
                  <option key={cr.label} value={cr.value}>{cr.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "5px" }}>
                Specific Craft / Role Name
              </label>
              <input
                type="text"
                value={customCraft}
                onChange={(e) => setCustomCraft(e.target.value)}
                placeholder="e.g. Lead Female, 1st AC, Colorist"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Row 2.5: Talent Demographics (Age & Gender Mandatory, Height & Weight Optional) */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>👤</span> Talent Criteria & Physical Profile
            </div>

            {/* Age (Mandatory) & Gender (Mandatory) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                  Age / Age Range <span style={{ color: "#ee008f", fontWeight: "800" }}>* (Mandatory)</span>
                </label>
                <input
                  type="text"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 20-30 or 25 years"
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box", background: "#ffffff" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                  Gender <span style={{ color: "#ee008f", fontWeight: "800" }}>* (Mandatory)</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box", background: "#ffffff" }}
                >
                  <option value="Any">Any / All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender / Non-Binary">Transgender / Non-Binary</option>
                </select>
              </div>
            </div>

            {/* Height (Optional) & Weight (Optional) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
                  Height <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 5'10&quot; or 178 cm"
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box", background: "#ffffff" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
                  Weight <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 65 kg or Athletic"
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box", background: "#ffffff" }}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Budget & Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "5px" }}>
                Budget / Remuneration (₹)
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 75,000 or ₹ 50K - 1 Lakh"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "5px" }}>
                Location / Shoot Base
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Bangalore, Outdoor"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Row 4: Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
                Audition Deadline
              </label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
                Shoot Start Date
              </label>
              <input
                type="date"
                value={shootStartDate}
                onChange={(e) => setShootStartDate(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
                Shoot End Date
              </label>
              <input
                type="date"
                value={shootEndDate}
                onChange={(e) => setShootEndDate(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Row 5: VIDEO & MEDIA ATTACHMENTS (HIGHLIGHTED CINEMA FEATURE) */}
          <div style={{
            background: "#fdf2f8",
            border: "1.5px dashed #f472b6",
            borderRadius: "14px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>📹</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#831843" }}>
                    Attach Audition Reference Video & Project Poster
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#9d174d" }}>
                    Upload a scene monologue script video or mood teaser so applicants can view the audition tape.
                  </div>
                </div>
              </div>
              <span style={{ background: "#ee008f", color: "#ffffff", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "6px" }}>
                Cinema Media
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              {/* Video upload button */}
              <input
                type="file"
                ref={videoInputRef}
                style={{ display: "none" }}
                accept="video/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setVideoFile(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #f472b6",
                  color: "#be185d",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <Video size={14} />
                <span>{videoFile ? `✓ ${videoFile.name} (${Math.round(videoFile.size / (1024 * 1024))}MB)` : "+ Choose Audition Video (MP4)"}</span>
              </button>

              {/* Poster upload button */}
              <input
                type="file"
                ref={posterInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPosterFile(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => posterInputRef.current?.click()}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  color: "#475569",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <Upload size={14} />
                <span>{posterFile ? `✓ ${posterFile.name}` : "+ Add Poster Image"}</span>
              </button>
            </div>
          </div>

          {/* Row 6: Description & Requirements */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "5px" }}>
              Role Synopsis & Story Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a short synopsis of the story, role background, and tone of the character..."
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "5px" }}>
              Audition Guidelines & Requirements (Monologue instructions, languages, etc.)
            </label>
            <textarea
              rows={2}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g. Prepare a 2-minute dramatic monologue; Fluent in Hindi; Height 5'9+..."
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box" }}
            />
          </div>

          {/* Footer Submit Buttons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "12px",
            borderTop: "1px solid #f1f5f9"
          }}>
            <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
              {uploadingMedia ? "Uploading video clip..." : "Saved securely to MySQL database"}
            </span>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  color: "#475569"
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 24px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#ffffff",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(238, 0, 143, 0.25)"
                }}
              >
                {submitting ? "Publishing Opportunity..." : "Publish Opportunity 🎬"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
