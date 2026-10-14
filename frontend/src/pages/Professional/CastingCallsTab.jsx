/* ── CastingCallsTab.jsx ──────────────────────────────────────
   Management tab for active and closed casting call notices.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import { Plus, Users, Calendar, MapPin, Trash2, Eye, Loader2, Megaphone } from "lucide-react";
import { getMyCastingCalls, deleteCastingCall, updateCastingCall } from "../../services/api";
import CreateCastingModal from "./CreateCastingModal";

export default function CastingCallsTab({ onSelectCastingForReview }) {
  const [castings, setCastings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCastings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyCastingCalls();
      setCastings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching casting calls:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCastings();
  }, [fetchCastings]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the casting call "${title}"?`)) return;
    try {
      await deleteCastingCall(id);
      fetchCastings();
    } catch (err) {
      alert("Failed to delete casting call: " + err.message);
    }
  };

  const handleToggleStatus = async (casting) => {
    const newStatus = casting.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      await updateCastingCall(casting.id, {
        ...casting,
        status: newStatus,
      });
      fetchCastings();
    } catch (err) {
      alert("Failed to change status: " + err.message);
    }
  };

  return (
    <div>
      {/* Top action row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            My Casting Calls & Auditions
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Create projects, review talent submissions, and hire for shoots.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: "9px 16px",
            borderRadius: 10,
            background: "#e91e8c",
            color: "#fff",
            border: "none",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={16} /> Post New Casting Call
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <Loader2 size={24} className="spin" style={{ margin: "0 auto 10px auto" }} />
          <p style={{ margin: 0 }}>Loading your casting calls...</p>
        </div>
      ) : castings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
          <Megaphone size={36} style={{ color: "#94a3b8", margin: "0 auto 12px auto" }} />
          <h4 style={{ margin: "0 0 6px 0", color: "#1e293b" }}>No Casting Calls Posted Yet</h4>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
            Post a project to start receiving auditions, portfolios, and quotes from models, actors, and artists.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{ padding: "8px 16px", borderRadius: 8, background: "#0f172a", color: "#fff", border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
          >
            Post Your First Casting Call
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
          {castings.map((c) => (
            <div
              key={c.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 10.5,
                      fontWeight: 800,
                      background: c.status === "OPEN" ? "#dcfce7" : "#f1f5f9",
                      color: c.status === "OPEN" ? "#15803d" : "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    {c.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.title)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2 }}
                    title="Delete casting call"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h4 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                  {c.title}
                </h4>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, background: "#fdf2f8", color: "#db2777", padding: "2px 7px", borderRadius: 4 }}>
                    {c.roleType}
                  </span>
                  {c.projectType && (
                    <span style={{ fontSize: 11, fontWeight: 600, background: "#f1f5f9", color: "#475569", padding: "2px 7px", borderRadius: 4 }}>
                      {c.projectType}
                    </span>
                  )}
                  {c.location && (
                    <span style={{ fontSize: 11, fontWeight: 600, background: "#f1f5f9", color: "#475569", padding: "2px 7px", borderRadius: 4, display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={10} /> {c.location}
                    </span>
                  )}
                </div>

                {c.description && (
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 14px 0", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {c.description}
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#475569", fontWeight: 700, padding: "8px 10px", background: "#f8fafc", borderRadius: 8, marginBottom: 14 }}>
                  <span>Budget: {c.budget ? `₹${c.budget.toLocaleString()}` : "Discussable"}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#e91e8c" }}>
                    <Users size={12} /> {c.applicantCount} Applicant{c.applicantCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                <button
                  type="button"
                  onClick={() => onSelectCastingForReview && onSelectCastingForReview(c.id)}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "#0f172a",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Eye size={13} /> Review Applicants ({c.applicantCount})
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(c)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                    fontWeight: 700,
                    fontSize: 11.5,
                    cursor: "pointer",
                  }}
                >
                  {c.status === "OPEN" ? "Close" : "Re-open"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <CreateCastingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCastings}
      />
    </div>
  );
}
