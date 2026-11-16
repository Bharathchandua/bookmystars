import PagesButton from "../common/PagesButton";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UpcomingBookingsWidget({ bookings = [] }) {
  const navigate = useNavigate();

  // Filter for confirmed or pending bookings that are upcoming
  const upcoming = bookings
    .filter((b) => b.status === "Confirmed" || b.status === "Pending")
    .slice(0, 4);

  return (
    <div className="opp-widget">
      {/* Header */}
      <div className="earnings-widget-head">
        <span className="opp-widget-head-title">Upcoming Bookings</span>
        <PagesButton className="opp-widget-view-all" onClick={() => navigate("/calendar")}>
          View All
        </PagesButton>
      </div>

      {/* List */}
      <div className="upcoming-bookings-list">
        {upcoming.length === 0 ? (
          <div style={{ padding: "16px", color: "#64748b", fontSize: "13px", textAlign: "center" }}>
            No upcoming bookings scheduled.
          </div>
        ) : (
          upcoming.map((item) => (
            <div key={item.id} className="upcoming-booking-row">
              <div className="upcoming-thumb">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="upcoming-info">
                <h4 className="upcoming-title">{item.title}</h4>
                <p className="upcoming-date">{item.datesDisplay || item.rawStartDate}</p>
              </div>
              <div className="upcoming-badge-wrap">
                <span className="upcoming-days-badge" style={{
                  background: item.status === "Confirmed" ? "#dcfce7" : "#fef3c7",
                  color: item.status === "Confirmed" ? "#166534" : "#92400e"
                }}>
                  {item.status}
                </span>
                <span className="upcoming-duration">{item.payment}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Button */}
      <div className="upcoming-bookings-footer">
        <PagesButton className="view-full-calendar-btn" onClick={() => navigate("/calendar")}>
          <Calendar size={13} />
          <span>View Full Calendar</span>
        </PagesButton>
      </div>
    </div>
  );
}
