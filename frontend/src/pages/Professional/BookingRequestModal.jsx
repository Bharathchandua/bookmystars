/* ── BookingRequestModal.jsx ──────────────────────────────────
   Modal enabling professionals to book a talent on an available date
   and send a shoot / project request directly to the talent.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { 
  X, Calendar, IndianRupee, MapPin, Send, Loader2, 
  CheckCircle2, Sparkles, Building2, Clock 
} from "lucide-react";
import { createBookingRequest, getFullImageUrl } from "../../services/api";

const PROJECT_TYPES = [
  "Commercial Campaign",
  "Feature Film",
  "Web Series",
  "Fashion / Runway Shoot",
  "Music Video",
  "Print / Editorial",
  "Voiceover / Dubbing",
  "Live Performance",
  "Other Project",
];

export default function BookingRequestModal({ isOpen, onClose, talent, initialDate, onSuccess }) {
  const [bookingDate, setBookingDate] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectType, setProjectType] = useState("Commercial Campaign");
  const [offeredRate, setOfferedRate] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && talent) {
      const todayStr = new Date().toISOString().split("T")[0];
      setBookingDate(initialDate || todayStr);
      setLocation(talent.city || "Mumbai");
      setOfferedRate(talent.dayRate ? `₹${talent.dayRate}/day` : "");
      setProjectTitle("");
      setMessage("");
      setError(null);
      setSubmittedSuccess(false);
    }
  }, [isOpen, talent, initialDate]);

  if (!isOpen || !talent) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      setError("Please enter a project title.");
      return;
    }
    if (!bookingDate) {
      setError("Please select a shoot / booking date.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createBookingRequest({
        talentId: talent.userId,
        bookingDate,
        projectTitle: projectTitle.trim(),
        projectType,
        offeredRate: offeredRate.trim(),
        location: location.trim(),
        message: message.trim(),
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to send booking request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pro-modal-overlay" style={{ zIndex: 1100 }}>
      <div className="pro-modal-card" style={{ maxWidth: 580, width: "95%" }}>
        {/* Header */}
        <div className="pro-modal-header">
          <div>
            <h4 className="pro-modal-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={18} style={{ color: "#4f46e5" }} /> Book & Send Shoot Request
            </h4>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>
              Request will be delivered directly to the artist's dashboard.
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Talent Mini Banner */}
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 12, 
            padding: "12px 16px", 
            background: "#f8fafc", 
            borderRadius: 10, 
            marginBottom: 20, 
            border: "1px solid #e2e8f0" 
          }}
        >
          {talent.profilePhotoUrl ? (
            <img 
              src={getFullImageUrl(talent.profilePhotoUrl)} 
              alt={talent.fullName} 
              style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} 
            />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              {talent.fullName?.charAt(0) || "T"}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
              {talent.fullName} {talent.stageName ? `("${talent.stageName}")` : ""}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {talent.profileType || "Artist"} • {talent.city || "Mumbai"}
            </div>
          </div>
          {talent.dayRate && (
            <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "4px 10px", borderRadius: 8 }}>
              ₹{talent.dayRate}/day
            </span>
          )}
        </div>

        {submittedSuccess ? (
          <div style={{ padding: "30px 20px", textAlign: "center" }}>
            <CheckCircle2 size={48} style={{ color: "#10b981", margin: "0 auto 12px auto" }} />
            <h4 style={{ margin: "0 0 6px 0", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
              Booking Request Sent!
            </h4>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              The request has been delivered to {talent.fullName}. They will receive it on their dashboard and can accept or confirm.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label className="form-label" style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                  Target Shoot Date *
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, background: "#fff" }}
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label" style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                Project / Campaign Title *
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Festive Apparel Ad Campaign — Lead Model Shoot"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label className="form-label" style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                  Offered Budget / Day Rate
                </label>
                <input
                  type="text"
                  value={offeredRate}
                  onChange={(e) => setOfferedRate(e.target.value)}
                  placeholder="e.g. ₹35,000"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                  Shoot Location / Studio
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Film City, Goregaon, Mumbai"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                Message & Shoot Details for Artist
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide details on call timings, wardrobe requirements, scene descriptions, or any other notes..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "9px 22px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)"
                }}
              >
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {isSubmitting ? "Sending Request..." : "Send Booking Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
