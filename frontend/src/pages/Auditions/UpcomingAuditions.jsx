import PagesButton from "../common/PagesButton";
import { MapPin } from "lucide-react";

export default function UpcomingAuditions({ onViewCalendar }) {
  return (
    <div className="ac-sidebar-card">
      <div className="ac-sidebar-header">
        <h3>Upcoming Auditions</h3>
        <PagesButton 
          className="ac-view-all-link" 
          style={{ padding: 0 }} 
          onClick={onViewCalendar}
        >
          View Calendar
        </PagesButton>
      </div>

      <div className="ac-upcoming-list">
        <div className="ac-upcoming-item">
          <div className="ac-date-badge">
            <span className="day">15</span>
            <span className="month">MAY</span>
          </div>
          <div className="ac-upcoming-details">
            <span className="ac-upcoming-title">The Last Chapter</span>
            <span className="ac-upcoming-subtitle">Feature Film</span>
            <div className="ac-upcoming-time-loc">
              <span>10:00 AM - 12:00 PM</span>
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-slate-400" />
                Mumbai
              </span>
            </div>
          </div>
        </div>

        <div className="ac-upcoming-item">
          <div className="ac-date-badge">
            <span className="day">18</span>
            <span className="month">MAY</span>
          </div>
          <div className="ac-upcoming-details">
            <span className="ac-upcoming-title">City Lights</span>
            <span className="ac-upcoming-subtitle">Web Series</span>
            <div className="ac-upcoming-time-loc">
              <span>2:00 PM - 4:00 PM</span>
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-slate-400" />
                Mumbai
              </span>
            </div>
          </div>
        </div>
      </div>

      <PagesButton 
        className="ac-purple-outline-btn mt-2" 
        onClick={onViewCalendar}
      >
        View Full Calendar
      </PagesButton>
    </div>
  );
}
