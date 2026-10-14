import PagesButton from "../common/PagesButton";
import React from "react";
import {
  Phone,
  Mail,
  Video,
  MoreVertical,
  MapPin,
  Globe,
  ArrowLeft
} from "lucide-react";
import { FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

export default function ContactDetails({
  contact,
  activeSubTab,
  onSelectSubTab,
  onBack
}) {
  if (!contact) {
    return (
      <div className="contact-details-column empty-state">
        <p>Select a contact to view details</p>
      </div>
    );
  }

  const subTabs = [
    { id: "Overview", label: "Overview" },
    { id: "Projects", label: `Projects (${contact.projects?.length || 0})` },
    { id: "Notes", label: "Notes" },
    { id: "Shared Files", label: "Shared Files" },
    { id: "History", label: "History" }
  ];

  return (
    <div className="contact-details-column">
      {/* 1. Profile Header Area */}
      <div className="contact-details-header">
        <div className="contact-header-identity">
          {onBack && (
            <PagesButton 
              className="contact-details-back-btn md:hidden" 
              onClick={onBack} 
              aria-label="Back to contacts list"
            >
              <ArrowLeft size={24} />
            </PagesButton>
          )}
          <div className="contact-header-avatar-wrapper">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="contact-header-avatar"
              />
            ) : (
              <div className="contact-header-avatar-placeholder">
                {contact.companyInfo?.logoText || contact.name.charAt(0)}
              </div>
            )}
            {contact.online && <span className="contact-header-online-badge" />}
          </div>

          <div className="contact-header-meta">
            <h2 className="contact-header-name">{contact.name}</h2>
            <span className="contact-header-role">{contact.role}</span>
            <span className="contact-header-company-loc">
              {contact.company} &bull; {contact.location}
            </span>
            
            {/* Tags Row */}
            <div className="contact-header-tags">
              {contact.tags?.map((tag, idx) => (
                <span key={idx} className={`contact-tag-badge ${idx === 1 ? "purple-badge" : ""}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="contact-header-actions">
          <PagesButton className="contact-action-btn" aria-label="Call">
            <Phone size={18} />
          </PagesButton>
          <PagesButton className="contact-action-btn" aria-label="Email">
            <Mail size={18} />
          </PagesButton>
          <PagesButton className="contact-action-btn" aria-label="Video Call">
            <Video size={18} />
          </PagesButton>
          <PagesButton className="contact-action-btn" aria-label="More Options">
            <MoreVertical size={18} />
          </PagesButton>
        </div>
      </div>

      {/* 2. Sub Tabs Navigation */}
      <div className="contact-details-subtabs">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <PagesButton
              key={tab.id}
              className={`contact-subtab-btn ${isActive ? "active" : ""}`}
              onClick={() => onSelectSubTab(tab.id)}
            >
              {tab.label}
              {isActive && <div className="contact-subtab-underline" />}
            </PagesButton>
          );
        })}
      </div>

      {/* 3. Detail Panels (Conditional based on active tab) */}
      <div className="contact-details-content scrollbar-custom">
        {activeSubTab === "Overview" && (
          <div className="contact-overview-pane">
            
            {/* Contact Information */}
            <div className="contact-info-panel card-panel">
              <h3 className="panel-title">Contact Information</h3>
              
              <div className="contact-info-grid">
                {contact.contactInfo?.email && (
                  <div className="info-item">
                    <Mail size={16} className="info-icon" />
                    <div>
                      <span className="info-label">Email</span>
                      <a href={`mailto:${contact.contactInfo.email}`} className="info-value link-value">
                        {contact.contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}

                {contact.contactInfo?.phone && (
                  <div className="info-item">
                    <Phone size={16} className="info-icon" />
                    <div>
                      <span className="info-label">Phone</span>
                      <span className="info-value">{contact.contactInfo.phone}</span>
                    </div>
                  </div>
                )}

                {contact.contactInfo?.address && (
                  <div className="info-item full-width">
                    <MapPin size={16} className="info-icon" />
                    <div>
                      <span className="info-label">Address</span>
                      <span className="info-value" style={{ whiteSpace: "pre-line" }}>{contact.contactInfo.address}</span>
                    </div>
                  </div>
                )}

                {contact.contactInfo?.website && (
                  <div className="info-item">
                    <Globe size={16} className="info-icon" />
                    <div>
                      <span className="info-label">Website</span>
                      <a href={`https://${contact.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="info-value link-value">
                        {contact.contactInfo.website}
                      </a>
                    </div>
                  </div>
                )}

                {contact.contactInfo?.socials?.instagram && (
                  <div className="info-item">
                    <FaInstagram size={16} className="info-icon" />
                    <div>
                      <span className="info-label">Instagram</span>
                      <span className="info-value">{contact.contactInfo.socials.instagram}</span>
                    </div>
                  </div>
                )}

                {contact.contactInfo?.socials?.linkedin && (
                  <div className="info-item">
                    <FaLinkedin size={16} className="info-icon" />
                    <div>
                      <span className="info-label">LinkedIn</span>
                      <span className="info-value">{contact.contactInfo.socials.linkedin}</span>
                    </div>
                  </div>
                )}

                {contact.contactInfo?.socials?.twitter && (
                  <div className="info-item">
                    <FaXTwitter size={16} className="info-icon" />
                    <div>
                      <span className="info-label">Twitter</span>
                      <span className="info-value">{contact.contactInfo.socials.twitter}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About Biography */}
            <div className="contact-about-panel card-panel">
              <h3 className="panel-title">About</h3>
              <p className="about-text">{contact.about || "No biography available."}</p>
            </div>

            {/* Recent Projects */}
            <div className="contact-projects-panel card-panel">
              <div className="panel-header-row">
                <h3 className="panel-title font-semibold">Recent Projects</h3>
                <PagesButton
                  className="panel-view-all-btn"
                  onClick={() => onSelectSubTab("Projects")}
                >
                  View All
                </PagesButton>
              </div>

              <div className="projects-grid">
                {contact.projects && contact.projects.length > 0 ? (
                  contact.projects.map((project) => (
                    <div key={project.id} className="project-card">
                      <img
                        src={project.cover}
                        alt={project.title}
                        className="project-cover"
                      />
                      <div className="project-body">
                        <h4 className="project-title">{project.title}</h4>
                        <span className={`project-type-badge ${project.type === "Web Series" ? "badge-blue" : project.type === "Feature Film" ? "badge-orange" : "badge-green"}`}>
                          {project.type}
                        </span>
                        <span className="project-meta-role">{project.role}</span>
                        <span className="project-meta-year">{project.year}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-projects-placeholder">No projects registered.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "Projects" && (
          <div className="contact-projects-full-pane">
            <h3 className="panel-title">All Projects ({contact.projects?.length || 0})</h3>
            <div className="projects-list-vertical">
              {contact.projects && contact.projects.length > 0 ? (
                contact.projects.map((project) => (
                  <div key={project.id} className="project-list-row">
                    <img src={project.cover} alt={project.title} className="project-row-cover" />
                    <div className="project-row-details">
                      <div className="project-row-title-bar">
                        <h4>{project.title}</h4>
                        <span className="project-type-badge">{project.type}</span>
                      </div>
                      <p className="project-row-subtext">{project.role} &bull; {project.year}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No projects documented for this contact.</p>
              )}
            </div>
          </div>
        )}

        {activeSubTab === "Notes" && (
          <div className="contact-notes-pane">
            <h3 className="panel-title">Notes & Memos</h3>
            <textarea
              className="notes-textarea"
              placeholder="Write a private note about this contact..."
              defaultValue={`Met at the Film festival last November. Discussed scheduling opportunities for the upcoming project.`}
            />
            <PagesButton className="contacts-save-notes-btn">Save Note</PagesButton>
          </div>
        )}

        {activeSubTab === "Shared Files" && (
          <div className="contact-shared-files-pane">
            <h3 className="panel-title">Shared Documents</h3>
            <div className="shared-files-list">
              <div className="shared-file-item">
                <div className="shared-file-icon-pdf">PDF</div>
                <div className="shared-file-meta">
                  <span className="shared-file-name">Portfolio_ArjunMalhotra.pdf</span>
                  <span className="shared-file-size">4.8 MB &bull; Shared on May 12</span>
                </div>
              </div>
              <div className="shared-file-item">
                <div className="shared-file-icon-doc">DOCX</div>
                <div className="shared-file-meta">
                  <span className="shared-file-name">Agreement_ZenithFilms_Signed.docx</span>
                  <span className="shared-file-size">1.2 MB &bull; Shared on Apr 28</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "History" && (
          <div className="contact-history-pane">
            <h3 className="panel-title">Interaction Logs</h3>
            <div className="history-timeline">
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-date">Yesterday, 11:30 AM</span>
                  <p className="timeline-desc">Received message about an exciting project opportunity.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-date">May 2, 2:00 PM</span>
                  <p className="timeline-desc">Scheduled virtual casting interview with director Amit Sharma.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-date">Apr 28, 4:15 PM</span>
                  <p className="timeline-desc">Sent updated headshots and character breakdown portfolio.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
