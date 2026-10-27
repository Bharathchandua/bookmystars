import PagesButton from "../common/PagesButton";
import { MapPin, CalendarDays } from "lucide-react";

export default function UpcomingAuditions({ items = [], onViewCalendar, onSelectItem }) {
  // Purely database driven: format incoming bookings; if none exist, empty array
  const displayItems = (items || []).slice(0, 3).map((item, idx) => {
    let day = "--";
    let month = "TBD";
    if (item.bookingDate) {
      try {
        const d = new Date(item.bookingDate);
        if (!isNaN(d.getTime())) {
          day = String(d.getDate()).padStart(2, "0");
          month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
        }
      } catch (e) {}
    }
    return {
      id: item.id || idx,
      day,
      month,
      title: item.projectTitle || "Audition Call",
      subtitle: item.projectType || "Casting Call",
      time: item.bookingTime || item.time || "Scheduled Slot",
      location: item.location || "Location TBD",
      raw: item
    };
  });

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
        {displayItems.length > 0 ? (
          displayItems.map((item) => (
            <div 
              key={item.id} 
              className="ac-upcoming-item"
              style={{ cursor: onSelectItem && item.raw ? "pointer" : "default" }}
              onClick={() => {
                if (onSelectItem && item.raw) onSelectItem(item.raw);
              }}
            >
              <div className="ac-date-badge">
                <span className="day">{item.day}</span>
                <span className="month">{item.month}</span>
              </div>
              <div className="ac-upcoming-details">
                <span className="ac-upcoming-title">{item.title}</span>
                <span className="ac-upcoming-subtitle">{item.subtitle}</span>
                <div className="ac-upcoming-time-loc">
                  <span>{item.time}</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400" />
                    {item.location}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 px-3 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <CalendarDays size={20} className="mx-auto text-slate-300 mb-1.5" />
            <span>No upcoming auditions scheduled</span>
          </div>
        )}
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
