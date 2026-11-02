import { useState, useRef } from "react";
import { X, Upload, Video, Film, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { updateCastingCall, uploadOpportunityMedia } from "../../features/bms/api/opportunities/opportunitiesApi";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";
import { showSuccess, showError, showWarning } from "../../shared/utils/alert";

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

export default function EditOpportunityModal({ opp, onClose, onSaved }) {
  if (!opp) return null;

  const [title, setTitle] = useState(opp.title || "");
  const [projectType, setProjectType] = useState(opp.projectType || opp.type || "Feature Film");
  const [roleType, setRoleType] = useState(opp.roleType || "ACTOR");
  const [customCraft, setCustomCraft] = useState(opp.customCraft || "");
  const [location, setLocation] = useState(opp.location || "Mumbai");
  const [budget, setBudget] = useState(opp.budget != null ? String(opp.budget) : "");
  const [shootStartDate, setShootStartDate] = useState(opp.shootStartDate ? String(opp.shootStartDate).slice(0, 10) : "");
  const [shootEndDate, setShootEndDate] = useState(opp.shootEndDate ? String(opp.shootEndDate).slice(0, 10) : "");
  const [applicationDeadline, setApplicationDeadline] = useState(
    opp.applicationDeadline ? String(opp.applicationDeadline).slice(0, 10) : (opp.auditionDate ? String(opp.auditionDate).slice(0, 10) : "")
  );
  const [description, setDescription] = useState(opp.fullDesc || opp.description || "");
  const [requirements, setRequirements] = useState(
    Array.isArray(opp.requirements) ? opp.requirements.join("\n") : (opp.requirements || "")
  );

  // Demographics
  const [age, setAge] = useState(opp.age || "");
  const [gender, setGender] = useState(opp.gender || "Any");
  const [height, setHeight] = useState(opp.height || "");
  const [weight, setWeight] = useState(opp.weight || "");
  const [status, setStatus] = useState(opp.status || "OPEN");

  // Media
  const [existingPosterUrl, setExistingPosterUrl] = useState(opp.posterUrl || opp.banner || null);
  const [existingVideoUrl, setExistingVideoUrl] = useState(opp.videoUrl || null);
  const [posterFile, setPosterFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

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
      let finalVideoUrl = existingVideoUrl;
      let finalPosterUrl = existingPosterUrl;

      // 1. Upload new video if selected
      if (videoFile) {
        setUploadingMedia(true);
        try {
          const res = await uploadOpportunityMedia(videoFile);
          finalVideoUrl = res.fileUrl;
        } catch (err) {
          console.warn("Video upload fallback:", err);
          finalVideoUrl = URL.createObjectURL(videoFile);
        }
      }

      // 2. Upload new poster if selected
      if (posterFile) {
        setUploadingMedia(true);
        try {
          const res = await uploadOpportunityMedia(posterFile);
          finalPosterUrl = res.fileUrl;
        } catch (err) {
          console.warn("Poster upload fallback:", err);
          finalPosterUrl = URL.createObjectURL(posterFile);
        }
      }

      setUploadingMedia(false);

      let parsedBudget = null;
      if (budget) {
        const cleanNum = String(budget).replace(/[^0-9.]/g, "");
        if (cleanNum) parsedBudget = parseFloat(cleanNum);
      }

      const payload = {
        title: title.trim(),
        projectType,
        roleType,
        customCraft: customCraft.trim() || null,
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
        videoUrl: finalVideoUrl,
        posterUrl: finalPosterUrl,
        status: status || "OPEN"
      };

      const updated = await updateCastingCall(opp.id, payload);
      const mergedOpp = {
        ...opp,
        ...updated,
        ...payload,
        banner: finalPosterUrl || opp.banner,
        posterUrl: finalPosterUrl,
        videoUrl: finalVideoUrl,
        type: projectType,
        auditionDate: applicationDeadline || shootStartDate || "Open"
      };

      setSuccessMsg("Opportunity updated successfully! Synchronized with database.");
      showSuccess("Opportunity Updated!", `"${title.trim()}" has been updated successfully.`);

      window.dispatchEvent(new Event("opportunity_created"));
      if (onSaved) onSaved(mergedOpp);

      setTimeout(() => {
        onClose();
      }, 700);

    } catch (err) {
      setErrorMsg(err.message || "Failed to update opportunity.");
      showError("Update Failed", err.message || "Failed to update opportunity.");
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
        zIndex: 999999,
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
                Edit Cinema Opportunity / Manage Call
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Update project requirements, talent criteria, budget, and media.
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
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box", background: "#ffffff" }}
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
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box", background: "#ffffff" }}
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
                placeholder="e.g. 75,000"
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
                placeholder="e.g. Mumbai, Bangalore"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Row 4: Dates & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
                Deadline
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
                Shoot Start
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
                Shoot End
              </label>
              <input
                type="date"
                value={shootEndDate}
                onChange={(e) => setShootEndDate(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box", background: "#ffffff" }}
              >
                <option value="OPEN">🟢 Open</option>
                <option value="IN_REVIEW">🟡 In Review</option>
                <option value="CLOSED">🔴 Closed</option>
              </select>
            </div>
          </div>

          {/* Row 5: Media Attachments (Poster Photo & Video Reel) */}
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
                    Audition Reference Video & Project Poster Photo
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#9d174d" }}>
                    Keep existing media or upload new photo/video files.
                  </div>
                </div>
              </div>
              <span style={{ background: "#ee008f", color: "#ffffff", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "6px" }}>
                Cinema Media
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
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
                <span>
                  {posterFile
                    ? `✓ New: ${posterFile.name}`
                    : (existingPosterUrl ? "✓ Keep Poster (Click to Change)" : "+ Add Poster Image")}
                </span>
              </button>

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
                <span>
                  {videoFile
                    ? `✓ New Video: ${videoFile.name} (${Math.round(videoFile.size / (1024 * 1024))}MB)`
                    : (existingVideoUrl ? "✓ Audition Reel Attached (Click to Replace)" : "+ Add Audition Video (MP4)")}
                </span>
              </button>
            </div>
          </div>

          {/* Row 6: Description & Requirements */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "5px" }}>
              Role Synopsis & Story Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a short synopsis of the story, role background..."
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "5px" }}>
              Audition Guidelines & Requirements
            </label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Monologue instructions, languages, criteria..."
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
              {uploadingMedia ? "Uploading media file..." : "Synchronized directly to PostgreSQL database"}
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
                  boxShadow: "0 4px 12px rgba(238, 0, 143, 0.25)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving Changes...
                  </>
                ) : (
                  "Save Changes 💾"
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
