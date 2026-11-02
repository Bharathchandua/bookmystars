import PagesButton from "../common/PagesButton";
import { Bell, MoreHorizontal, ArrowRight } from "lucide-react";
import { TODAY_EVENTS } from "./calendarData.js";

export default function AgendaList({ selectedCategory }) {
  const today = new Date();
  const dayNames  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const monthNames= ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];

  const dateLabel = `${dayNames[today.getDay()]}, ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

  const filteredEvents = TODAY_EVENTS.filter(evt => {
    if (selectedCategory !== "all" && evt.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="cal-agenda">
      <div className="cal-agenda-outer-card">
        <div className="cal-agenda-main-header">
          <div className="cal-agenda-title-text">Today, {dateLabel}</div>
        </div>

        <div className="cal-agenda-items-list">
          {filteredEvents.length === 0 ? (
            <div className="cal-agenda-empty">
              No events scheduled in this category for today.
            </div>
          ) : (
            filteredEvents.map(evt => (
              <div key={evt.id} className="cal-agenda-event-card">
                {/* Time */}
                <div className="cal-agenda-time-col">
                  <span className="cal-agenda-start">{evt.startTime}</span>
                  <span className="cal-agenda-end">{evt.endTime}</span>
                </div>

                {/* Dot */}
                <div className="cal-agenda-dot-col">
                  <span className={`cal-agenda-dot ${evt.category}`} />
                </div>

                {/* Info */}
                <div className="cal-agenda-info">
                  <div className="cal-agenda-name">{evt.title}</div>
                  <div className="cal-agenda-location">{evt.location}</div>
                </div>

                {/* Badge */}
                <span className={`cal-agenda-badge ${evt.category}`}>
                  {evt.category.charAt(0).toUpperCase() + evt.category.slice(1)}
                </span>

                {/* Actions */}
                <div className="cal-agenda-actions">
                  <PagesButton className="cal-agenda-reminder-btn" title="Set Reminder">
                    <Bell size={13} />
                    <span>Reminder</span>
                  </PagesButton>
                  <PagesButton className="cal-agenda-more-btn" title="More options">
                    <MoreHorizontal size={14} />
                  </PagesButton>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View Full Agenda Button */}
        <PagesButton className="cal-view-agenda-btn">
          View Full Agenda
          <ArrowRight size={14} />
        </PagesButton>
      </div>
    </div>
  );
}
