import PagesButton from "../common/PagesButton";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Star, Mail, Phone, ExternalLink, Calendar, UserPlus, Download, FileText, ChevronDown, ArrowLeft,
  UserMinus, Ban, ShieldCheck, X, PanelRightClose, UserCheck 
} from "lucide-react";
import { saveUserContact, removeUserContact, checkContactSaved } from "../../features/bms/api";
import { showSuccess, showError } from "../../shared/utils/alert";

export default function ChatSidebar({ 
  activeChat, 
  isDrawer = false, 
  onClose,
  onDisconnectChat,
  onBlockUser,
  onUnblockUser,
  onCancelChatRequest,
  currentUserId 
}) {
  const [activeSection, setActiveSection] = useState(null);

  if (!activeChat) return null;

  const { booking, sharedMedia, sharedFiles } = activeChat;
  const chatReq = activeChat.chatRequest;
  const rawStatus = (chatReq?.rawStatus || chatReq?.status || "NONE").toUpperCase();
  const isConnected = rawStatus === "ACCEPTED";
  const isPending = rawStatus === "PENDING" || rawStatus === "OUTGOING_PENDING" || rawStatus === "INCOMING_PENDING";
  const isRequester = rawStatus === "OUTGOING_PENDING" || (chatReq && currentUserId && String(chatReq.senderId) === String(currentUserId));
  const isBlocked = rawStatus === "BLOCKED" || rawStatus === "BLOCKED_BY_ME";
  const isBlockedByMe = chatReq?.blockedByMe || rawStatus === "BLOCKED_BY_ME" || (rawStatus === "BLOCKED" && currentUserId && String(chatReq?.senderId) === String(currentUserId));

  const resolveTargetId = () => {
    if (activeChat.targetUserId && !isNaN(Number(activeChat.targetUserId))) {
      return Number(activeChat.targetUserId);
    }
    const myIdStr = currentUserId ? String(currentUserId).trim() : "";
    if (activeChat.chatRequest) {
      const cr = activeChat.chatRequest;
      if (cr.senderId && String(cr.senderId).trim() !== myIdStr && !isNaN(Number(cr.senderId))) {
        return Number(cr.senderId);
      }
      if (cr.recipientId && String(cr.recipientId).trim() !== myIdStr && !isNaN(Number(cr.recipientId))) {
        return Number(cr.recipientId);
      }
    }
    if (typeof activeChat.id === "string" && activeChat.id.startsWith("user-")) {
      const parts = activeChat.id.split("-");
      if (parts.length === 3) {
        const id1 = String(parts[1]).trim();
        const id2 = String(parts[2]).trim();
        return Number(id1 === myIdStr ? id2 : id1);
      } else if (parts.length === 2 && String(parts[1]).trim() !== myIdStr) {
        return Number(parts[1]);
      }
    }
    if (activeChat.id && !isNaN(Number(activeChat.id))) {
      return Number(activeChat.id);
    }
    return null;
  };

  const targetId = resolveTargetId();
  const [isSavedInContacts, setIsSavedInContacts] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (targetId && String(targetId) !== String(currentUserId)) {
      checkContactSaved(targetId)
        .then((res) => {
          if (isMounted) setIsSavedInContacts(Boolean(res?.saved));
        })
        .catch(() => {
          if (isMounted) setIsSavedInContacts(false);
        });
    } else {
      setIsSavedInContacts(false);
    }
    return () => {
      isMounted = false;
    };
  }, [targetId, currentUserId]);

  const handleToggleContact = async () => {
    if (!targetId || isSavingContact) return;
    setIsSavingContact(true);
    try {
      if (isSavedInContacts) {
        const result = await Swal.fire({
          title: "Remove from Contacts?",
          html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
            Remove <strong>${activeChat.name}</strong> from your saved contacts list?
          </div>`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#e11d48",
          cancelButtonColor: "#64748b",
          confirmButtonText: "Yes, Remove",
          cancelButtonText: "Cancel",
          reverseButtons: true,
          customClass: {
            popup: "bms-swal-popup",
            title: "bms-swal-title",
            confirmButton: "bms-swal-btn-danger",
            cancelButton: "bms-swal-btn-cancel",
          }
        });
        if (result.isConfirmed) {
          await removeUserContact(targetId);
          setIsSavedInContacts(false);
          showSuccess("Contact removed from your Contacts list.");
        }
      } else {
        await saveUserContact(targetId);
        setIsSavedInContacts(true);
        showSuccess(`${activeChat.name} added to Contacts! You can view them in the Contacts tab.`);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update contacts");
    } finally {
      setIsSavingContact(false);
    }
  };

  const toggleSection = (sectionName) => {
    setActiveSection(prev => prev === sectionName ? null : sectionName);
  };

  const handleConfirmDisconnect = async () => {
    const result = await Swal.fire({
      title: "Disconnect Chat?",
      html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
        Are you sure you want to disconnect from <strong>${activeChat.name}</strong>?<br/>
        You will need to send a new request and wait for approval to chat again.
      </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Disconnect",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "bms-swal-popup",
        title: "bms-swal-title",
        confirmButton: "bms-swal-btn-danger",
        cancelButton: "bms-swal-btn-cancel",
      }
    });

    if (result.isConfirmed) {
      onDisconnectChat?.(activeChat.targetUserId || activeChat.id);
    }
  };

  const handleConfirmBlock = async () => {
    const result = await Swal.fire({
      title: `Block ${activeChat.name}?`,
      html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
        They will not be able to send you messages or contact you. You can unblock them at any time.
      </div>`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Block Contact",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "bms-swal-popup",
        title: "bms-swal-title",
        confirmButton: "bms-swal-btn-danger",
        cancelButton: "bms-swal-btn-cancel",
      }
    });

    if (result.isConfirmed) {
      onBlockUser?.(activeChat.targetUserId || activeChat.id);
    }
  };

  const handleConfirmUnblock = async () => {
    const result = await Swal.fire({
      title: `Unblock ${activeChat.name}?`,
      html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
        You will be able to send connection requests and chat with <strong>${activeChat.name}</strong> again.
      </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Unblock",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "bms-swal-popup",
        title: "bms-swal-title",
        confirmButton: "bms-swal-btn",
        cancelButton: "bms-swal-btn-cancel",
      }
    });

    if (result.isConfirmed) {
      onUnblockUser?.(activeChat.targetUserId || activeChat.id);
    }
  };

  const handleConfirmCancelRequest = async () => {
    const result = await Swal.fire({
      title: "Cancel Chat Request?",
      html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
        Do you want to cancel the connection request sent to <strong>${activeChat.name}</strong>?
      </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Cancel Request",
      cancelButtonText: "Keep Request",
      reverseButtons: true,
      customClass: {
        popup: "bms-swal-popup",
        title: "bms-swal-title",
        confirmButton: "bms-swal-btn",
        cancelButton: "bms-swal-btn-cancel",
      }
    });

    if (result.isConfirmed) {
      onCancelChatRequest?.(chatReq?.id);
    }
  };

  const renderQuickActions = () => (
    <div className="msg-actions-list">
      <PagesButton className="msg-action-item-btn">
        <Calendar size={16} />
        <span>Create New Booking</span>
      </PagesButton>
      {isSavedInContacts ? (
        <PagesButton 
          className="msg-action-item-btn"
          style={{ color: "#16a34a", background: "#f0fdf4", borderColor: "#bbf7d0" }}
          onClick={handleToggleContact}
          title="Click to remove from Contacts"
        >
          <UserCheck size={16} color="#16a34a" />
          <span style={{ fontWeight: 700 }}>✓ In Contacts</span>
        </PagesButton>
      ) : (
        <PagesButton 
          className="msg-action-item-btn"
          onClick={handleToggleContact}
          disabled={isSavingContact}
        >
          <UserPlus size={16} />
          <span>{isSavingContact ? "Saving..." : "Add to Contacts"}</span>
        </PagesButton>
      )}

      {isConnected && (
        <PagesButton 
          className="msg-action-item-btn" 
          style={{ color: "#e11d48" }}
          onClick={handleConfirmDisconnect}
        >
          <UserMinus size={16} color="#e11d48" />
          <span>Disconnect Chat</span>
        </PagesButton>
      )}

      {isPending && isRequester && (
        <PagesButton 
          className="msg-action-item-btn" 
          style={{ color: "#d97706" }}
          onClick={handleConfirmCancelRequest}
        >
          <X size={16} color="#d97706" />
          <span>Cancel Pending Request</span>
        </PagesButton>
      )}

      {isBlocked ? (
        isBlockedByMe ? (
          <PagesButton 
            className="msg-action-item-btn" 
            style={{ color: "#16a34a" }}
            onClick={handleConfirmUnblock}
          >
            <ShieldCheck size={16} color="#16a34a" />
            <span>Unblock Contact</span>
          </PagesButton>
        ) : (
          <div style={{ padding: "8px 12px", fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
            <Ban size={16} color="#94a3b8" />
            <span>Contact Blocked</span>
          </div>
        )
      ) : (
        <PagesButton 
          className="msg-action-item-btn" 
          style={{ color: "#dc2626" }}
          onClick={handleConfirmBlock}
        >
          <Ban size={16} color="#dc2626" />
          <span>Block Contact</span>
        </PagesButton>
      )}
    </div>
  );

  // Helper to render sections inside accordions for mobile drawer
  const renderAccordionItem = (id, label, content) => {
    const isExpanded = activeSection === id;
    return (
      <div className={`msg-sidebar-accordion-item ${isExpanded ? "expanded" : ""}`}>
        <PagesButton className="msg-sidebar-accordion-header" onClick={() => toggleSection(id)}>
          <span>{label}</span>
          <ChevronDown size={16} className="msg-chevron-icon" />
        </PagesButton>
        {isExpanded && (
          <div className="msg-sidebar-accordion-content animate-fadeIn">
            {content}
          </div>
        )}
      </div>
    );
  };

  if (isDrawer) {
    return (
      <div className="msg-chat-sidebar-drawer-content">
        {/* Drawer Header */}
        <div className="msg-drawer-header">
          <PagesButton className="msg-drawer-close-btn" onClick={onClose} title="Close info">
            <ArrowLeft size={20} />
          </PagesButton>
          <h3>Contact Info</h3>
        </div>

        {/* Accordions List */}
        <div className="msg-sidebar-accordion-list">
          {/* 1. About */}
          {renderAccordionItem(
            "about",
            `About ${activeChat.name}`,
            <div className="msg-sidebar-profile-card">
              <img src={activeChat.avatar} alt={activeChat.name} className="msg-sidebar-avatar" />
              <h3 className="flex items-center justify-center gap-1.5" style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px 0", lineHeight: "1.2" }}>
                {activeChat.name}
                {activeChat.online && <span className="msg-online-dot-sidebar" />}
              </h3>
              <p className="msg-sidebar-role" style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", margin: "0 0 2px 0" }}>{activeChat.role}</p>
              <p className="msg-sidebar-company" style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", margin: "0 0 12px 0" }}>{activeChat.company}</p>
              <PagesButton className="msg-sidebar-view-profile-btn" style={{ background: "#ffffff", border: "1px solid #ee008f", color: "#ee008f", borderRadius: "8px", padding: "6px 16px", fontSize: "11.5px", fontWeight: "700", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
                View Profile
              </PagesButton>
            </div>
          )}

          {/* 2. Contact */}
          {renderAccordionItem(
            "contact",
            "Contact",
            <div className="msg-contact-list">
              <div className="msg-contact-item">
                <Mail size={16} className="msg-contact-icon" />
                <a href={`mailto:${activeChat.email}`} className="msg-contact-link">
                  {activeChat.email}
                </a>
              </div>
              <div className="msg-contact-item">
                <Phone size={16} className="msg-contact-icon" />
                <a href={`tel:${activeChat.phone}`} className="msg-contact-link">
                  {activeChat.phone}
                </a>
              </div>
            </div>
          )}

          {/* 3. Related Booking */}
          {booking && renderAccordionItem(
            "booking",
            "Related Booking",
            <div className="msg-related-booking-card">
              <img src={booking.cover} alt={booking.project} className="msg-rel-booking-cover" />
              <div className="msg-rel-booking-info">
                <h5>{booking.project}</h5>
                <p className="msg-rel-booking-role">{booking.role}</p>
                <p className="msg-rel-booking-id">Booking ID: {booking.id}</p>
              </div>
              <PagesButton className="msg-rel-booking-btn">
                View Booking
              </PagesButton>
            </div>
          )}

          {/* 4. Shared Media */}
          {sharedMedia && sharedMedia.length > 0 && renderAccordionItem(
            "media",
            "Shared Media",
            <div style={{ paddingTop: "8px" }}>
              <div className="msg-section-header" style={{ marginBottom: "10px", marginTop: "4px" }}>
                <h4 style={{ margin: 0, fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Files / Media</h4>
                <PagesButton className="msg-section-view-all">View All</PagesButton>
              </div>
              <div className="msg-shared-media-grid">
                {sharedMedia.map((media) => (
                  <div key={media.id} className="msg-media-item-wrap">
                    <img src={media.url} alt="Shared asset" className="msg-media-thumb" />
                    {media.type === "video" && (
                      <div className="msg-media-video-overlay">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    {media.count && (
                      <div className="msg-media-count-overlay">{media.count}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Shared Files */}
          {sharedFiles && sharedFiles.length > 0 && renderAccordionItem(
            "files",
            "Shared Files",
            <div style={{ paddingTop: "8px" }}>
              <div className="msg-section-header" style={{ marginBottom: "10px", marginTop: "4px" }}>
                <h4 style={{ margin: 0, fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Documents</h4>
                <PagesButton className="msg-section-view-all">View All</PagesButton>
              </div>
              <div className="msg-shared-files-list">
                {sharedFiles.map((file) => (
                  <div key={file.id} className="msg-file-item">
                    <div className={`msg-file-icon-wrap ${file.type}`}>
                      <FileText size={16} />
                    </div>
                    <div className="msg-file-info">
                      <div className="msg-file-name" title={file.name}>{file.name}</div>
                      <div className="msg-file-meta">
                        {file.size} · {file.type.toUpperCase()}
                      </div>
                    </div>
                    <PagesButton className="msg-file-download-btn" title="Download File">
                      <Download size={14} />
                    </PagesButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Quick Actions */}
          {renderAccordionItem(
            "actions",
            "Quick Actions",
            renderQuickActions()
          )}
        </div>
      </div>
    );
  }

  // Desktop View (Flat panel)
  return (
    <div className="msg-chat-sidebar-panel">
      {/* Sidebar Header */}
      <div className="msg-sidebar-header">
        <h3>About {activeChat.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <PagesButton className="msg-sidebar-star-btn" title="Bookmark Contact">
            <Star size={18} />
          </PagesButton>
          {onClose && (
            <PagesButton 
              className="msg-sidebar-close-btn" 
              title={`Hide About ${activeChat.name}`}
              onClick={onClose}
            >
              <PanelRightClose size={18} />
            </PagesButton>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="msg-sidebar-profile-card">
        <img src={activeChat.avatar} alt={activeChat.name} className="msg-sidebar-avatar" />
        <h3 className="flex items-center justify-center gap-1.5">
          {activeChat.name}
          {activeChat.online && <span className="msg-online-dot-sidebar" />}
        </h3>
        <p className="msg-sidebar-role">{activeChat.role}</p>
        <p className="msg-sidebar-company">{activeChat.company}</p>
        <PagesButton className="msg-sidebar-view-profile-btn">
          View Profile
        </PagesButton>
      </div>

      {/* Contact Card */}
      <div className="msg-sidebar-section">
        <h4>Contact</h4>
        <div className="msg-contact-list">
          <div className="msg-contact-item">
            <Mail size={16} className="msg-contact-icon" />
            <a href={`mailto:${activeChat.email}`} className="msg-contact-link">
              {activeChat.email}
            </a>
          </div>
          <div className="msg-contact-item">
            <Phone size={16} className="msg-contact-icon" />
            <a href={`tel:${activeChat.phone}`} className="msg-contact-link">
              {activeChat.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Related Booking Card */}
      {booking && (
        <div className="msg-sidebar-section">
          <h4>Related Booking</h4>
          <div className="msg-related-booking-card">
            <img src={booking.cover} alt={booking.project} className="msg-rel-booking-cover" />
            <div className="msg-rel-booking-info">
              <h5>{booking.project}</h5>
              <p className="msg-rel-booking-role">{booking.role}</p>
              <p className="msg-rel-booking-id">Booking ID: {booking.id}</p>
            </div>
            <PagesButton className="msg-rel-booking-btn">
              View Booking
            </PagesButton>
          </div>
        </div>
      )}

      {/* Shared Media */}
      {sharedMedia && sharedMedia.length > 0 && (
        <div className="msg-sidebar-section">
          <div className="msg-section-header">
            <h4>Shared Media</h4>
            <PagesButton className="msg-section-view-all">View All</PagesButton>
          </div>
          <div className="msg-shared-media-grid">
            {sharedMedia.map((media) => (
              <div key={media.id} className="msg-media-item-wrap">
                <img src={media.url} alt="Shared asset" className="msg-media-thumb" />
                {media.type === "video" && (
                  <div className="msg-media-video-overlay">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                {media.count && (
                  <div className="msg-media-count-overlay">{media.count}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Files */}
      {sharedFiles && sharedFiles.length > 0 && (
        <div className="msg-sidebar-section">
          <div className="msg-section-header">
            <h4>Shared Files</h4>
            <PagesButton className="msg-section-view-all">View All</PagesButton>
          </div>
          <div className="msg-shared-files-list">
            {sharedFiles.map((file) => (
              <div key={file.id} className="msg-file-item">
                <div className={`msg-file-icon-wrap ${file.type}`}>
                  <FileText size={16} />
                </div>
                <div className="msg-file-info">
                  <div className="msg-file-name" title={file.name}>{file.name}</div>
                  <div className="msg-file-meta">
                    {file.size} · {file.type.toUpperCase()}
                  </div>
                </div>
                <PagesButton className="msg-file-download-btn" title="Download File">
                  <Download size={14} />
                </PagesButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="msg-sidebar-section last">
        <h4>Quick Actions</h4>
        {renderQuickActions()}
      </div>
    </div>
  );
}
