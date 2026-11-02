import PagesButton from "../common/PagesButton";
import { X, Building, DollarSign, Calendar, MapPin, Briefcase } from "lucide-react";

export default function BookingDetailModal({ booking, onClose }) {
  if (!booking) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        {/* Banner image with overlay */}
        <div className="booking-modal-banner-wrap">
          <img src={booking.image} alt={booking.title} />
          <div className="booking-modal-banner-overlay" />
          <PagesButton className="booking-modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </PagesButton>
        </div>

        {/* Modal body */}
        <div className="booking-modal-body">
          <div className="booking-modal-type">
            <span className={`booking-category-badge cat-${booking.category.toLowerCase().replace(/\s+/g, "-")}`}>
              {booking.category}
            </span>
          </div>

          <h2 className="booking-modal-title">{booking.title}</h2>
          
          <div className="booking-modal-company">
            <Building size={14} className="text-slate-400" />
            <span>{booking.company}</span>
          </div>

          {/* Key characteristics grid */}
          <div className="booking-modal-meta-grid">
            <div className="booking-modal-meta-card">
              <span className="booking-modal-meta-label">Selected Role</span>
              <div className="booking-modal-meta-value">{booking.role}</div>
            </div>
            
            <div className="booking-modal-meta-card">
              <span className="booking-modal-meta-label">Location</span>
              <div className="booking-modal-meta-value">{booking.location}</div>
            </div>

            <div className="booking-modal-meta-card">
              <span className="booking-modal-meta-label">Contract Payment</span>
              <div className="booking-modal-meta-value" style={{ color: "#ee008f", fontWeight: "800" }}>
                {booking.payment}
              </div>
            </div>

            <div className="booking-modal-meta-card">
              <span className="booking-modal-meta-label">Total Duration</span>
              <div className="booking-modal-meta-value">{booking.days} Days</div>
            </div>
          </div>

          {/* Schedule & Requirements */}
          <div className="booking-modal-section">
            <h4 className="booking-modal-section-title">Shoot Schedule & Guidelines</h4>
            <div className="booking-modal-schedule-list">
              <div className="booking-modal-schedule-row">
                <span className="booking-modal-schedule-dot" />
                <span><strong>Shoot Window:</strong> {booking.datesDisplay}</span>
              </div>
              <div className="booking-modal-schedule-row">
                <span className="booking-modal-schedule-dot" />
                <span><strong>Contract Finalized:</strong> Booked on {booking.bookedOn}</span>
              </div>
              <div className="booking-modal-schedule-row">
                <span className="booking-modal-schedule-dot" />
                <span><strong>Travel & Stay:</strong> Local travel expenses and accommodation are covered by the production team.</span>
              </div>
              <div className="booking-modal-schedule-row">
                <span className="booking-modal-schedule-dot" />
                <span><strong>Wardrobe details:</strong> Coordinates will contact you for wardrobe trials and fittings 3 days prior.</span>
              </div>
              <div className="booking-modal-schedule-row">
                <span className="booking-modal-schedule-dot" />
                <span><strong>Payment Milestones:</strong> 40% advance processed, 60% on completion of the final shoot schedule.</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="booking-modal-section" style={{ marginBottom: "0" }}>
            <h4 className="booking-modal-section-title">Point of Contact</h4>
            <p className="booking-card-meta" style={{ fontSize: "12.5px" }}>
              Coordinator: <strong>Ananya Sen (Casting Associate)</strong>
            </p>
            <p className="booking-card-meta" style={{ fontSize: "12.5px", marginTop: "2px" }}>
              Email: listings@productionhouse.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
