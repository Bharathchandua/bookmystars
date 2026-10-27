import PagesButton from "../common/PagesButton";
import { MoreVertical } from "lucide-react";

export default function RecentApplications({ applications, onViewUpdate, emptyMessage = "No applications found." }) {
  return (
    <div className="ac-list">
      {applications.length > 0 ? (
        applications.map((item) => (
          <div key={item.id} className="ac-recent-item">
            
            <div className="ac-recent-media">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.project}
                  className="ac-square-thumb"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div 
                className="ac-square-thumb flex items-center justify-center bg-slate-100 text-slate-500 font-bold text-xs"
                style={{ display: item.thumbnail ? "none" : "flex" }}
              >
                🎬
              </div>
              <div className="ac-invite-info">
                <span className="ac-project-name">{item.project}</span>
                <span className="ac-project-type">{item.type}</span>
              </div>
            </div>

            <div className="ac-invite-meta-block">
              <span className="ac-meta-label">Applied on</span>
              <span className="ac-meta-val">{item.appliedDate}</span>
            </div>

            <div className="ac-invite-meta-block">
              <span className="ac-meta-label">Status</span>
              <span
                className={`ac-status-pill ${item.status
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {item.status}
              </span>
            </div>

            <div className="ac-invite-meta-block">
              <span className="ac-meta-label">Role</span>
              <span className="ac-meta-val">{item.role}</span>
            </div>

            <div className="ac-actions-group">
              <PagesButton
                onClick={() => onViewUpdate(item)}
                className="ac-outline-btn"
              >
                View Update
              </PagesButton>
              <PagesButton className="ac-dots-btn" aria-label="More Options">
                <MoreVertical size={16} />
              </PagesButton>
            </div>

          </div>
        ))
      ) : (
        <div className="py-8 text-center text-slate-500 font-medium text-xs">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
