/* ── TalentSchedulePanel.jsx ──────────────────────────────────
   Right-side availability and schedule panel for selected talent.
   Displays immediate 3-day schedule strip + interactive calendar.
   ────────────────────────────────────────────────────────── */

import { useState, useMemo } from "react";
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  MapPin,
  Send,
  Film
} from "lucide-react";
import PagesButton from "../common/PagesButton";
import TalentWorkModal from "./TalentWorkModal";
import BookingRequestModal from "./BookingRequestModal";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TalentSchedulePanel({ selectedTalent }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [bookingSent, setBookingSent] = useState(false);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper format YYYY-MM-DD
  const formatDateStr = (y, m, d) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const selectedDateStr = formatDateStr(year, month, selectedDay);

  // Map talent slots by date
  const slotsMap = useMemo(() => {
    const map = {};
    if (selectedTalent && Array.isArray(selectedTalent.upcomingSlots)) {
      selectedTalent.upcomingSlots.forEach((s) => {
        if (s && s.availabilityDate) {
          map[s.availabilityDate] = s;
        }
      });
    }
    return map;
  }, [selectedTalent]);

  const selectedSlot = slotsMap[selectedDateStr] || null;

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // Sunday = 0
  const startOffset = (firstDay + 6) % 7; // Monday = 0

  const calendarDays = [];
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(1);
  };

  if (!selectedTalent) {
    return (
      <div className="talent-schedule-panel" style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
        <Calendar size={36} style={{ color: "#cbd5e1", margin: "0 auto 12px auto" }} />
        <h4 style={{ margin: "0 0 6px 0", color: "#1e293b" }}>Select a Talent</h4>
        <p style={{ fontSize: "13px", margin: 0 }}>
          Click on any talent card on the left to inspect their availability and book dates.
        </p>
      </div>
    );
  }

  const renderBadge = (status) => {
    if (status === "BOOKED") {
      return <span className="threeday-status-badge threeday-status-badge--booked">Booked</span>;
    }
    if (status === "TENTATIVE") {
      return <span className="threeday-status-badge threeday-status-badge--hold">Tentative</span>;
    }
    return <span className="threeday-status-badge threeday-status-badge--avail">Available</span>;
  };

  const handleRequestBooking = () => {
    setIsBookingModalOpen(true);
  };

  return (
    <div className="talent-schedule-panel">
      {/* Talent Header Profile */}
      <div className="schedule-panel-header">
        {selectedTalent.profilePhoto ? (
          <img 
            src={getFullImageUrl(selectedTalent.profilePhoto)} 
            alt={selectedTalent.fullName} 
            className="schedule-header-avatar" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="talent-card-avatar-placeholder" style={{ width: 68, height: 68, fontSize: 24 }}>
            {selectedTalent.fullName?.charAt(0) || "T"}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 className="schedule-header-name">
            {selectedTalent.fullName}
            {selectedTalent.stageName && selectedTalent.stageName.trim() !== selectedTalent.fullName.trim() && (
              <span className="talent-stage-pill" style={{ marginLeft: 8, fontSize: 12 }}>
                "{selectedTalent.stageName}"
              </span>
            )}
          </h4>
          <div className="schedule-header-sub">
            {selectedTalent.location && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <MapPin size={13} style={{ color: "#db2777" }} /> {selectedTalent.location}
              </span>
            )}
            {selectedTalent.dayRate && (
              <strong style={{ color: "#0f172a", fontWeight: 800 }}>
                ₹{selectedTalent.dayRate} / day
              </strong>
            )}
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setIsWorkModalOpen(true)}
              className="btn-view-work-full"
            >
              <Film size={14} /> View Work & Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Calendar Header */}
      <div className="prof-avail-calendar-header" style={{ marginBottom: 12 }}>
        <div className="prof-avail-month-nav">
          <h4 className="prof-avail-month-title" style={{ fontSize: 13.5 }}>
            {MONTH_NAMES[month]} {year}
          </h4>
          <div className="prof-avail-nav-arrows">
            <PagesButton className="prof-avail-arrow-btn" onClick={handlePrevMonth}>
              <ChevronLeft size={15} />
            </PagesButton>
            <PagesButton className="prof-avail-arrow-btn" onClick={handleNextMonth}>
              <ChevronRight size={15} />
            </PagesButton>
          </div>
        </div>
        <div className="prof-avail-legend">
          <span className="legend-item"><span className="legend-dot legend-dot--avail" /> Avail</span>
          <span className="legend-item"><span className="legend-dot legend-dot--booked" /> Booked</span>
          <span className="legend-item"><span className="legend-dot legend-dot--hold" /> Hold</span>
        </div>
      </div>

      {/* Weekdays */}
      <div className="prof-calendar-weekdays">
        {WEEKDAYS.map((wd, i) => (
          <span key={i} className="weekday-lbl" style={{ fontSize: 10 }}>{wd}</span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="prof-calendar-grid">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="calendar-day-empty" />;
          }

          const dayDateStr = formatDateStr(year, month, day);
          const slot = slotsMap[dayDateStr];
          const isSelected = day === selectedDay;

          let dayClass = "calendar-day-active";
          let statusKey = "available";

          if (slot) {
            if (slot.status === "BOOKED") {
              statusKey = "booked";
              dayClass += " calendar-day--booked";
            } else if (slot.status === "TENTATIVE") {
              statusKey = "hold";
              dayClass += " calendar-day--hold";
            } else {
              statusKey = "available";
              dayClass += " calendar-day--available";
            }
          } else {
            dayClass += " calendar-day--available";
          }

          if (isSelected) {
            dayClass += " calendar-day--selected";
          }

          return (
            <PagesButton
              key={day}
              className={dayClass}
              onClick={() => setSelectedDay(day)}
            >
              <span className="day-num">{day}</span>
              {slot && slot.status !== "AVAILABLE" && (
                <span className={`day-status-indicator day-status-indicator--${statusKey}`} />
              )}
            </PagesButton>
          );
        })}
      </div>

      {/* Selected Date Details Box */}
      <div style={{ marginTop: 16, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <strong style={{ fontSize: 13, color: "#0f172a" }}>
            {selectedDay} {MONTH_NAMES[month]} {year}
          </strong>
          {selectedSlot ? renderBadge(selectedSlot.status) : renderBadge("AVAILABLE")}
        </div>
        <p style={{ margin: 0, fontSize: 11.5, color: "#64748b" }}>
          {selectedSlot?.description 
            ? selectedSlot.description 
            : selectedSlot?.status === "BOOKED" 
            ? "Reserved for scheduled shoot."
            : "No conflicting bookings. Open for commercial shoots and auditions."}
        </p>
      </div>

      {/* Direct Booking Actions */}
      <div className="schedule-actions-row">
        {bookingSent ? (
          <div style={{ padding: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 10, fontSize: 12, fontWeight: 700, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <CheckCircle size={15} /> Booking inquiry sent to {selectedTalent.fullName}!
          </div>
        ) : (
          <button 
            type="button" 
            className="btn-book-direct"
            disabled={selectedSlot?.status === "BOOKED"}
            onClick={handleRequestBooking}
          >
            <Send size={14} />
            <span>
              {selectedSlot?.status === "BOOKED" 
                ? "Slot Booked (Select Another Date)" 
                : `Request Booking for ${selectedDay} ${MONTH_NAMES[month].substring(0, 3)}`}
            </span>
          </button>
        )}
      </div>

      {/* Talent Work & Portfolio Modal */}
      <TalentWorkModal
        isOpen={isWorkModalOpen}
        onClose={() => setIsWorkModalOpen(false)}
        talent={selectedTalent}
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
      />

      {/* Booking & Shoot Request Modal */}
      <BookingRequestModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        talent={selectedTalent}
        initialDate={formatDateStr(year, month, selectedDay)}
        onSuccess={() => {
          setBookingSent(true);
          setTimeout(() => setBookingSent(false), 5000);
        }}
      />
    </div>
  );
}
