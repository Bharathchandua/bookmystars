import PagesButton from "../common/PagesButton";
import PagesCard from "../common/PagesCard";
import { useState } from "react";
import { MapPin, CalendarDays, IndianRupee, Bookmark, ChevronDown, Trash2, Edit } from "lucide-react";

import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";
import { deleteCastingCall } from "../../features/bms/api/opportunities/opportunitiesApi";
import { confirmDelete, showSuccess, showError } from "../../shared/utils/alert";
import { emitLiveSync } from "../../shared/utils/liveSync";


// ─── Single List Card ──────────────────────
// ─── Single List Card ──────────────────────
function OpportunityListCard({ opp, onOpen, onUpdateBookingStatus }) {
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (deleting) return;
    const confirmed = await confirmDelete(
      "Delete Casting Call?",
      `Are you sure you want to delete "${opp.title}"? This cannot be undone and all applications will be removed.`
    );
    if (confirmed) {
      try {
        setDeleting(true);
        await deleteCastingCall(opp.id);
        showSuccess("Opportunity Deleted", `"${opp.title}" has been deleted.`);
        emitLiveSync("opportunity_deleted", { id: opp.id, title: opp.title });
      } catch (err) {
        showError("Delete Failed", err.message || "Failed to delete opportunity.");
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleStatusChange = async (e, newStatus) => {
    e.stopPropagation();
    if (updating) return;
    try {
      setUpdating(true);
      if (onUpdateBookingStatus) {
        await onUpdateBookingStatus(opp.rawBookingId, newStatus);
      }
    } finally {
      setUpdating(false);
    }
  };

  const bannerImg = opp.banner
    ? (opp.banner.startsWith("http") ? opp.banner : getFullImageUrl(opp.banner))
    : (opp.posterUrl ? (opp.posterUrl.startsWith("http") ? opp.posterUrl : getFullImageUrl(opp.posterUrl)) : "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&auto=format&fit=crop&q=80");

  const isDirect = Boolean(opp.isDirectTargeted);

  return (
    <PagesCard
      className={`opp-list-card ${isDirect ? "opp-direct-highlight" : ""}`}
      onClick={() => onOpen(opp)}
      style={isDirect ? {
        border: "2px solid #f472b6",
        background: "linear-gradient(to right, #ffffff, #fffafd)",
        boxShadow: "0 6px 20px rgba(238, 0, 143, 0.08)"
      } : {}}
    >
      {/* Thumbnail with Video Badge / Direct Badge */}
      <div className="opp-list-thumb" style={{ position: "relative", overflow: "hidden" }}>
        <img src={bannerImg} alt={opp.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        
        {/* Cinema Video Badge if Video Attached */}
        {opp.videoUrl && (
          <div style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            background: "rgba(15, 23, 42, 0.85)",
            color: "#f472b6",
            fontSize: "10.5px",
            fontWeight: "800",
            padding: "3px 8px",
            borderRadius: "6px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)"
          }}>
            <span>▶</span> Audition Video
          </div>
        )}

        {isDirect && (
          <div style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: "900",
            padding: "3px 7px",
            borderRadius: "5px",
            letterSpacing: "0.5px"
          }}>
            🎯 FOR YOU
          </div>
        )}

        {opp.isMyPost && !isDirect && (
          <div style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            background: opp.status === "CLOSED" ? "#dc2626" : opp.status === "IN_REVIEW" ? "#d97706" : "#4f46e5",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: "900",
            padding: "2px 6px",
            borderRadius: "4px",
            letterSpacing: "0.5px"
          }}>
            {opp.status === "CLOSED" ? "MY POST • CLOSED" : opp.status === "IN_REVIEW" ? "MY POST • UNDER REVIEW" : "MY POST • OPEN"}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="opp-list-body">
        {/* Direct Targeted Invitation Banner */}
        {isDirect && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: "900",
            padding: "3px 10px",
            borderRadius: "6px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: "6px",
            width: "fit-content"
          }}>
            🎯 DIRECT INVITATION SPECIFICALLY FOR YOU
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <span className={`opp-type-badge ${opp.badgeClass || "badge-feature-film"}`}>
            {opp.type || opp.projectType || "Feature Film"}
          </span>

          {opp.postType && (
            <span style={{
              fontSize: "11px",
              fontWeight: "800",
              padding: "2px 8px",
              borderRadius: "6px",
              backgroundColor: opp.postType === "SINGING" ? "#fdf2f8" : opp.postType === "DANCING" ? "#faf5ff" : opp.postType === "MODELING" ? "#fff7ed" : opp.postType === "CREW" ? "#eff6ff" : "#ecfeff",
              color: opp.postType === "SINGING" ? "#db2777" : opp.postType === "DANCING" ? "#9333ea" : opp.postType === "MODELING" ? "#ea580c" : opp.postType === "CREW" ? "#2563eb" : "#0891b2",
              border: `1px solid ${opp.postType === "SINGING" ? "#fbcfe8" : opp.postType === "DANCING" ? "#f3e8ff" : opp.postType === "MODELING" ? "#ffedd5" : opp.postType === "CREW" ? "#bfdbfe" : "#cffafe"}`
            }}>
              {opp.postType === "SINGING" ? "🎤 Singing" : opp.postType === "DANCING" ? "💃 Dancing" : opp.postType === "MODELING" ? "✨ Modeling" : opp.postType === "CREW" ? "🎬 Crew" : "🎭 Acting"}
            </span>
          )}

          {opp.requiredLanguages && (
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "2px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span>🌐</span> {opp.requiredLanguages}
            </span>
          )}

          {/* Status Badge */}
          {opp.status === "CLOSED" && (
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "2px 8px", borderRadius: "6px" }}>
              ● Closed
            </span>
          )}
          {(opp.status === "IN_REVIEW" || opp.status === "PENDING") && !isDirect && (
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#d97706", background: "#fffbeb", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: "6px" }}>
              ⏳ Under Review
            </span>
          )}
          {(opp.status === "OPEN" || !opp.status) && !isDirect && (
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "2px 8px", borderRadius: "6px" }}>
              ● Accepting Auditions
            </span>
          )}
          {opp.directorName && (
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "2px 8px", borderRadius: "6px" }}>
              🎬 From: {opp.directorName}
            </span>
          )}
          {opp.customCraft && (
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px" }}>
              {opp.customCraft}
            </span>
          )}
          {(opp.gender || opp.age) && (
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#be185d", background: "#fdf2f8", border: "1px solid #fbcfe8", padding: "2px 8px", borderRadius: "6px" }}>
              👤 {opp.gender ? opp.gender : ""} {opp.age ? `• Age ${opp.age}` : ""}
            </span>
          )}
        </div>
        <h3 className="opp-list-title">{opp.title}</h3>
        <p className="opp-list-desc">{opp.description}</p>

        <div className="opp-list-meta">
          {/* Location */}
          <div className="opp-list-meta-item">
            <MapPin size={14} color="#ee008f" />
            <span className="meta-val">{opp.location || "Location TBD"}</span>
          </div>

          {/* Audition Date */}
          <div className="opp-list-meta-item">
            <CalendarDays size={14} color="#ee008f" />
            <div>
              <span className="meta-label">{isDirect ? "Shoot Date" : "Audition Date"}</span>
              <span className="meta-val">{opp.auditionDate || opp.applicationDeadline || "Open"}</span>
            </div>
          </div>

          {/* Budget */}
          <div className="opp-list-meta-item">
            <IndianRupee size={14} color="#ee008f" />
            <div>
              <span className="meta-label">Budget</span>
              <span className="meta-val" style={{ color: "#16a34a", fontWeight: "800" }}>
                {typeof opp.budget === "number" ? `₹ ${opp.budget.toLocaleString("en-IN")}` : (opp.budget || "Negotiable")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="opp-list-right">
        <div className="opp-list-right-top" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="opp-posted-time">{opp.postedAgo || "Direct Opportunity"}</span>
          <PagesButton
            className={`opp-bookmark-btn ${saved ? "saved" : ""}`}
            onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
            aria-label="Bookmark"
          >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
          </PagesButton>
        </div>

        {opp.isMyPost && !isDirect && (
          <div style={{ fontSize: "11.5px", fontWeight: "800", color: "#4f46e5", margin: "6px 0" }}>
            👥 {opp.applicantCount || 0} Applied
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {isDirect ? (
            <>
              {opp.status === "PENDING" ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => handleStatusChange(e, "DECLINED")}
                    disabled={updating}
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer"
                    }}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleStatusChange(e, "ACCEPTED")}
                    disabled={updating}
                    style={{
                      background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
                      border: "none",
                      color: "#ffffff",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)"
                    }}
                  >
                    ✓ Accept Offer
                  </button>
                </>
              ) : (
                <span style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: opp.status === "ACCEPTED" ? "#f0fdf4" : "#fef2f2",
                  color: opp.status === "ACCEPTED" ? "#16a34a" : "#dc2626",
                  border: `1px solid ${opp.status === "ACCEPTED" ? "#bbf7d0" : "#fecaca"}`
                }}>
                  {opp.status === "ACCEPTED" ? "✓ Accepted" : "✕ Declined"}
                </span>
              )}

              <PagesButton
                className="opp-view-details-btn"
                onClick={(e) => { e.stopPropagation(); onOpen(opp); }}
              >
                View Details
              </PagesButton>
            </>
          ) : (
            <>
              {opp.isMyPost && (
                <>
                  <PagesButton
                    className="opp-edit-action-btn"
                    onClick={(e) => { e.stopPropagation(); onOpen(opp); }}
                    title="Edit / Manage Call"
                    style={{
                      background: "#fdf2f8",
                      border: "1.5px solid #fbcfe8",
                      color: "#be185d",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Edit size={15} />
                  </PagesButton>

                  <PagesButton
                    className="opp-delete-action-btn"
                    onClick={handleDelete}
                    disabled={deleting}
                    title="Delete Opportunity"
                    style={{
                      background: "#fef2f2",
                      border: "1.5px solid #fecaca",
                      color: "#dc2626",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Trash2 size={15} />
                  </PagesButton>
                </>
              )}

              <PagesButton
                className="opp-view-details-btn"
                onClick={(e) => { e.stopPropagation(); onOpen(opp); }}
                style={opp.status === "CLOSED" && !opp.isMyPost ? {
                  background: "#f1f5f9",
                  color: "#64748b",
                  border: "1px solid #cbd5e1"
                } : {}}
              >
                {opp.isMyPost ? "Manage Call" : opp.status === "CLOSED" ? "Closed • View" : "View Details"}
              </PagesButton>
            </>
          )}
        </div>
      </div>
    </PagesCard>
  );
}

// ─── Single Grid Card ──────────────────────
function OpportunityGridCard({ opp, onOpen, onUpdateBookingStatus }) {
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (deleting) return;
    const confirmed = await confirmDelete(
      "Delete Casting Call?",
      `Are you sure you want to delete "${opp.title}"? This cannot be undone and all applications will be removed.`
    );
    if (confirmed) {
      try {
        setDeleting(true);
        await deleteCastingCall(opp.id);
        showSuccess("Opportunity Deleted", `"${opp.title}" has been deleted.`);
        emitLiveSync("opportunity_deleted", { id: opp.id, title: opp.title });
      } catch (err) {
        showError("Delete Failed", err.message || "Failed to delete opportunity.");
      } finally {
        setDeleting(false);
      }
    }
  };

  const bannerImg = opp.banner
    ? (opp.banner.startsWith("http") ? opp.banner : getFullImageUrl(opp.banner))
    : (opp.posterUrl ? (opp.posterUrl.startsWith("http") ? opp.posterUrl : getFullImageUrl(opp.posterUrl)) : "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&auto=format&fit=crop&q=80");

  const isDirect = Boolean(opp.isDirectTargeted);

  return (
    <div
      onClick={() => onOpen(opp)}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: isDirect ? "2px solid #f472b6" : "1px solid #e2e8f0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: isDirect ? "0 8px 24px rgba(238, 0, 143, 0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        position: "relative"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isDirect ? "0 8px 24px rgba(238, 0, 143, 0.1)" : "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      {/* Top Banner Thumbnail */}
      <div style={{ position: "relative", width: "100%", height: "150px", backgroundColor: "#0f172a", overflow: "hidden" }}>
        <img
          src={bannerImg}
          alt={opp.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80";
          }}
        />

        {opp.videoUrl && (
          <div style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            background: "rgba(15, 23, 42, 0.85)",
            color: "#f472b6",
            fontSize: "10px",
            fontWeight: "800",
            padding: "2px 7px",
            borderRadius: "5px",
            backdropFilter: "blur(4px)"
          }}>
            ▶ Audition Video
          </div>
        )}

        {isDirect && (
          <div style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: "900",
            padding: "3px 7px",
            borderRadius: "5px"
          }}>
            🎯 FOR YOU
          </div>
        )}

        {opp.isMyPost && !isDirect && (
          <div style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            background: opp.status === "CLOSED" ? "#dc2626" : opp.status === "IN_REVIEW" ? "#d97706" : "#4f46e5",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: "900",
            padding: "3px 7px",
            borderRadius: "5px"
          }}>
            {opp.status === "CLOSED" ? "CLOSED" : opp.status === "IN_REVIEW" ? "IN REVIEW" : "MY POST"}
          </div>
        )}

        {/* Bookmark top right */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSaved(s => !s); }}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.9)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: saved ? "#ee008f" : "#64748b",
            backdropFilter: "blur(4px)"
          }}
          title={saved ? "Saved" : "Save casting"}
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Card Body */}
      <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "10px", fontWeight: "800", color: "#ee008f", backgroundColor: "#fff1f8", padding: "2px 7px", borderRadius: "5px" }}>
            {opp.type || opp.projectType || "Feature Film"}
          </span>
          {opp.postType && (
            <span style={{
              fontSize: "10px",
              fontWeight: "800",
              padding: "2px 6px",
              borderRadius: "5px",
              backgroundColor: opp.postType === "SINGING" ? "#fdf2f8" : opp.postType === "DANCING" ? "#faf5ff" : opp.postType === "MODELING" ? "#fff7ed" : opp.postType === "CREW" ? "#eff6ff" : "#ecfeff",
              color: opp.postType === "SINGING" ? "#db2777" : opp.postType === "DANCING" ? "#9333ea" : opp.postType === "MODELING" ? "#ea580c" : opp.postType === "CREW" ? "#2563eb" : "#0891b2",
              border: `1px solid ${opp.postType === "SINGING" ? "#fbcfe8" : opp.postType === "DANCING" ? "#f3e8ff" : opp.postType === "MODELING" ? "#ffedd5" : opp.postType === "CREW" ? "#bfdbfe" : "#cffafe"}`
            }}>
              {opp.postType === "SINGING" ? "🎤 Singing" : opp.postType === "DANCING" ? "💃 Dancing" : opp.postType === "MODELING" ? "✨ Modeling" : opp.postType === "CREW" ? "🎬 Crew" : "🎭 Acting"}
            </span>
          )}
          {opp.requiredLanguages && (
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "2px 6px", borderRadius: "5px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <span>🌐</span> {opp.requiredLanguages}
            </span>
          )}
          {opp.directorName && (
            <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#7c3aed" }}>
              🎬 {opp.directorName}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: 0, lineHeight: 1.3 }}>
          {opp.title}
        </h3>

        <p style={{
          fontSize: "12px",
          color: "#64748b",
          margin: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          lineHeight: 1.4
        }}>
          {opp.description}
        </p>

        <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #f8fafc", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
            <span style={{ color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={12} color="#ee008f" /> {opp.location || "Location TBD"}
            </span>
            <span style={{ fontWeight: "800", color: "#16a34a", fontSize: "12px" }}>
              {typeof opp.budget === "number" ? `₹ ${opp.budget.toLocaleString("en-IN")}` : (opp.budget || "Negotiable")}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10.5px", color: "#94a3b8" }}>
            <span>{opp.auditionDate ? `Audition: ${opp.auditionDate}` : "Open Auditions"}</span>
            {opp.isMyPost && !isDirect && (
              <span style={{ fontWeight: "800", color: "#4f46e5" }}>👥 {opp.applicantCount || 0} Applied</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div style={{
        padding: "10px 14px",
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <button
          type="button"
          onClick={() => onOpen(opp)}
          style={{
            padding: "5px 12px",
            borderRadius: "7px",
            backgroundColor: "#ffffff",
            color: "#0f172a",
            border: "1px solid #cbd5e1",
            fontSize: "11px",
            fontWeight: "800",
            cursor: "pointer"
          }}
        >
          View Details
        </button>

        {opp.isMyPost && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: "5px",
              borderRadius: "6px",
              backgroundColor: "#fff1f2",
              color: "#e11d48",
              border: "1px solid #ffe4e6",
              cursor: "pointer"
            }}
            title="Delete Opportunity"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Exported Cards List ───────────────────
export default function OpportunityCards({ items = [], onOpenDetail, onUpdateBookingStatus, viewMode = "list" }) {
  if (!items || items.length === 0) {
    return (
      <div style={{
        background: "#ffffff",
        border: "1.5px dashed #cbd5e1",
        borderRadius: "16px",
        padding: "48px 24px",
        textAlign: "center",
        margin: "16px 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
      }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🎬</div>
        <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", marginBottom: "6px" }}>No Opportunities Found</h4>
        <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "420px", margin: "0 auto 16px" }}>
          There are no casting calls matching your current filter in the database.
        </p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", margin: "16px 0" }}>
        {items.map((opp) => (
          <OpportunityGridCard
            key={opp.id}
            opp={opp}
            onOpen={onOpenDetail}
            onUpdateBookingStatus={onUpdateBookingStatus}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="opp-cards-container">
      {items.map((opp) => (
        <OpportunityListCard
          key={opp.id}
          opp={opp}
          onOpen={onOpenDetail}
          onUpdateBookingStatus={onUpdateBookingStatus}
        />
      ))}
    </div>
  );
}
