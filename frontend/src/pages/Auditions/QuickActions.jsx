import PagesButton from "../common/PagesButton";
import { Search, Star, Upload, CalendarDays, Sparkles } from "lucide-react";

export default function QuickActions({ onUploadMedia, onAvailabilityCalendar }) {
  return (
    <div className="ac-sidebar-card">
      <div className="ac-sidebar-header" style={{ marginBottom: '12px' }}>
        <h3>Quick Actions</h3>
      </div>

      <div className="ac-quick-list">
        <PagesButton className="ac-quick-item">
          <div className="ac-quick-icon-wrapper">
            <Search size={14} />
          </div>
          <div className="ac-quick-text">
            <span className="ac-quick-title">Browse Opportunities</span>
            <span className="ac-quick-sub">Find new auditions and projects</span>
          </div>
        </PagesButton>

        <PagesButton className="ac-quick-item">
          <div className="ac-quick-icon-wrapper">
            <Star size={14} />
          </div>
          <div className="ac-quick-text">
            <span className="ac-quick-title">Update Profile</span>
            <span className="ac-quick-sub">Keep your profile updated</span>
          </div>
        </PagesButton>

        <PagesButton className="ac-quick-item" onClick={onUploadMedia}>
          <div className="ac-quick-icon-wrapper">
            <Upload size={14} />
          </div>
          <div className="ac-quick-text">
            <span className="ac-quick-title">Upload New Media</span>
            <span className="ac-quick-sub">Add photos, videos or documents</span>
          </div>
        </PagesButton>

        <PagesButton className="ac-quick-item" onClick={onAvailabilityCalendar}>
          <div className="ac-quick-icon-wrapper">
            <CalendarDays size={14} />
          </div>
          <div className="ac-quick-text">
            <span className="ac-quick-title">Availability Calendar</span>
            <span className="ac-quick-sub">Manage your availability</span>
          </div>
        </PagesButton>

        <PagesButton className="ac-quick-item">
          <div className="ac-quick-icon-wrapper">
            <Sparkles size={14} />
          </div>
          <div className="ac-quick-text">
            <span className="ac-quick-title">Casting Network</span>
            <span className="ac-quick-sub">Connect with casting directors</span>
          </div>
        </PagesButton>
      </div>
    </div>
  );
}
