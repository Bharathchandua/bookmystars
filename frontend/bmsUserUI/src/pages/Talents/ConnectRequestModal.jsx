import { useState } from "react";
import { X, Send, UserPlus, Sparkles, MessageSquare, Loader2 } from "lucide-react";
import PagesButton from "../common/PagesButton";
import { sendChatRequest } from "../../features/bms/api/messages/chatApi";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";
import { showSuccess, showError } from "../../shared/utils/alert";

export default function ConnectRequestModal({ talent, isOpen, onClose, onSuccess }) {
  const [message, setMessage] = useState(
    "Hi, I saw your profile on BookMyStars and would like to connect with you regarding creative opportunities."
  );
  const [sending, setSending] = useState(false);

  if (!isOpen || !talent) return null;

  const talentId = talent.userId || talent.id;
  const name = talent.fullName || talent.name || "Talent";
  const craft = talent.primaryProfession || talent.customProfession || talent.talentCategory || "Talent";
  const photo = talent.profilePhoto ? getFullImageUrl(talent.profilePhoto) : null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!talentId) {
      showError("Error", "Invalid talent ID.");
      return;
    }
    try {
      setSending(true);
      const res = await sendChatRequest(talentId, message);
      showSuccess(
        "Chat Request Sent! 🎉",
        `Your request was sent to ${name}. Once they accept, you can message each other directly.`
      );
      if (onSuccess) {
        onSuccess(res);
      }
      onClose();
    } catch (err) {
      showError("Could Not Send Request", err.message || "Failed to send chat request.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          animation: "modalFadeIn 0.25s ease-out"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
            color: "#ffffff",
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
                background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <UserPlus size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Send Chat Request</h3>
              <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#cbd5e1" }}>
                Connect directly on BookMyStars
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              cursor: "pointer"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Talent Summary Pill */}
        <div style={{ padding: "20px 24px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #e2e8f0"
            }}
          >
            {photo ? (
              <img
                src={photo}
                alt={name}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
            ) : (
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "18px"
                }}
              >
                {name.charAt(0)}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: "800", fontSize: "14.5px", color: "#0f172a" }}>
                {name}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                <span
                  style={{
                    backgroundColor: "#f1f5f9",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    color: "#475569"
                  }}
                >
                  {craft}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} style={{ padding: "18px 24px 24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "6px"
              }}
            >
              Introductory Message
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and tell them why you'd like to connect..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1.5px solid #cbd5e1",
                fontSize: "13px",
                fontFamily: "inherit",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
              required
            />
            <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "4px" }}>
              💡 Once {name} accepts your request, you can chat dynamically in real time.
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !message.trim()}
              style={{
                padding: "10px 22px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(236, 72, 153, 0.35)",
                opacity: sending ? 0.7 : 1
              }}
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
