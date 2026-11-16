import PagesButton from "../common/PagesButton";
import { MoreHorizontal } from "lucide-react";

const MONTH_NAMES_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

export default function UpcomingEvents({ events = [] }) {
  const todayStr = new Date().toISOString().split("T")[0];

  const upcoming = (events || [])
    .filter(e => e.date && e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
    .map(e => {
      const parts = e.date.split("-");
      const monthIdx = parseInt(parts[1], 10) - 1;
      const dayNum = parseInt(parts[2], 10);
      return {
        id: e.id,
        month: MONTH_NAMES_SHORT[monthIdx] || "NOW",
        day: dayNum,
        title: e.title,
        sub: e.sub || e.location || (e.category ? e.category.toUpperCase() : "Scheduled"),
        time: e.time ? `${e.time}${e.endTime ? ` – ${e.endTime}` : ""}` : "All Day",
        category: e.category || "shooting",
      };
    });

  return (
    <div className="cal-upcoming-card">
      <div className="cal-upcoming-header">
        <span className="cal-upcoming-title">Upcoming Events</span>
        <PagesButton className="cal-upcoming-view-all">View All</PagesButton>
      </div>

      <div className="cal-upcoming-list">
        {upcoming.length === 0 ? (
          <div style={{ padding: "20px 14px", color: "#64748b", fontSize: "13px", textAlign: "center" }}>
            No upcoming events scheduled. Click "+ Add Event" to schedule shoots or blocks.
          </div>
        ) : (
          upcoming.map(evt => (
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
          ))
        )}
      </div>
    </div>
  );
}
