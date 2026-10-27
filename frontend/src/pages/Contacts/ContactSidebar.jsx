import PagesButton from "../common/PagesButton";
import React from "react";
import { MessageSquare, Calendar, Share2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContactSidebar({
  contact,
  onToggleStar,
  onSendMessageClick
}) {
  const navigate = useNavigate();

  if (!contact) {
    return (
      <div className="contact-sidebar-column empty-state">
        <p>No sidebar details</p>
      </div>
    );
  }

  const company = contact.companyInfo;
  const conversations = contact.conversations || [];

  return (
    <div className="contact-sidebar-column">
      
      {/* 1. Quick Actions */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Quick Actions</h3>
        <div className="quick-actions-list">
          <PagesButton
            className="quick-action-row"
            onClick={() => onSendMessageClick ? onSendMessageClick(contact) : navigate("/messages", { state: { targetUser: contact } })}
          >
            <div className="quick-action-icon-wrapper">
              <MessageSquare size={16} />
            </div>
            <span className="quick-action-label">Send Message</span>
          </PagesButton>

          <PagesButton className="quick-action-row">
            <div className="quick-action-icon-wrapper">
              <Calendar size={16} />
            </div>
            <span className="quick-action-label">Schedule Meeting</span>
          </PagesButton>

          <PagesButton className="quick-action-row">
            <div className="quick-action-icon-wrapper">
              <Share2 size={16} />
            </div>
            <span className="quick-action-label">Share Contact</span>
          </PagesButton>

          <PagesButton
            className={`quick-action-row ${contact.starred ? "starred" : ""}`}
            onClick={() => onToggleStar(contact.id)}
          >
            <div className="quick-action-icon-wrapper">
              <Star size={16} className={contact.starred ? "fill-amber-400 text-amber-400" : ""} />
            </div>
            <span className="quick-action-label">
              {contact.starred ? "Remove from Favorites" : "Add to Favorites"}
            </span>
          </PagesButton>
        </div>
      </div>

      {/* 2. Company Information */}
      {company && (
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Company Information</h3>
          <div className="company-info-card">
            <div className="company-header-row">
              <div className="company-logo-badge">
                {company.logoText || "CO"}
              </div>
              <div className="company-meta">
                <h4 className="company-name">{company.name}</h4>
              </div>
            </div>

            <div className="company-details-table">
              <div className="company-table-row">
                <span className="company-table-label">Industry</span>
                <span className="company-table-value">{company.industry}</span>
              </div>
              <div className="company-table-row">
                <span className="company-table-label">Founded</span>
                <span className="company-table-value">{company.founded}</span>
              </div>
              <div className="company-table-row">
                <span className="company-table-label">Head Office</span>
                <span className="company-table-value">{company.headOffice}</span>
              </div>
              <div className="company-table-row">
                <span className="company-table-label">Website</span>
                <span className="company-table-value link-value">{company.website}</span>
              </div>
            </div>

            <PagesButton className="company-view-profile-btn">
              View Company Profile
            </PagesButton>
          </div>
        </div>
      )}

      {/* 3. Recent Conversations */}
      <div className="sidebar-section">
        <div className="panel-header-row">
          <h3 className="sidebar-section-title">Recent Conversations</h3>
          <PagesButton
            className="sidebar-view-all-link"
            onClick={() => navigate("/messages")}
          >
            View All
          </PagesButton>
        </div>

        <div className="recent-conversations-list">
          {conversations.length > 0 ? (
            conversations.map((conv, idx) => (
              <div key={conv.id || idx} className="recent-conv-item">
                <div className="recent-conv-avatar-wrapper">
                  {contact.avatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="recent-conv-avatar"
                    />
                  ) : (
                    <div className="recent-conv-avatar-placeholder">
                      {contact.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="recent-conv-body">
                  <div className="recent-conv-header">
                    <h4 className="recent-conv-name">{contact.name}</h4>
                    <span className="recent-conv-time">{conv.time}</span>
                  </div>
                  <div className="recent-conv-footer">
                    <p className="recent-conv-msg">{conv.message}</p>
                    {conv.unread && (
                      <span className="recent-conv-unread-badge">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-conversations-placeholder">
              No recent conversations recorded.
            </div>
          )}

          {conversations.length > 0 && (
            <PagesButton
              className="view-all-messages-btn"
              onClick={() => navigate("/messages")}
            >
              View All Messages
            </PagesButton>
          )}
        </div>
      </div>

    </div>
  );
}
