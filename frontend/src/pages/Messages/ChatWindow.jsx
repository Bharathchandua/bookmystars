import PagesButton from "../common/PagesButton";
import { useState, useRef, useEffect } from "react";
import { 
  Phone, Video, MoreVertical, Mic, Send, Camera, ArrowLeft, Lock, Check, X, ShieldCheck, Clock,
  Calendar, MapPin, IndianRupee, Film, CheckCircle2, XCircle 
} from "lucide-react";

const WhatsAppEmojiIcon = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Outer sticker shape with folded bottom-right corner */}
    <path d="M7 3h10a4 4 0 0 1 4 4v8L15 21H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" />
    {/* Folded corner flap */}
    <path d="M15 21v-4a2 2 0 0 1 2-2h4" />
    {/* Left Eye */}
    <path d="M9 9h0" />
    {/* Right Eye */}
    <path d="M15 9h0" />
    {/* Smile Mouth */}
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
  </svg>
);

const VerticalPaperclipIcon = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    {...props}
  >
    <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
  </svg>
);

export default function ChatWindow({ 
  activeChat, 
  messages, 
  onSendMessage, 
  onBack, 
  onOpenSidebar, 
  onRespondAccessRequest,
  onRespondBookingRequest
}) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeChat) {
    return (
      <div className="msg-chat-window-empty">
        <div className="msg-empty-icon">💬</div>
        <h3>No conversation selected</h3>
        <p>Choose a contact from the left list to start messaging.</p>
      </div>
    );
  }

  const { booking } = activeChat;

  return (
    <div className="msg-chat-window-panel">
      {/* Chat Header */}
      <div className="msg-chat-header">
        <div className="msg-header-user-info">
          {onBack && (
            <PagesButton className="msg-back-btn" onClick={onBack} title="Back to chats">
              <ArrowLeft size={20} />
            </PagesButton>
          )}
          <div className="msg-header-avatar-wrap">
            <img src={activeChat.avatar} alt={activeChat.name} className="msg-header-avatar" />
            {activeChat.online && <span className="msg-online-dot header" />}
          </div>
          <div className="msg-header-text">
            <h3>{activeChat.name}</h3>
            <p>
              {activeChat.role} {activeChat.company && `· ${activeChat.company}`}
            </p>
          </div>
        </div>

        <div className="msg-header-actions">
          <PagesButton className="msg-header-btn" title="Call">
            <Phone size={18} />
          </PagesButton>
          <PagesButton className="msg-header-btn" title="Video Call">
            <Video size={18} />
          </PagesButton>
          <PagesButton className="msg-header-btn" title="More options" onClick={onOpenSidebar}>
            <MoreVertical size={18} />
          </PagesButton>
        </div>
      </div>

      {/* Booking Reference Card (Widget for mock/regular bookings) */}
      {booking && !activeChat.bookingRequest && (
        <div className="msg-booking-widget animate-fadeIn">
          <div className="msg-booking-widget-content">
            <img src={booking.cover} alt={booking.project} className="msg-booking-cover" />
            <div className="msg-booking-details">
              <h4>{booking.project}</h4>
              <p>{booking.role}</p>
            </div>
          </div>
          <div className="msg-booking-meta text-right">
            <span className="msg-booking-id-label">Booking ID</span>
            <span className="msg-booking-id">{booking.id}</span>
          </div>
        </div>
      )}

      {/* Director Shoot Booking Request Widget */}
      {activeChat.bookingRequest && (
        <div 
          style={{
            margin: "12px 16px",
            padding: "18px 20px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
            color: "#ffffff",
            boxShadow: "0 8px 24px rgba(30, 27, 75, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}
          className="animate-fadeIn"
        >
          {/* Header row with Icon, Title, and Status Badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(236, 72, 153, 0.4)"
              }}>
                <Film size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.2px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🎬 Shoot Booking Request</span>
                  <span style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                    #{activeChat.bookingRequest.id}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "#cbd5e1", marginTop: 2 }}>
                  From Director: <strong>{activeChat.bookingRequest.professionalName || activeChat.name}</strong>
                  {activeChat.bookingRequest.professionalCompany && ` (${activeChat.bookingRequest.professionalCompany})`}
                </div>
              </div>
            </div>

            <div>
              {activeChat.bookingRequest.status === "PENDING" && (
                <span style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: "0 2px 6px rgba(254, 243, 199, 0.2)"
                }}>
                  <Clock size={13} /> Action Required
                </span>
              )}
              {activeChat.bookingRequest.status === "ACCEPTED" && (
                <span style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5
                }}>
                  <CheckCircle2 size={13} /> Shoot Confirmed
                </span>
              )}
              {activeChat.bookingRequest.status === "DECLINED" && (
                <span style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5
                }}>
                  <XCircle size={13} /> Declined
                </span>
              )}
            </div>
          </div>

          {/* Project Details Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 10,
            background: "rgba(255, 255, 255, 0.06)",
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Project</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>{activeChat.bookingRequest.projectTitle}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Type</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#e2e8f0", marginTop: 2 }}>{activeChat.bookingRequest.projectType || "Shoot"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Shoot Date</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fbbf24", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={13} /> {activeChat.bookingRequest.bookingDate}
              </div>
            </div>
            {activeChat.bookingRequest.location && (
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Location</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#e2e8f0", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={13} /> {activeChat.bookingRequest.location}
                </div>
              </div>
            )}
            {activeChat.bookingRequest.offeredRate && (
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Offered Rate</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#34d399", marginTop: 2, display: "flex", alignItems: "center", gap: 2 }}>
                  <IndianRupee size={13} /> {activeChat.bookingRequest.offeredRate}
                </div>
              </div>
            )}
          </div>

          {/* Director's Note / Message */}
          {activeChat.bookingRequest.message && (
            <div style={{
              background: "rgba(255, 255, 255, 0.08)",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: 13,
              fontStyle: "italic",
              lineHeight: 1.5,
              borderLeft: "3px solid #ec4899",
              color: "#e2e8f0"
            }}>
              &ldquo;{activeChat.bookingRequest.message}&rdquo;
            </div>
          )}

          {/* Action Buttons for Pending Status */}
          {activeChat.bookingRequest.status === "PENDING" && onRespondBookingRequest && (
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => onRespondBookingRequest(activeChat.bookingRequest.id, true)}
                style={{
                  flex: 1.2,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "11px 18px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  transition: "all 0.2s ease"
                }}
              >
                <Check size={16} strokeWidth={2.5} /> Accept Shoot & Confirm Booking
              </button>
              <button
                type="button"
                onClick={() => onRespondBookingRequest(activeChat.bookingRequest.id, false)}
                style={{
                  flex: 0.8,
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  padding: "11px 18px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s ease"
                }}
              >
                <X size={16} /> Decline Offer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Access Request Widget */}
      {activeChat.accessRequest && (
        <div 
          style={{
            margin: "12px 16px",
            padding: "16px 20px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 16px rgba(49, 46, 129, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
          className="animate-fadeIn"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Lock size={20} color="#facc15" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.2px" }}>
                  Private Profile Access Request
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}>
                  From: <strong>{activeChat.accessRequest.requesterName}</strong> ({activeChat.accessRequest.requesterEmail})
                </div>
              </div>
            </div>

            <div>
              {activeChat.accessRequest.status === "PENDING" && (
                <span style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "4px 12px",
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <Clock size={12} /> Pending Approval
                </span>
              )}
              {activeChat.accessRequest.status === "APPROVED" && (
                <span style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "4px 12px",
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <ShieldCheck size={12} /> Access Granted
                </span>
              )}
              {activeChat.accessRequest.status === "REJECTED" && (
                <span style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "4px 12px",
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  ❌ Declined
                </span>
              )}
            </div>
          </div>

          {activeChat.accessRequest.requesterMessage && (
            <div style={{
              background: "rgba(255,255,255,0.1)",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontStyle: "italic",
              lineHeight: 1.5,
              borderLeft: "3px solid #facc15"
            }}>
              &ldquo;{activeChat.accessRequest.requesterMessage}&rdquo;
            </div>
          )}

          {activeChat.accessRequest.status === "PENDING" && onRespondAccessRequest && (
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => onRespondAccessRequest(activeChat.accessRequest.id, true)}
                style={{
                  flex: 1,
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                }}
              >
                <Check size={15} /> Approve Access
              </button>
              <button
                type="button"
                onClick={() => onRespondAccessRequest(activeChat.accessRequest.id, false)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                <X size={15} /> Decline
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chat Messages Timeline */}
      <div className="msg-chat-timeline">
        <div className="msg-messages-scroll-area">
          <div className="msg-timeline-date">Today</div>
          {messages.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "48px 20px",
              color: "#94a3b8",
              fontSize: "13px"
            }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>💬</div>
              <div style={{ fontWeight: "800", color: "#334155", fontSize: "14px", marginBottom: "4px" }}>
                Start of conversation with {activeChat.name}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Send a message below to connect directly.
              </div>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender === "me";
            return (
              <div key={msg.id} className={`msg-bubble-row ${isMe ? "me" : "them"}`}>
                <div className={`msg-bubble-wrap ${isMe ? "me" : "them"}`}>
                  <div className="msg-bubble-text">{msg.text}</div>
                  <div className="msg-bubble-meta">
                    <span className="msg-bubble-time">{msg.time}</span>
                    {isMe && (
                      <span className="msg-bubble-status">
                        <svg className="w-3 h-3 text-pink-600 fill-current" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Composer Footer */}
      <div className="msg-chat-composer">
        {/* WhatsApp-style Input Capsule (White Section) */}
        <div className="msg-composer-capsule">
          {/* Smiley Icon on Left */}
          <PagesButton className="msg-capsule-icon-btn" type="button" title="Emojis">
            <WhatsAppEmojiIcon size={21} />
          </PagesButton>

          {/* Text input */}
          <input
            type="text"
            placeholder="Message"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="msg-capsule-input"
          />

          {/* Right Icons inside Capsule */}
          <div className="msg-capsule-right-actions">
            <PagesButton className="msg-capsule-icon-btn" type="button" title="Add Attachment">
              <VerticalPaperclipIcon size={19} />
            </PagesButton>
            {!inputText.trim() && (
              <PagesButton className="msg-capsule-icon-btn" type="button" title="Camera">
                <Camera size={20} />
              </PagesButton>
            )}
          </div>
        </div>

        {/* Circle Button Outside on Right */}
        <PagesButton
          className="msg-composer-action-circle-btn"
          onClick={inputText.trim() ? handleSend : undefined}
          title={inputText.trim() ? "Send Message" : "Voice Message"}
        >
          {inputText.trim() ? (
            <Send size={18} style={{ marginLeft: "2px" }} />
          ) : (
            <Mic size={20} />
          )}
        </PagesButton>
      </div>
    </div>
  );
}
