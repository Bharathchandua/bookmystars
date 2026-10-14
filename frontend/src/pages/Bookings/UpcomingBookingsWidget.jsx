import PagesButton from "../common/PagesButton";
import { Calendar } from "lucide-react";

export default function UpcomingBookingsWidget() {
  const upcoming = [
    {
      id: 1,
      title: "Oceanic Perfume – TVC",
      date: "18 May 2024",
      daysBadge: "1 Day",
      relativeTime: "Today",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop&q=80",
    },
    {
      id: 2,
      title: "Shadows of Truth",
      date: "20 May 2024",
      daysBadge: "22 Days",
      relativeTime: "2 Days",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
    },
    {
      id: 3,
      title: "Dil Ki Baat – Season 2",
      date: "25 May 2024",
      daysBadge: "52 Days",
      relativeTime: "7 Days",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&q=80",
    },
  ];

  return (
    <div className="opp-widget">
      {/* Header */}
      <div className="earnings-widget-head">
        <span className="opp-widget-head-title">Upcoming Bookings</span>
        <PagesButton className="opp-widget-view-all">View All</PagesButton>
      </div>

      {/* List */}
      <div className="upcoming-bookings-list">
        {upcoming.map((item) => (
          <div key={item.id} className="upcoming-booking-row">
            <div className="upcoming-thumb">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="upcoming-info">
              <h4 className="upcoming-title">{item.title}</h4>
              <p className="upcoming-date">{item.date}</p>
            </div>
            <div className="upcoming-badge-wrap">
              <span className="upcoming-days-badge">{item.daysBadge}</span>
              <span className="upcoming-duration">{item.relativeTime}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Button */}
      <div className="upcoming-bookings-footer">
        <PagesButton className="view-full-calendar-btn">
          <Calendar size={13} />
          <span>View Full Calendar</span>
        </PagesButton>
      </div>
    </div>
  );
}
