/* ── CreateCastingModal.jsx ──────────────────────────────────
   Modal form to create a new casting call project.
   ────────────────────────────────────────────────────────── */

import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { createCastingCall } from "../../services/api";

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
  const [roleType, setRoleType] = useState("MODEL");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("Mumbai");
  const [shootStartDate, setShootStartDate] = useState("");
  const [shootEndDate, setShootEndDate] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a casting title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createCastingCall({
        title: title.trim(),
        projectType,
        roleType,
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
