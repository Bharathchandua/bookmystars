import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, MapPin, CalendarDays, IndianRupee, Bookmark, CheckCircle, AlertCircle, Loader2, MessageSquare, Trash2, Edit } from "lucide-react";
import { applyForCastingCall } from "../../features/bms/api/opportunities/castingApplicationsApi";
import { deleteCastingCall } from "../../features/bms/api/opportunities/opportunitiesApi";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";
import { getStoredUser } from "../../features/bms/api/auth/authApi";
import { showSuccess, showError, showWarning, confirmDelete } from "../../shared/utils/alert";
import { emitLiveSync } from "../../shared/utils/liveSync";
import EditOpportunityModal from "./EditOpportunityModal";
import "./opportunities.css";

export default function OpportunityDetailModal({ opp, onClose, onUpdateBookingStatus }) {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const [currentOpp, setCurrentOpp] = useState(opp);
  const [isEditing, setIsEditing] = useState(false);
  const isMyPost = currentOpp?.isMyPost || (storedUser && currentOpp?.postedByUserId === storedUser.userId);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  if (!currentOpp) return null;

  const bannerImg = currentOpp.banner
    ? (currentOpp.banner.startsWith("http") ? currentOpp.banner : getFullImageUrl(currentOpp.banner))
    : (currentOpp.posterUrl ? (currentOpp.posterUrl.startsWith("http") ? currentOpp.posterUrl : getFullImageUrl(currentOpp.posterUrl)) : "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80");

  const handleApply = async () => {
    if (applied || submitting) return;
    try {
      setSubmitting(true);
      setFeedbackMsg("");
      await applyForCastingCall({
        castingCallId: currentOpp.id,
        coverNote: `Applying for ${currentOpp.title} (${currentOpp.customCraft || currentOpp.roleType || "Talent"})`,
        proposedRate: typeof currentOpp.budget === "number" ? currentOpp.budget : null,
      });
      setApplied(true);
      setFeedbackMsg("Application submitted to production director!");
      showSuccess("Application Sent!", `Your application for "${currentOpp.title}" has been submitted successfully.`);
      emitLiveSync("opportunity_applied", { id: currentOpp.id });
    } catch (err) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("already applied") || msg.toLowerCase().includes("conflict")) {
        setApplied(true);
        setFeedbackMsg("You have already applied for this casting call.");
        showWarning("Already Applied", "You have already submitted an application for this casting call.");
      } else {
        setFeedbackMsg(msg || "Could not submit application.");
        showError("Application Failed", msg || "Could not submit application.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (submitting) return;
    const confirmed = await confirmDelete(
      "Delete Casting Call?",
      `Are you sure you want to delete "${currentOpp.title}"? This cannot be undone and all applicant records will be permanently removed.`
    );
    if (confirmed) {
      try {
        setSubmitting(true);
        await deleteCastingCall(currentOpp.id);
        showSuccess("Opportunity Deleted", `"${currentOpp.title}" has been deleted successfully.`);
        emitLiveSync("opportunity_deleted", { id: currentOpp.id });
        onClose();
      } catch (err) {
        showError("Delete Failed", err.message || "Failed to delete opportunity.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      <div className="opp-modal-overlay" onClick={onClose}>
        <div className="opp-modal" onClick={(e) => e.stopPropagation()}>
          {/* Banner with Fitted Image (No zoom, full image visible) */}
          <div className="opp-modal-banner-wrap">
            <img src={bannerImg} alt="" className="opp-modal-banner-blur" aria-hidden="true" />
            <img src={bannerImg} alt={currentOpp.title} className="opp-modal-banner-fit" />
            <div className="opp-modal-banner-overlay" />
            <PagesButton className="opp-modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={16} />
            </PagesButton>
          </div>

          {/* Body */}
          <div className="opp-modal-body">
            <div className="opp-modal-type" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              {currentOpp.isDirectTargeted && (
                <span style={{
                  fontSize: "11px",
                  fontWeight: "900",
                  color: "#ffffff",
                  background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  letterSpacing: "0.5px"
                }}>
                  🎯 DIRECT INVITATION SPECIFICALLY FOR YOU
                </span>
              )}
              <span className={`opp-type-badge ${currentOpp.badgeClass || "badge-feature-film"}`}>
                {currentOpp.type || currentOpp.projectType || "Feature Film"}
              </span>
              {currentOpp.postType && (
                <span style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  padding: "3px 9px",
                  borderRadius: "6px",
                  backgroundColor: currentOpp.postType === "SINGING" ? "#fdf2f8" : currentOpp.postType === "DANCING" ? "#faf5ff" : currentOpp.postType === "MODELING" ? "#fff7ed" : currentOpp.postType === "CREW" ? "#eff6ff" : "#ecfeff",
                  color: currentOpp.postType === "SINGING" ? "#db2777" : currentOpp.postType === "DANCING" ? "#9333ea" : currentOpp.postType === "MODELING" ? "#ea580c" : currentOpp.postType === "CREW" ? "#2563eb" : "#0891b2",
                  border: `1px solid ${currentOpp.postType === "SINGING" ? "#fbcfe8" : currentOpp.postType === "DANCING" ? "#f3e8ff" : currentOpp.postType === "MODELING" ? "#ffedd5" : currentOpp.postType === "CREW" ? "#bfdbfe" : "#cffafe"}`
                }}>
                  {currentOpp.postType === "SINGING" ? "🎤 Singing" : currentOpp.postType === "DANCING" ? "💃 Dancing" : currentOpp.postType === "MODELING" ? "✨ Modeling" : currentOpp.postType === "CREW" ? "🎬 Crew" : "🎭 Acting"}
                </span>
              )}
              {currentOpp.directorName && (
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "2px 8px", borderRadius: "6px" }}>
                  🎬 From: {currentOpp.directorName}
                </span>
              )}
              {currentOpp.customCraft && (
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px" }}>
                  {currentOpp.customCraft}
                </span>
              )}
              {isMyPost && !currentOpp.isDirectTargeted && (
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff", background: currentOpp.status === "CLOSED" ? "#dc2626" : currentOpp.status === "IN_REVIEW" ? "#d97706" : "#4f46e5", padding: "2px 8px", borderRadius: "6px" }}>
                  {currentOpp.status === "CLOSED" ? "MY POST • CLOSED" : currentOpp.status === "IN_REVIEW" ? "MY POST • UNDER REVIEW" : "MY POST • OPEN"}
                </span>
              )}

              {/* Status Indicator Badge */}
              {currentOpp.status === "CLOSED" && (
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "2px 8px", borderRadius: "6px" }}>
                  ● Applications Closed
                </span>
              )}
              {(currentOpp.status === "IN_REVIEW" || currentOpp.status === "PENDING") && !currentOpp.isDirectTargeted && (
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#d97706", background: "#fffbeb", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: "6px" }}>
                  ⏳ Under Review
                </span>
              )}
              {(currentOpp.status === "OPEN" || !currentOpp.status) && !currentOpp.isDirectTargeted && (
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "2px 8px", borderRadius: "6px" }}>
                  ● Accepting Auditions
                </span>
              )}

              {/* Header Edit Call Button for Owner */}
              {isMyPost && (
                <PagesButton
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    marginLeft: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "#fdf2f8",
                    border: "1.5px solid #f472b6",
                    color: "#be185d",
                    borderRadius: "8px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  title="Edit Call Details"
                >
                  <Edit size={13} />
                  <span>Edit Call</span>
                </PagesButton>
              )}
            </div>

            <h2 className="opp-modal-title">{currentOpp.title}</h2>

            {/* Meta tags */}
            <div className="opp-modal-tags">
              <span className="opp-modal-tag"><MapPin size={12} /> {currentOpp.location || "Mumbai"}</span>
              <span className="opp-modal-tag"><CalendarDays size={12} /> Audition: {currentOpp.auditionDate || currentOpp.applicationDeadline || "Open"}</span>
              <span className="opp-modal-tag"><IndianRupee size={12} /> {typeof currentOpp.budget === "number" ? `₹ ${currentOpp.budget.toLocaleString("en-IN")}` : (currentOpp.budget || "Negotiable")}</span>
              {currentOpp.age && <span className="opp-modal-tag" style={{ background: "#fdf2f8", color: "#be185d", borderColor: "#fbcfe8" }}>🎂 Age: {currentOpp.age}</span>}
              {currentOpp.gender && <span className="opp-modal-tag" style={{ background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}>👤 Gender: {currentOpp.gender}</span>}
              {currentOpp.height && <span className="opp-modal-tag">📏 Height: {currentOpp.height}</span>}
              {currentOpp.weight && <span className="opp-modal-tag">⚖️ Weight: {currentOpp.weight}</span>}
              {currentOpp.requiredLanguages && (
                <span className="opp-modal-tag" style={{ background: "#f5f3ff", color: "#6d28d9", borderColor: "#ddd6fe", fontWeight: "700" }}>
                  🌐 Required Languages: {currentOpp.requiredLanguages}
                </span>
              )}
            </div>

            {/* Attached Audition Video Player */}
            {currentOpp.videoUrl && (
              <div style={{ marginBottom: "16px", borderRadius: "12px", overflow: "hidden", background: "#0f172a", border: "1.5px solid #f472b6" }}>
                <div style={{ padding: "8px 14px", background: "linear-gradient(90deg, #1e1b4b, #831843)", color: "#fdf2f8", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🎬</span> Audition Reference Reel / Monologue Video
                </div>
                <video
                  controls
                  playsInline
                  src={currentOpp.videoUrl.startsWith("http") ? currentOpp.videoUrl : getFullImageUrl(currentOpp.videoUrl)}
                  style={{ width: "100%", maxHeight: "280px", objectFit: "contain", display: "block", background: "#000000" }}
                />
              </div>
            )}

            {/* About Role */}
            <div className="opp-modal-section">
              <h4 className="opp-modal-section-title">About This Role</h4>
              <p className="opp-modal-desc-text">{currentOpp.fullDesc || currentOpp.description || "Exciting opportunity in film & media production."}</p>
            </div>

            {/* Requirements */}
            {(currentOpp.requirements || currentOpp.requirementsList) && (
              <div className="opp-modal-section">
                <h4 className="opp-modal-section-title">Requirements</h4>
                <div className="opp-modal-req-list">
                  {Array.isArray(currentOpp.requirements)
                    ? currentOpp.requirements.map((req, i) => (
                        <div key={i} className="opp-modal-req-row">
                          <div className="opp-modal-req-dot" />
                          {req}
                        </div>
                      ))
                    : String(currentOpp.requirements || "")
                        .split("\n")
                        .filter(Boolean)
                        .map((req, i) => (
                          <div key={i} className="opp-modal-req-row">
                            <div className="opp-modal-req-dot" />
                            {req}
                          </div>
                        ))}
                </div>
              </div>
            )}

            {/* Feedback message */}
            {feedbackMsg && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "12px",
                fontSize: "12.5px",
                fontWeight: "600",
                background: applied ? "#f0fdf4" : "#fef2f2",
                color: applied ? "#166534" : "#991b1b",
                border: `1px solid ${applied ? "#bbf7d0" : "#fecaca"}`
              }}>
                {applied ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="opp-modal-apply-row">
              {currentOpp.isDirectTargeted ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <PagesButton
                      type="button"
                      className="opp-modal-chat-btn"
                      onClick={() => {
                        onClose();
                        navigate("/messages", {
                          state: {
                            targetUser: {
                              id: currentOpp.directorId || currentOpp.postedByUserId,
                              name: currentOpp.directorName || "Production Director",
                              role: "Director",
                              avatar: currentOpp.posterUrl || currentOpp.banner
                            },
                            opportunityId: currentOpp.rawBookingId,
                            opportunityTitle: currentOpp.title
                          }
                        });
                      }}
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #cbd5e1",
                        color: "#1e293b",
                        borderRadius: "10px",
                        padding: "10px 18px",
                        fontSize: "13px",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer"
                      }}
                    >
                      <MessageSquare size={16} color="#ee008f" />
                      <span>Chat with {currentOpp.directorName ? currentOpp.directorName.split(" ")[0] : "Director"}</span>
                    </PagesButton>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {currentOpp.status === "PENDING" ? (
                      <>
                        <PagesButton
                          type="button"
                          disabled={updatingBooking}
                          onClick={async () => {
                            if (onUpdateBookingStatus) {
                              setUpdatingBooking(true);
                              try {
                                await onUpdateBookingStatus(currentOpp.rawBookingId, "DECLINED");
                                setCurrentOpp({ ...currentOpp, status: "DECLINED" });
                              } finally {
                                setUpdatingBooking(false);
                              }
                            }
                          }}
                          style={{
                            background: "#fef2f2",
                            border: "1.5px solid #fecaca",
                            color: "#dc2626",
                            borderRadius: "10px",
                            padding: "10px 18px",
                            fontSize: "13px",
                            fontWeight: "800",
                            cursor: "pointer"
                          }}
                        >
                          Decline Offer
                        </PagesButton>

                        <PagesButton
                          type="button"
                          disabled={updatingBooking}
                          onClick={async () => {
                            if (onUpdateBookingStatus) {
                              setUpdatingBooking(true);
                              try {
                                await onUpdateBookingStatus(currentOpp.rawBookingId, "ACCEPTED");
                                setCurrentOpp({ ...currentOpp, status: "ACCEPTED" });
                              } finally {
                                setUpdatingBooking(false);
                              }
                            }
                          }}
                          style={{
                            background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
                            border: "none",
                            color: "#ffffff",
                            borderRadius: "10px",
                            padding: "10px 22px",
                            fontSize: "13px",
                            fontWeight: "800",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)"
                          }}
                        >
                          ✓ Accept Offer
                        </PagesButton>
                      </>
                    ) : (
                      <span style={{
                        fontSize: "13px",
                        fontWeight: "800",
                        padding: "8px 16px",
                        borderRadius: "10px",
                        background: currentOpp.status === "ACCEPTED" ? "#f0fdf4" : "#fef2f2",
                        color: currentOpp.status === "ACCEPTED" ? "#16a34a" : "#dc2626",
                        border: `1.5px solid ${currentOpp.status === "ACCEPTED" ? "#bbf7d0" : "#fecaca"}`
                      }}>
                        {currentOpp.status === "ACCEPTED" ? "✓ Offer Accepted" : "✕ Offer Declined"}
                      </span>
                    )}
                  </div>
                </div>
              ) : isMyPost ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>
                    👥 {currentOpp.applicantCount || 0} Submissions Received
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {/* EDIT OPPORTUNITY BUTTON */}
                    <PagesButton
                      type="button"
                      onClick={() => setIsEditing(true)}
                      disabled={submitting}
                      style={{
                        background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
                        border: "none",
                        color: "#ffffff",
                        borderRadius: "10px",
                        padding: "10px 20px",
                        fontSize: "13px",
                        fontWeight: "800",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(238, 0, 143, 0.25)"
                      }}
                    >
                      <Edit size={16} />
                      <span>Edit Opportunity</span>
                    </PagesButton>

                    {/* DELETE OPPORTUNITY BUTTON */}
                    <PagesButton
                      type="button"
                      onClick={handleDelete}
                      disabled={submitting}
                      style={{
                        background: "#fef2f2",
                        border: "1.5px solid #fecaca",
                        color: "#dc2626",
                        borderRadius: "10px",
                        padding: "10px 18px",
                        fontSize: "13px",
                        fontWeight: "800",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(220, 38, 38, 0.15)"
                      }}
                    >
                      <Trash2 size={16} />
                      <span>{submitting ? "Deleting..." : "Delete Opportunity"}</span>
                    </PagesButton>
                  </div>
                </div>
              ) : (
                <>
                  <PagesButton
                    type="button"
                    className="opp-modal-chat-btn"
                    onClick={() => {
                      onClose();
                      navigate("/messages", {
                        state: {
                          targetUser: {
                            id: currentOpp.postedByUserId || currentOpp.postedBy?.id,
                            name: currentOpp.postedByName || currentOpp.postedBy?.fullName || "Casting Director",
                            role: "Casting Director",
                            avatar: currentOpp.posterUrl || currentOpp.banner
                          },
                          opportunityId: currentOpp.id,
                          opportunityTitle: currentOpp.title
                        }
                      });
                    }}
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #cbd5e1",
                      color: "#1e293b",
                      borderRadius: "10px",
                      padding: "10px 18px",
                      fontSize: "13px",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    <MessageSquare size={16} color="#ee008f" />
                    <span>Chat with Director</span>
                  </PagesButton>

                  {currentOpp.status === "CLOSED" ? (
                    <div style={{
                      padding: "10px 18px",
                      borderRadius: "10px",
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1.5px solid #fecaca",
                      fontWeight: "800",
                      fontSize: "13px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      🔒 Closed - Not Accepting Auditions
                    </div>
                  ) : currentOpp.status === "IN_REVIEW" || currentOpp.status === "PENDING" ? (
                    <div style={{
                      padding: "10px 18px",
                      borderRadius: "10px",
                      background: "#fffbeb",
                      color: "#d97706",
                      border: "1.5px solid #fde68a",
                      fontWeight: "800",
                      fontSize: "13px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      ⏳ Under Review by Casting Director
                    </div>
                  ) : (
                    <PagesButton
                      className={`opp-modal-apply-btn ${applied ? "applied" : ""}`}
                      onClick={handleApply}
                      disabled={submitting || applied}
                    >
                      {submitting ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Loader2 size={14} className="animate-spin" /> Submitting...
                        </span>
                      ) : applied ? (
                        "✓ Application Sent!"
                      ) : (
                        "Apply Now"
                      )}
                    </PagesButton>
                  )}
                  <PagesButton
                    className={`opp-modal-save-btn ${saved ? "saved" : ""}`}
                    onClick={() => setSaved((s) => !s)}
                    aria-label="Save"
                  >
                    <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                  </PagesButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Edit Opportunity Modal */}
      {isEditing && (
        <EditOpportunityModal
          opp={currentOpp}
          onClose={() => setIsEditing(false)}
          onSaved={(updated) => {
            setCurrentOpp(updated);
            setIsEditing(false);
          }}
        />
      )}
    </>
  );
}
