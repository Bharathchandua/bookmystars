import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  Play, 
  Eye, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  User
} from "lucide-react";
import Swal from "sweetalert2";
import { 
  getPendingTalentMedia, 
  reviewTalentMedia 
} from "../../../features/bms/api/admin/adminApi";
import { showSuccess, showError } from "../../../shared/utils/alert";
import { emitLiveSync, onLiveSync } from "../../../shared/utils/liveSync";

export default function AdminTalentMediaModerationView({ onCountChange }) {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mediaFilter, setMediaFilter] = useState("ALL"); // "ALL" | "PHOTO" | "VIDEO" | "AUDIO"
  const [previewMedia, setPreviewMedia] = useState(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await getPendingTalentMedia();
      const list = Array.isArray(data) ? data : [];
      setMediaList(list);
      if (onCountChange) {
        onCountChange(list.length);
      }
    } catch (err) {
      console.error("Error loading pending media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
    const unsub = onLiveSync(["talents_updated", "profile_updated", "media_uploaded"], () => {
      fetchMedia();
    });
    return () => unsub();
  }, []);

  const handleApprove = async (item) => {
    try {
      await reviewTalentMedia(item.mediaType.toLowerCase(), item.id, "APPROVED");
      showSuccess("Media Approved", `The ${item.mediaType.toLowerCase()} for "${item.talentName}" is now live on their public profile.`);
      emitLiveSync("talents_updated", { id: item.id });
      setMediaList(prev => prev.filter(m => !(m.id === item.id && m.mediaType === item.mediaType)));
      if (onCountChange) {
        onCountChange(mediaList.length - 1);
      }
    } catch (err) {
      showError("Approval Failed", err.message || "Failed to approve media item");
    }
  };

  const handleReject = async (item) => {
    const { value: reason } = await Swal.fire({
      title: `Reject ${item.mediaType}?`,
      text: `Provide constructive feedback for ${item.talentName} so they know what to fix:`,
      input: "select",
      inputOptions: {
        "Image resolution is too low or blurry": "Image resolution is too low or blurry",
        "Contains visible commercial watermark or copyright": "Contains visible commercial watermark or copyright",
        "Audio quality has excessive background noise or distortion": "Audio quality has excessive background noise or distortion",
        "Video aspect ratio is distorted or incomplete": "Video aspect ratio is distorted or incomplete",
        "Content violates community or editorial guidelines": "Content violates community or editorial guidelines",
        "Other (Custom Reason)": "Other (Custom Reason)"
      },
      inputPlaceholder: "Select a standard rejection reason",
      showCancelButton: true,
      confirmButtonText: "Next",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      preConfirm: (val) => {
        if (!val) {
          Swal.showValidationMessage("Please select a rejection reason");
        }
        return val;
      }
    });

    if (!reason) return;

    let finalReason = reason;
    if (reason === "Other (Custom Reason)") {
      const { value: customText } = await Swal.fire({
        title: "Custom Rejection Reason",
        input: "textarea",
        inputPlaceholder: "Explain clearly why this media was rejected...",
        showCancelButton: true,
        confirmButtonText: "Submit Rejection",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        inputValidator: (val) => {
          if (!val || !val.trim()) return "Reason cannot be empty";
        }
      });
      if (!customText) return;
      finalReason = customText.trim();
    }

    try {
      await reviewTalentMedia(item.mediaType.toLowerCase(), item.id, "REJECTED", finalReason);
      showSuccess("Media Rejected", `Feedback sent to ${item.talentName}.`);
      emitLiveSync("talents_updated", { id: item.id });
      setMediaList(prev => prev.filter(m => !(m.id === item.id && m.mediaType === item.mediaType)));
      if (onCountChange) {
        onCountChange(mediaList.length - 1);
      }
    } catch (err) {
      showError("Rejection Failed", err.message || "Failed to reject media");
    }
  };

  const filteredItems = mediaFilter === "ALL" 
    ? mediaList 
    : mediaList.filter(m => m.mediaType === mediaFilter);

  return (
    <div style={{ padding: "20px" }}>
      {/* Top Filter Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {["ALL", "PHOTO", "VIDEO", "AUDIO"].map(filterKey => {
            const count = filterKey === "ALL" 
              ? mediaList.length 
              : mediaList.filter(m => m.mediaType === filterKey).length;
            const active = mediaFilter === filterKey;
            return (
              <button
                key={filterKey}
                type="button"
                onClick={() => setMediaFilter(filterKey)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: active ? "1px solid #ee008f" : "1px solid #e2e8f0",
                  background: active ? "#ee008f" : "#ffffff",
                  color: active ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease"
                }}
              >
                {filterKey === "ALL" ? "All Pending Media" : `${filterKey}s`} ({count})
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={fetchMedia}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#475569",
            cursor: "pointer"
          }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh Queue
        </button>
      </div>

      {/* Main Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "#f8fafc",
          borderRadius: "16px",
          border: "1px dashed #cbd5e1"
        }}>
          <Sparkles size={40} style={{ color: "#ee008f", margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
            Moderation Queue Clear!
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            {mediaList.length === 0 
              ? "All talent headshots, audition showreels, and audio tracks have been moderated." 
              : `No pending items found in '${mediaFilter}'.`}
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "18px"
        }}>
          {filteredItems.map(item => (
            <div
              key={`${item.mediaType}-${item.id}`}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Media Preview Header */}
              <div style={{
                position: "relative",
                width: "100%",
                height: item.mediaType === "AUDIO" ? "100px" : "190px",
                background: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}>
                {item.mediaType === "PHOTO" && (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.style.opacity = "0.3"; }}
                  />
                )}

                {item.mediaType === "VIDEO" && (
                  <>
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <video
                        src={item.mediaUrl}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        preload="metadata"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setPreviewMedia(item)}
                      style={{
                        position: "absolute",
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(238, 0, 143, 0.9)",
                        color: "#fff",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                      }}
                    >
                      <Play size={18} style={{ marginLeft: "2px" }} />
                    </button>
                  </>
                )}

                {item.mediaType === "AUDIO" && (
                  <div style={{ width: "100%", padding: "12px 16px", background: "linear-gradient(135deg, #1e293b, #0f172a)", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#38bdf8" }}>
                      <Mic size={18} />
                      <span style={{ fontSize: "12px", fontWeight: "700" }}>{item.format || "MP3"} Audio Track</span>
                      {item.duration && <span style={{ fontSize: "11px", color: "#94a3b8" }}>({item.duration})</span>}
                    </div>
                    <audio controls style={{ width: "100%", height: "36px" }} src={item.mediaUrl}>
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}

                {/* Badge top-left */}
                <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 2 }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "rgba(245, 158, 11, 0.95)",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "3px 8px",
                    borderRadius: "20px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }}>
                    <Clock size={10} /> Pending Review
                  </span>
                </div>

                {/* Media Type pill top-right */}
                <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2 }}>
                  <span style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(4px)",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "3px 8px",
                    borderRadius: "6px"
                  }}>
                    {item.mediaType}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: "0 0 2px" }}>
                    {item.title || "Untitled Media"}
                  </h4>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
                    Category: {item.category || "General"}
                  </span>
                </div>

                {/* Talent Details Card */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9"
                }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#e2e8f0",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {item.talentAvatar ? (
                      <img src={item.talentAvatar} alt={item.talentName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <User size={18} color="#64748b" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.talentName}
                      </span>
                      {item.isUserApproved && (
                        <ShieldCheck size={13} style={{ color: "#059669" }} title="KYC Verified Star" />
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.talentEmail}
                    </div>
                  </div>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    background: "#eff6ff",
                    color: "#2563eb",
                    padding: "2px 6px",
                    borderRadius: "4px"
                  }}>
                    {item.craft || "Artist"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleApprove(item)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "#059669",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 2px 4px rgba(5, 150, 105, 0.2)"
                    }}
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(item)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)"
                    }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Fullscreen Preview Modal */}
      {previewMedia && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "20px"
        }}>
          <div style={{
            background: "#0f172a",
            borderRadius: "16px",
            maxWidth: "720px",
            width: "100%",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid #334155"
          }}>
            <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b" }}>
              <span style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>{previewMedia.title}</span>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" }}
              >
                ✕
              </button>
            </div>
            <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000" }}>
              <video
                src={previewMedia.mediaUrl}
                controls
                autoPlay
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
