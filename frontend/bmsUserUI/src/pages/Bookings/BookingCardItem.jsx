import PagesButton from "../common/PagesButton";
import PagesCard from "../common/PagesCard";
import { useState } from "react";
import { MoreVertical, Calendar } from "lucide-react";

// Category → badge CSS class (kept for the badge colour chip only)
const CATEGORY_CLASS = {
  "web series":   "cat-web-series",
  "feature film": "cat-feature-film",
  "tv serial":    "cat-tv-serial",
  "commercial":   "cat-commercial",
  "web film":     "cat-web-film",
  "brand shoot":  "cat-brand-shoot",
};

// Fallback colours — used only if booking doesn't carry its own hoverColor
const CATEGORY_HOVER_SHADOW = {
  "web series":   "rgba(109, 40, 217, 0.14)",   // purple
  "feature film": "rgba(190, 24,  93, 0.14)",   // pink
  "tv serial":    "rgba(  3,105, 161, 0.14)",   // blue
  "commercial":   "rgba(180, 83,   9, 0.14)",   // amber
  "web film":     "rgba( 15,118, 110, 0.14)",   // teal
  "brand shoot":  "rgba(190, 18,  60, 0.14)",   // rose
};
const CATEGORY_HOVER_BORDER = {
  "web series":   "#c4b5fd",
  "feature film": "#f9a8d4",
  "tv serial":    "#7dd3fc",
  "commercial":   "#fcd34d",
  "web film":     "#5eead4",
  "brand shoot":  "#fda4af",
};

export default function BookingCardItem({ booking, onOpenDetail }) {
  const [hovered, setHovered] = useState(false);

  const catKey = booking.category.toLowerCase();
  const categoryClass = CATEGORY_CLASS[catKey] || "cat-web-series";

  // Use per-booking unique colour if provided, otherwise fall back to category colour
  const hoverShadow = booking.hoverColor  || CATEGORY_HOVER_SHADOW[catKey] || "rgba(0,0,0,0.08)";
  const hoverBorder = booking.hoverBorder || CATEGORY_HOVER_BORDER[catKey] || "#e2e8f0";

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":  return "status-confirmed";
      case "pending":    return "status-pending";
      case "completed":  return "status-completed";
      case "cancelled":  return "status-cancelled";
      default:           return "status-confirmed";
    }
  };

  return (
    <PagesCard
      className="booking-item-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: hovered ? hoverBorder : undefined,
        boxShadow:   hovered
          ? `0 6px 28px ${hoverShadow}, 0 1px 6px ${hoverShadow}`
          : undefined,
        transition: "box-shadow 0.22s ease, border-color 0.22s ease",
      }}
    >
      {/* Thumbnail */}
      <div className="booking-card-thumb">
        <img src={booking.image} alt={booking.title} />
      </div>

      {/* Details Grid (Split into Left/Right Columns) */}
      <div className="booking-card-details-grid">
        {/* Left Column: Info & Booking Dates */}
        <div className="booking-card-col-left">
          <div className="booking-card-info">
            <span className={`booking-category-badge ${categoryClass}`}>
              {booking.category}
            </span>
            <h3 className="booking-card-title">{booking.title}</h3>
            <p className="booking-card-meta">
              Role: <strong>{booking.role}</strong>
            </p>
            <p className="booking-card-meta">{booking.company}</p>
            <p className="booking-card-meta">{booking.location}</p>
          </div>

          <div className="booking-card-dates-left">
            <span className="booking-card-dates-label">Booking Dates</span>
            <div className="booking-dates-range">
              <Calendar size={13} className="booking-card-icon" style={{ marginRight: "4px", flexShrink: 0 }} />
              {booking.datesDisplay}
            </div>
            <span className="booking-dates-days">({booking.days} Days)</span>
          </div>
        </div>

        {/* Right Column: Booked On & Payment/Status Actions */}
        <div className="booking-card-col-right">
          <div className="booking-card-booked-on">
            <span className="booking-card-dates-label">Booked On</span>
            <span className="booking-card-meta" style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
              <Calendar size={13} className="booking-card-icon" style={{ marginRight: "4px", flexShrink: 0 }} />
              {booking.bookedOn}
            </span>
          </div>

          <div className="booking-card-right-actions">
            <span className="booking-payment-label">Payment</span>
            <p className="booking-payment-val">{booking.payment}</p>
            <span className={`booking-status-badge ${getStatusClass(booking.status)}`}>
              {booking.status}
            </span>
            <PagesButton
              className="booking-view-details-btn"
              onClick={() => onOpenDetail(booking)}
            >
              View Details
            </PagesButton>
          </div>
        </div>
      </div>

      {/* Options vertical dots menu */}
      <PagesButton className="booking-options-btn" aria-label="More Options">
        <MoreVertical size={16} />
      </PagesButton>
    </PagesCard>
  );
}
