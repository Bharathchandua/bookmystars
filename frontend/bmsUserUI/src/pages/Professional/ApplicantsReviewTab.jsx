/* ── ApplicantsReviewTab.jsx ──────────────────────────────────
   Review candidate submissions for casting calls with filtering,
   profile details, and stage actions (Shortlist, Hire, Reject).
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import { 
  Users, CheckCircle2, Clock, XCircle, Award, 
  MapPin, IndianRupee, MessageSquare, Loader2, Sparkles 
} from "lucide-react";
import { getMyCastingCalls } from "../../features/bms/api/opportunities/opportunitiesApi";
import { getApplicantsForCasting, updateApplicantStatus } from "../../features/bms/api/opportunities/castingApplicationsApi";
import { showSuccess, showError } from "../../shared/utils/alert";

const STATUS_FILTERS = [
  { label: "All Applicants", value: "ALL" },
  { label: "Applied", value: "APPLIED" },
  { label: "Shortlisted", value: "SHORTLISTED" },
  { label: "Hired", value: "HIRED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function ApplicantsReviewTab({ initialCastingId = null }) {
  const [castings, setCastings] = useState([]);
  const [selectedCastingId, setSelectedCastingId] = useState(initialCastingId);
  const [applicants, setApplicants] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoadingCastings, setIsLoadingCastings] = useState(true);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Load available casting calls
  useEffect(() => {
    async function loadCastings() {
      setIsLoadingCastings(true);
      try {
        const data = await getMyCastingCalls();
        const list = Array.isArray(data) ? data : [];
        setCastings(list);
        if (list.length > 0 && !selectedCastingId) {
          setSelectedCastingId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load casting calls:", err);
      } finally {
        setIsLoadingCastings(false);
      }
    }
    loadCastings();
  }, [selectedCastingId]);

  // Load applicants whenever selected casting changes
  const loadApplicants = useCallback(async () => {
    if (!selectedCastingId) {
      setApplicants([]);
      return;
    }
    setIsLoadingApplicants(true);
    try {
      const data = await getApplicantsForCasting(selectedCastingId);
      setApplicants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load applicants:", err);
    } finally {
      setIsLoadingApplicants(false);
    }
  }, [selectedCastingId]);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await updateApplicantStatus(applicationId, newStatus);
      setApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );
      showSuccess("Status Updated", `Applicant status changed to ${newStatus}.`);
    } catch (err) {
      showError("Update Failed", err.message || "Failed to update applicant status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    if (statusFilter === "ALL") return true;
    return app.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "SHORTLISTED":
        return <span className="casting-badge casting-badge--open" style={{ background: "#fef3c7", color: "#92400e" }}>⭐ Shortlisted</span>;
      case "HIRED":
        return <span className="casting-badge casting-badge--open" style={{ background: "#dcfce7", color: "#166534" }}>🎉 Hired</span>;
      case "REJECTED":
        return <span className="casting-badge casting-badge--closed" style={{ background: "#fee2e2", color: "#991b1b" }}>❌ Rejected</span>;
      case "APPLIED":
      default:
        return <span className="casting-badge casting-badge--open" style={{ background: "#e0e7ff", color: "#3730a3" }}>Applied</span>;
    }
  };

  if (isLoadingCastings) {
    return (
      <div className="empty-state">
        <Loader2 size={36} className="animate-spin" style={{ color: "#4f46e5", marginBottom: 12 }} />
        <p>Loading casting calls...</p>
      </div>
    );
  }

  if (castings.length === 0) {
    return (
      <div className="empty-state">
        <Users size={48} style={{ color: "#94a3b8", marginBottom: 14 }} />
        <h4 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>No Casting Calls Found</h4>
        <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748b" }}>
          You have not created any casting calls yet. Create one under the Casting Calls tab first to receive applications.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Top selector and filter row */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
            Select Casting Call
          </label>
          <select
            value={selectedCastingId || ""}
            onChange={(e) => setSelectedCastingId(Number(e.target.value))}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid #cbd5e1",
              fontSize: 14,
              fontWeight: 600,
              color: "#0f172a",
              background: "#fff",
              minWidth: 280,
              cursor: "pointer",
            }}
          >
            {castings.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.totalApplicants || 0} applicants)
              </option>
            ))}
          </select>
        </div>

        {/* Status filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`talent-cat-pill ${statusFilter === f.value ? "talent-cat-pill--active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applicants List */}
      {isLoadingApplicants ? (
        <div className="empty-state">
          <Loader2 size={32} className="animate-spin" style={{ color: "#4f46e5", marginBottom: 10 }} />
          <p>Fetching applicants for this casting call...</p>
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div className="empty-state">
          <Users size={44} style={{ color: "#94a3b8", marginBottom: 12 }} />
          <h4 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700 }}>
            No applicants found
          </h4>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {statusFilter === "ALL" 
              ? "No talents have applied to this casting call yet." 
              : `No applicants currently in "${statusFilter}" status.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredApplicants.map((app) => (
            <div
              key={app.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "18px 20px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
              }}
            >
              {/* Candidate Info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 260 }}>
                {app.profilePhotoUrl ? (
                  <img
                    src={app.profilePhotoUrl}
                    alt={app.applicantName}
                    style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {app.applicantName?.charAt(0) || "T"}
                  </div>
                )}

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                      {app.applicantName}
                    </h4>
                    {getStatusBadge(app.status)}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4, fontSize: 12, color: "#64748b" }}>
                    {app.profileType && (
                      <span style={{ fontWeight: 600, color: "#4f46e5" }}>{app.profileType}</span>
                    )}
                    {app.city && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <MapPin size={12} /> {app.city}
                      </span>
                    )}
                    {app.dayRate && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <IndianRupee size={12} /> {app.dayRate}/day
                      </span>
                    )}
                  </div>
                  {app.coverNote && (
                    <div style={{ marginTop: 8, fontSize: 13, color: "#334155", background: "#f8fafc", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #6366f1" }}>
                      <span style={{ fontWeight: 600, color: "#475569" }}>Pitch: </span>
                      {app.coverNote}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                {updatingId === app.id ? (
                  <Loader2 size={18} className="animate-spin" style={{ color: "#4f46e5" }} />
                ) : (
                  <>
                    {app.status !== "SHORTLISTED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(app.id, "SHORTLISTED")}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 8,
                          border: "1px solid #f59e0b",
                          background: "#fffbeb",
                          color: "#b45309",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ⭐ Shortlist
                      </button>
                    )}
                    {app.status !== "HIRED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(app.id, "HIRED")}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 8,
                          border: "1px solid #10b981",
                          background: "#ecfdf5",
                          color: "#047857",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        🎉 Hire
                      </button>
                    )}
                    {app.status !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(app.id, "REJECTED")}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 8,
                          border: "1px solid #f43f5e",
                          background: "#fff1f2",
                          color: "#be123c",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ❌ Reject
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
