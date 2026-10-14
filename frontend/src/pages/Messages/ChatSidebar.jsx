import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { Star, Mail, Phone, ExternalLink, Calendar, UserPlus, Download, FileText, ChevronDown, ArrowLeft } from "lucide-react";

export default function ChatSidebar({ activeChat, isDrawer = false, onClose }) {
  const [activeSection, setActiveSection] = useState(null);

  if (!activeChat) return null;

  const { booking, sharedMedia, sharedFiles } = activeChat;

  const toggleSection = (sectionName) => {
    setActiveSection(prev => prev === sectionName ? null : sectionName);
  };

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
            <div className="msg-actions-list">
              <PagesButton className="msg-action-item-btn">
                <Calendar size={16} />
                <span>Create New Booking</span>
              </PagesButton>
              <PagesButton className="msg-action-item-btn">
                <UserPlus size={16} />
                <span>Add to Contacts</span>
              </PagesButton>
            </div>
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
        <PagesButton className="msg-sidebar-star-btn" title="Bookmark Contact">
          <Star size={18} />
        </PagesButton>
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
        <div className="msg-actions-list">
          <PagesButton className="msg-action-item-btn">
            <Calendar size={16} />
            <span>Create New Booking</span>
          </PagesButton>
          <PagesButton className="msg-action-item-btn">
            <UserPlus size={16} />
            <span>Add to Contacts</span>
          </PagesButton>
        </div>
      </div>
    </div>
  );
}
