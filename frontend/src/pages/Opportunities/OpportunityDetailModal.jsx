import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { X, MapPin, CalendarDays, IndianRupee, Bookmark, CheckCircle } from "lucide-react";

export default function OpportunityDetailModal({ opp, onClose }) {
  const [applied, setApplied] = useState(false);
  const [saved,   setSaved]   = useState(false);

  if (!opp) return null;

  return (
    <div className="opp-modal-overlay" onClick={onClose}>
      <div className="opp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Banner */}
        <div className="opp-modal-banner-wrap">
          <img src={opp.banner} alt={opp.title} />
          <div className="opp-modal-banner-overlay" />
          <PagesButton className="opp-modal-close-btn" onClick={onClose}>
            <X size={16} />
          </PagesButton>
        </div>

        {/* Body */}
        <div className="opp-modal-body">
          <div className="opp-modal-type">
            <span className={`opp-type-badge ${opp.badgeClass}`}>{opp.type}</span>
          </div>
          <h2 className="opp-modal-title">{opp.title}</h2>

          {/* Meta tags */}
          <div className="opp-modal-tags">
            <span className="opp-modal-tag"><MapPin size={12} /> {opp.location}</span>
            <span className="opp-modal-tag"><CalendarDays size={12} /> Audition: {opp.auditionDate}</span>
            <span className="opp-modal-tag"><IndianRupee size={12} /> {opp.budget}</span>
          </div>

          {/* About Role */}
          <div className="opp-modal-section">
            <h4 className="opp-modal-section-title">About This Role</h4>
            <p className="opp-modal-desc-text">{opp.fullDesc}</p>
          </div>

          {/* Requirements */}
          <div className="opp-modal-section">
            <h4 className="opp-modal-section-title">Requirements</h4>
            <div className="opp-modal-req-list">
              {opp.requirements.map((req, i) => (
                <div key={i} className="opp-modal-req-row">
                  <div className="opp-modal-req-dot" />
                  {req}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="opp-modal-apply-row">
            <PagesButton
              className={`opp-modal-apply-btn ${applied ? "applied" : ""}`}
              onClick={() => setApplied((a) => !a)}
            >
              {applied ? "✓ Application Sent!" : "Apply Now"}
            </PagesButton>
            <PagesButton
              className={`opp-modal-save-btn ${saved ? "saved" : ""}`}
              onClick={() => setSaved((s) => !s)}
              aria-label="Save"
            >
              <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
            </PagesButton>
          </div>
        </div>
      </div>
    </div>
  );
}
