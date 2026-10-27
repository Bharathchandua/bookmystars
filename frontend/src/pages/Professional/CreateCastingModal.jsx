/* ── CreateCastingModal.jsx ──────────────────────────────────
   Modal form to create a new casting call project.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles, Globe } from "lucide-react";
import { createCastingCall } from "../../features/bms/api/opportunities/opportunitiesApi";
import { getPublicLanguages } from "../../features/bms/api/languages/languagesApi";

const ROLE_TYPES = [
  { label: "Actor", value: "ACTOR" },
  { label: "Fashion / Commercial Model", value: "MODEL" },
  { label: "Singer / Vocalist", value: "SINGER" },
  { label: "Dancer / Performer", value: "DANCER" },
  { label: "Director", value: "DIRECTOR" },
  { label: "Other Talent", value: "OTHER" },
];

export default function CreateCastingModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState("Commercial Campaign");
  const [postType, setPostType] = useState("ACTING");
  const [customDiscipline, setCustomDiscipline] = useState("");
  const [roleType, setRoleType] = useState("MODEL");
  const [selectedLanguages, setSelectedLanguages] = useState(["Hindi", "English"]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("Mumbai");
  const [shootStartDate, setShootStartDate] = useState("");
  const [shootEndDate, setShootEndDate] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
            { id: 8, name: "Bengali" }
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
          { id: 8, name: "Bengali" }
        ]);
      });
    return () => { mounted = false; };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a casting title.");
      return;
    }

    if (postType === "CUSTOM" && !customDiscipline.trim()) {
      setError("Please specify your custom discipline / post type name.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const resolvedPostType = postType === "CUSTOM" ? customDiscipline.trim() : postType;
    const resolvedRoleType = postType === "CUSTOM" ? "OTHER" : roleType;
    const resolvedCustomCraft = postType === "CUSTOM" ? customDiscipline.trim() : null;

    try {
      await createCastingCall({
        title: title.trim(),
        projectType,
        postType: resolvedPostType,
        requiredLanguages: selectedLanguages.join(", "),
        roleType: resolvedRoleType,
        customCraft: resolvedCustomCraft,
        budget: budget ? parseFloat(budget) : null,
        location,
        shootStartDate: shootStartDate || null,
        shootEndDate: shootEndDate || null,
        applicationDeadline: applicationDeadline || null,
        description: description.trim(),
        requirements: requirements.trim(),
        status: "OPEN",
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to post casting call");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pro-modal-overlay">
      <div className="pro-modal-card">
        <div className="pro-modal-header">
          <h4 className="pro-modal-title">Post New Casting Call</h4>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: "10px", background: "#fef2f2", color: "#b91c1c", borderRadius: 8, fontSize: 12.5, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
              Project / Casting Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Female Model for Summer Fashion Campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>

          {/* Discipline / Post Type Selector */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#475569" }}>
              Casting Discipline / Post Type *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
              {[
                { type: "ACTING", label: "Acting", icon: "🎭" },
                { type: "SINGING", label: "Singing", icon: "🎤" },
                { type: "DANCING", label: "Dancing", icon: "💃" },
                { type: "MODELING", label: "Modeling", icon: "✨" },
                { type: "CREW", label: "Crew", icon: "🎬" },
                { type: "CUSTOM", label: "Custom +", icon: "➕" },
              ].map(item => {
                const isSel = postType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setPostType(item.type)}
                    style={{
                      padding: "6px 2px",
                      borderRadius: 8,
                      border: isSel ? "1.5px solid #e91e8c" : "1px solid #cbd5e1",
                      backgroundColor: isSel ? "#fdf2f8" : "#ffffff",
                      color: isSel ? "#be185d" : "#475569",
                      fontWeight: isSel ? "800" : "600",
                      fontSize: 11,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {postType === "CUSTOM" && (
              <div style={{ marginTop: 8, padding: "10px 12px", backgroundColor: "#fffbeb", borderRadius: 8, border: "1.5px dashed #f59e0b" }}>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, marginBottom: 4, color: "#b45309" }}>
                  Custom Discipline / Post Type Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Voiceover Artist, Stunt Performer, Musician, Scriptwriter"
                  value={customDiscipline}
                  onChange={(e) => setCustomDiscipline(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #d97706", fontSize: 12.5, boxSizing: "border-box", backgroundColor: "#ffffff" }}
                />
                <div style={{ fontSize: "10.5px", color: "#92400e", marginTop: 4 }}>
                  🌟 This custom discipline will be saved with the post and displayed on your casting notice.
                </div>
              </div>
            )}
          </div>

          {/* Required Languages */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Globe size={13} color="#7c3aed" /> Required Audition Languages
              </span>
              <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700 }}>
                {selectedLanguages.length} selected
              </span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 90, overflowY: "auto", padding: "6px 8px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
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
                      padding: "3px 8px",
                      borderRadius: 14,
                      fontSize: 11,
                      fontWeight: isSel ? "800" : "500",
                      border: isSel ? "1px solid #7c3aed" : "1px solid #cbd5e1",
                      backgroundColor: isSel ? "#7c3aed" : "#ffffff",
                      color: isSel ? "#ffffff" : "#475569",
                      cursor: "pointer"
                    }}
                  >
                    {isSel ? "✓ " : "+ "}{langName}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
                Role Category *
              </label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
              >
                {ROLE_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
                Project Type
              </label>
              <input
                type="text"
                placeholder="e.g. TV Commercial, Runway, Feature Film"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
                Shoot Location
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai / Pune Studio"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
                Budget / Compensation (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 45000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
                Shoot Start
              </label>
              <input
                type="date"
                value={shootStartDate}
                onChange={(e) => setShootStartDate(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
                Shoot End
              </label>
              <input
                type="date"
                value={shootEndDate}
                onChange={(e) => setShootEndDate(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
                Deadline
              </label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
              Project Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the campaign, concept, role character brief, and mood..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12.5, boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#475569" }}>
              Physical & Skill Requirements
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Height 5'9+, comfortable with high fashion footwear, runway experience preferred..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12.5, boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#e91e8c", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              {isSubmitting ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
              <span>{isSubmitting ? "Posting..." : "Publish Casting Call"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
