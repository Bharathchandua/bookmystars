import PagesButton from "../common/PagesButton";
import { MoreHorizontal } from "lucide-react";
import { UPCOMING_EVENTS } from "./calendarData.js";

export default function UpcomingEvents() {
  return (
    <div className="cal-upcoming-card">
      <div className="cal-upcoming-header">
        <span className="cal-upcoming-title">Upcoming Events</span>
        <PagesButton className="cal-upcoming-view-all">View All</PagesButton>
      </div>

      <div className="cal-upcoming-list">
        {UPCOMING_EVENTS.map(evt => (
          <div key={evt.id} className="cal-upcoming-item">
            {/* Date Badge */}
            <div className="cal-upcoming-date-badge">
              <span className="cal-upcoming-month">{evt.month}</span>
              <span className="cal-upcoming-day">{evt.day}</span>
            </div>

            {/* Info */}
            <div className="cal-upcoming-info">
              <div className="cal-upcoming-name">{evt.title}</div>
              <div className="cal-upcoming-sub">{evt.sub}</div>
              <div className="cal-upcoming-time">{evt.time}</div>
            </div>

            {/* More button */}
            <PagesButton className="cal-upcoming-more" title="More options">
              <MoreHorizontal size={14} />
            </PagesButton>
          </div>
        ))}
      </div>
    </div>
  );
}
