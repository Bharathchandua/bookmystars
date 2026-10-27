import React, { useState, useEffect } from "react";
import { Plus, X, Sparkles, Check, RefreshCw } from "lucide-react";
import { getPublicSkills } from "../../features/bms/api/skills/skillsApi";
import { onLiveSync } from "../../shared/utils/liveSync";

const FALLBACK_SKILLS = [
  "Comedy",
  "Dancing",
  "Singing",
  "Screenplay",
  "Action Stunts",
  "Direction",
  "Voice Over",
  "Martial Arts",
  "Lyrics Writing",
  "Choreography",
  "Standup Comedy",
  "Cinematography",
  "Mimicry",
  "Playback Singing"
];

export default function SkillManagementModal({
  isOpen,
  onClose,
  skills = [],
  onAddSkill,
  onRemoveSkill
}) {
  const [customSkill, setCustomSkill] = useState("");
  const [error, setError] = useState("");
  const [masterSkills, setMasterSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  const fetchSkills = async () => {
    try {
      setLoadingSkills(true);
      const data = await getPublicSkills();
      if (Array.isArray(data) && data.length > 0) {
        setMasterSkills(data);
      }
    } catch (err) {
      console.warn("Failed to fetch skills:", err);
    } finally {
      setLoadingSkills(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSkills();
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = onLiveSync(["skills_updated"], () => {
      fetchSkills();
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleAdd = (skillName) => {
    const trimmed = (skillName || "").trim();
    if (!trimmed) return;

    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" is already added to your skills.`);
      return;
    }

    setError("");
    onAddSkill(trimmed);
    setCustomSkill("");
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    handleAdd(customSkill);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          border: "1px solid #e2e8f0"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #fce7f3 0%, #fae8ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ee008f"
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                Add Specialized Skills
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                Enrich your profile with versatile crafts and talents
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f8fafc",
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

        {/* Content Body */}
        <div style={{ padding: "20px 24px" }}>
          {/* Custom Input */}
          <form onSubmit={handleCustomSubmit} style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "6px"
              }}
            >
              Type Custom Skill
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="e.g. Comedy, Dancing, Screenplay..."
                value={customSkill}
                onChange={(e) => {
                  setCustomSkill(e.target.value);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "13.5px",
                  outline: "none"
                }}
              />
              <button
                type="submit"
                disabled={!customSkill.trim()}
                style={{
                  background: customSkill.trim() ? "#ee008f" : "#f1f5f9",
                  color: customSkill.trim() ? "#ffffff" : "#94a3b8",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0 18px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: customSkill.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            {error && (
              <p style={{ color: "#ef4444", fontSize: "12px", margin: "6px 0 0 0", fontWeight: "600" }}>
                {error}
              </p>
            )}
          </form>

          {/* Current Skills Added */}
          <div style={{ marginBottom: "22px" }}>
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>Your Active Skills ({skills.length}):</span>
              {skills.length === 0 && (
                <span style={{ color: "#94a3b8", fontWeight: "500" }}>No skills added yet</span>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", minHeight: "36px" }}>
              {skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1.5px solid #bbf7d0",
                    borderRadius: "20px",
                    fontSize: "12.5px",
                    fontWeight: "700"
                  }}
                >
                  <Check size={13} />
                  {skill}
                  <button
                    type="button"
                    onClick={() => onRemoveSkill(skill)}
                    title={`Remove ${skill}`}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#166534",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Master Skills to Pick From (Live from Database) */}
          <div>
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span>Popular Creative Skills:</span>
              {loadingSkills && (
                <span style={{ fontSize: "11px", color: "#ee008f", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <RefreshCw size={11} className="animate-spin" /> Live Syncing...
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {(masterSkills.length > 0 ? masterSkills.map(m => m.name) : FALLBACK_SKILLS).map((suggested) => {
                const isAdded = skills.some(
                  (s) => s.toLowerCase() === suggested.toLowerCase()
                );
                return (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => {
                      if (!isAdded) handleAdd(suggested);
                    }}
                    disabled={isAdded}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      background: isAdded ? "#f8fafc" : "#ffffff",
                      color: isAdded ? "#94a3b8" : "#334155",
                      border: isAdded ? "1px dashed #cbd5e1" : "1px solid #cbd5e1",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: isAdded ? "default" : "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {isAdded ? "✓ " : "+ "}
                    {suggested}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "flex-end",
            background: "#f8fafc",
            borderBottomLeftRadius: "16px",
            borderBottomRightRadius: "16px"
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 20px",
              background: "#1e293b",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
