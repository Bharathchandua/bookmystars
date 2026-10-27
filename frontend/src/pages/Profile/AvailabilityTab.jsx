/* ── AvailabilityTab.jsx ──────────────────────────────────────
   Interactive calendar tab showing live talent availability,
   booked slots, and schedule details connected to Spring Boot backend.
   ────────────────────────────────────────────────────────── */

import PagesButton from "../common/PagesButton";
import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  Save, 
  Loader2,
  CalendarCheck
} from "lucide-react";
import { 
  getMyAvailability, 
  getUserAvailability, 
  saveAvailabilitySlot, 
  deleteAvailabilityByDate 
} from "../../features/bms/api/availability/availabilityApi";
import { getStoredToken } from "../../features/bms/api/auth/authApi";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AvailabilityTab({ userId, isOwner = true }) {
  const today = useMemo(() => new Date(), []);
  
  // Current viewed month and year
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

  // Backend slots state
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form states for the selected date
  const [formStatus, setFormStatus] = useState("AVAILABLE");
  const [formDescription, setFormDescription] = useState("");
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("18:00");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper: Format YYYY-MM-DD
  const formatSlotDate = (y, m, d) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const selectedDateStr = formatSlotDate(year, month, selectedDay);

  // Map backend slots by date "YYYY-MM-DD"
  const slotsMap = useMemo(() => {
    const map = {};
    if (Array.isArray(slots)) {
      slots.forEach((s) => {
        if (s && s.availabilityDate) {
          map[s.availabilityDate] = s;
        }
      });
    }
    return map;
  }, [slots]);

  const selectedSlot = slotsMap[selectedDateStr] || null;

  // Sync form inputs when selected date or slotsMap changes
  useEffect(() => {
    if (selectedSlot) {
      setFormStatus(selectedSlot.status || "AVAILABLE");
      setFormDescription(selectedSlot.description || "");
      setFormStartTime(
        selectedSlot.startTime ? selectedSlot.startTime.substring(0, 5) : "09:00"
      );
      setFormEndTime(
        selectedSlot.endTime ? selectedSlot.endTime.substring(0, 5) : "18:00"
      );
    } else {
      setFormStatus("AVAILABLE");
      setFormDescription("");
      setFormStartTime("09:00");
      setFormEndTime("18:00");
    }
    setFeedback(null);
  }, [selectedDateStr, selectedSlot]);

  // Load availability from backend
  const fetchAvailability = useCallback(async () => {
    const token = getStoredToken();
    if (!token && !userId) return;

    setIsLoading(true);
    try {
      const data = userId 
        ? await getUserAvailability(userId) 
        : await getMyAvailability();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not load availability slots:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAvailability();

    const handleRefresh = () => fetchAvailability();
    window.addEventListener("bms_availability_refresh", handleRefresh);
    return () => {
      window.removeEventListener("bms_availability_refresh", handleRefresh);
    };
  }, [fetchAvailability]);

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const startDayOffset = (firstDayOfWeek + 6) % 7; // Convert to Monday = 0

  const calendarDays = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(1);
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(now.getDate());
  };

  // Save / Update Slot
  const handleSaveSlot = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await saveAvailabilitySlot({
        availabilityDate: selectedDateStr,
        status: formStatus,
        description: formDescription.trim(),
        startTime: formStartTime,
        endTime: formEndTime,
      });

      setFeedback({ type: "success", message: `Slot for ${selectedDay} ${MONTH_NAMES[month]} saved!` });
      await fetchAvailability();
      window.dispatchEvent(new Event("bms_profile_updated"));
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to update slot" });
    } finally {
      setIsSaving(false);
    }
  };

  // Clear / Delete Slot
  const handleClearSlot = async () => {
    if (!selectedSlot) {
      // Just reset the form
      setFormStatus("AVAILABLE");
      setFormDescription("");
      return;
    }

    setIsDeleting(true);
    setFeedback(null);
    try {
      await deleteAvailabilityByDate(selectedDateStr);
      setFeedback({ type: "success", message: `Slot cleared for ${selectedDay} ${MONTH_NAMES[month]}.` });
      await fetchAvailability();
      window.dispatchEvent(new Event("bms_profile_updated"));
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to clear slot" });
    } finally {
      setIsDeleting(false);
    }
  };

  const isCurrentViewingToday =
    today.getFullYear() === year &&
    today.getMonth() === month;

  return (
    <div className="prof-avail-tab-container">
      {/* Left Column: Interactive Calendar */}
      <div className="prof-avail-card-main">
        <div className="prof-avail-calendar-header">
          <div className="prof-avail-month-nav">
            <h4 className="prof-avail-month-title">
              {MONTH_NAMES[month]} {year}
            </h4>
            <div className="prof-avail-nav-arrows">
              <PagesButton 
                className="prof-avail-arrow-btn" 
                aria-label="Previous month" 
                onClick={handlePrevMonth}
              >
                <ChevronLeft size={16} />
              </PagesButton>
              <PagesButton 
                className="prof-avail-today-btn" 
                onClick={handleJumpToday}
                title="Go to current date"
              >
                Today
              </PagesButton>
              <PagesButton 
                className="prof-avail-arrow-btn" 
                aria-label="Next month" 
                onClick={handleNextMonth}
              >
                <ChevronRight size={16} />
              </PagesButton>
            </div>
          </div>
          <div className="prof-avail-legend">
            <span className="legend-item">
              <span className="legend-dot legend-dot--avail" /> Available
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--booked" /> Booked
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--hold" /> Tentative
            </span>
          </div>
        </div>

        {/* Days of week */}
        <div className="prof-calendar-weekdays">
          {WEEKDAYS.map((wd, i) => (
            <span key={i} className="weekday-lbl">{wd}</span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="prof-calendar-grid">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="calendar-day-empty" />;
            }

            const dayDateStr = formatSlotDate(year, month, day);
            const slot = slotsMap[dayDateStr];
            const isToday = isCurrentViewingToday && today.getDate() === day;
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

            if (isToday) {
              dayClass += " calendar-day--today";
            }
            if (isSelected) {
              dayClass += " calendar-day--selected";
            }

            return (
              <PagesButton
                key={day}
                className={dayClass}
                onClick={() => setSelectedDay(day)}
                title={`${day} ${MONTH_NAMES[month]} ${year} - ${slot ? slot.status : "Available"}`}
              >
                <span className="day-num">{day}</span>
                {slot && slot.status !== "AVAILABLE" && (
                  <span className={`day-status-indicator day-status-indicator--${statusKey}`} />
                )}
              </PagesButton>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Date Details & Interactive Booking Form */}
      <div className="prof-avail-card-side">
        <div className="prof-selected-day-details">
          <div className="details-header">
            <Calendar size={18} className="details-icon" />
            <h4 className="details-title">
              {MONTH_NAMES[month]} {selectedDay}, {year}
            </h4>
          </div>

          {/* Current Status Banner */}
          <div className="status-banner">
            {selectedSlot ? (
              selectedSlot.status === "BOOKED" ? (
                <div className="status-alert status-alert--booked">
                  <AlertCircle size={15} />
                  <div>
                    <strong>Booked Slot</strong>
                    <p className="status-desc">
                      {selectedSlot.description || "Marked as Booked for this date."}
                    </p>
                  </div>
                </div>
              ) : selectedSlot.status === "TENTATIVE" ? (
                <div className="status-alert status-alert--hold">
                  <AlertCircle size={15} />
                  <div>
                    <strong>Tentative Hold</strong>
                    <p className="status-desc">
                      {selectedSlot.description || "Slot held tentatively pending confirmation."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="status-alert status-alert--avail">
                  <CheckCircle size={15} />
                  <div>
                    <strong>Open & Available</strong>
                    <p className="status-desc">
                      {selectedSlot.description || "Open for shoots, campaigns, and runways."}
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="status-alert status-alert--avail">
                <CheckCircle size={15} />
                <div>
                  <strong>Available</strong>
                  <p className="status-desc">No events scheduled. Open for bookings.</p>
                </div>
              </div>
            )}
          </div>

          {/* Hours Info */}
          <div className="time-info">
            <div className="info-row">
              <Clock size={14} className="info-icon" />
              <span>
                Working Hours:{" "}
                {selectedSlot?.startTime && selectedSlot?.endTime
                  ? `${selectedSlot.startTime.substring(0, 5)} – ${selectedSlot.endTime.substring(0, 5)}`
                  : "09:00 AM – 06:00 PM"}
              </span>
            </div>
          </div>
        </div>

        {/* Live Slot Management Card */}
        {isOwner ? (
          <div className="avail-editor-box">
            <div className="avail-editor-title">
              <span>Manage This Day</span>
              {isLoading && <Loader2 size={13} className="spin" />}
            </div>

            {feedback && (
              <div className={`avail-feedback-msg avail-feedback-msg--${feedback.type}`}>
                {feedback.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Status Pills */}
            <label className="avail-form-label">Set Status</label>
            <div className="avail-status-pills">
              <button
                type="button"
                className={`avail-pill-btn avail-pill-btn--avail ${
                  formStatus === "AVAILABLE" ? "avail-pill-btn--active" : ""
                }`}
                onClick={() => setFormStatus("AVAILABLE")}
              >
                Available
              </button>
              <button
                type="button"
                className={`avail-pill-btn avail-pill-btn--booked ${
                  formStatus === "BOOKED" ? "avail-pill-btn--active" : ""
                }`}
                onClick={() => setFormStatus("BOOKED")}
              >
                Booked
              </button>
              <button
                type="button"
                className={`avail-pill-btn avail-pill-btn--hold ${
                  formStatus === "TENTATIVE" ? "avail-pill-btn--active" : ""
                }`}
                onClick={() => setFormStatus("TENTATIVE")}
              >
                Tentative
              </button>
            </div>

            {/* Event Title / Note */}
            <div className="avail-form-group">
              <label className="avail-form-label">Project / Notes (Optional)</label>
              <input
                type="text"
                className="avail-form-input"
                placeholder={
                  formStatus === "BOOKED"
                    ? "e.g. Lakmé Fashion Week Runway"
                    : formStatus === "TENTATIVE"
                    ? "e.g. Nykaa Hold (Pending)"
                    : "e.g. Open for morning shoots"
                }
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            {/* Time Pickers */}
            <div className="avail-form-row">
              <div>
                <label className="avail-form-label">Start Time</label>
                <input
                  type="time"
                  className="avail-form-input"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="avail-form-label">End Time</label>
                <input
                  type="time"
                  className="avail-form-input"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="avail-actions">
              <button
                type="button"
                className="avail-save-btn"
                onClick={handleSaveSlot}
                disabled={isSaving || isDeleting}
              >
                {isSaving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                <span>{isSaving ? "Saving..." : "Save Date"}</span>
              </button>

              {selectedSlot && (
                <button
                  type="button"
                  className="avail-clear-btn"
                  onClick={handleClearSlot}
                  disabled={isSaving || isDeleting}
                  title="Clear slot back to default available"
                >
                  {isDeleting ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="quick-booking-prompt">
            <h5 className="prompt-title">Need to book this slot?</h5>
            <p className="prompt-text">
              Send a booking request or check availability details for your project dates.
            </p>
            <PagesButton 
              className="book-slot-btn" 
              disabled={selectedSlot?.status === "BOOKED"}
            >
              {selectedSlot?.status === "BOOKED" ? "Slot Unavailable" : "Request this Date"}
            </PagesButton>
          </div>
        )}
      </div>
    </div>
  );
}
