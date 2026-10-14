import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BOOKING_DOTS = {
  "2024-05-18": "confirmed",
  "2024-05-20": "shoot",
  "2024-05-22": "confirmed",
  "2024-05-25": "confirmed",
  "2024-05-27": "pending",
  "2024-05-30": "confirmed",
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const WEEKDAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

/* Always returns exactly 42 cells (6 rows × 7 cols) — card height never changes */
function buildCalendarDays(year, month) {
  const firstDay     = new Date(year, month, 1).getDay();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const prevMonthEnd = new Date(year, month, 0).getDate();
  const cells        = [];

  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: prevMonthEnd - i, otherMonth: true });

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const dot     = BOOKING_DOTS[dateStr] || null;
    const isShoot = dot === "shoot";
    cells.push({ day: d, dot: isShoot ? null : dot, shootDay: isShoot });
  }

  const trailing = 42 - cells.length;
  for (let d = 1; d <= trailing; d++)
    cells.push({ day: d, otherMonth: true });

  return cells; // always 42
}

export default function BookingCalendarWidget() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [activeDay, setActiveDay] = useState(today.getDate());

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const goToPrev = () => { setCurrentDate(new Date(year, month - 1, 1)); setActiveDay(null); };
  const goToNext = () => { setCurrentDate(new Date(year, month + 1, 1)); setActiveDay(null); };

  const calendarDays = buildCalendarDays(year, month);

  const todayYear  = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay   = today.getDate();

  return (
    <div className="opp-widget cal-widget">

      {/* ── Row 1: Title ─────────────────────── */}
      <div className="cal-header-title">
        <span className="cal-title-text">Booking Calendar</span>
      </div>

      {/* ── Row 2: Month + Nav arrows ─────────── */}
      <div className="cal-header-nav">
        <span className="cal-month-label">
          {MONTH_NAMES[month]} {year}
        </span>
        <div className="cal-nav-arrows">
          <PagesButton className="cal-nav-btn" aria-label="Previous Month" onClick={goToPrev}>
            <ChevronLeft size={13} />
          </PagesButton>
          <PagesButton className="cal-nav-btn" aria-label="Next Month" onClick={goToNext}>
            <ChevronRight size={13} />
          </PagesButton>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────── */}
      <div className="cal-grid-wrap">

        {/* Weekday headers */}
        <div className="cal-weekdays">
          {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
        </div>

        {/* Fixed 6-row days grid */}
        <div className="cal-days-grid">
          {calendarDays.map((item, idx) => {
            const isOther    = item.otherMonth;
            const isShoot    = item.shootDay;
            const isSelected = !isOther && item.day === activeDay;
            const isToday    = !isOther && year === todayYear && month === todayMonth && item.day === todayDay;

            let cellClass = "cal-day";
            if (isOther)    cellClass += " cal-day--other";
            if (isShoot)    cellClass += " cal-day--shoot";
            if (isToday && !isSelected)  cellClass += " cal-day--today";
            if (isSelected) cellClass += isShoot ? " cal-day--shoot-active" : " cal-day--active";

            return (
              <div
                key={idx}
                className={cellClass}
                onClick={() => !isOther && setActiveDay(item.day)}
              >
                <span className="cal-day-num">{item.day}</span>
                {item.dot && <span className={`cal-dot cal-dot--${item.dot}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Legend ───────────────────────────── */}
      <div className="cal-legend">
        <div className="cal-legend-item">
          <span className="cal-legend-dot cal-legend-dot--confirmed" />
          <span>Confirmed</span>
        </div>
        <div className="cal-legend-item">
          <span className="cal-legend-dot cal-legend-dot--pending" />
          <span>Pending</span>
        </div>
        <div className="cal-legend-item">
          <span className="cal-legend-dot cal-legend-dot--shoot" />
          <span>Shoot Day</span>
        </div>
        <div className="cal-legend-item">
          <span className="cal-legend-dot cal-legend-dot--other" />
          <span>Other</span>
        </div>
      </div>

    </div>
  );
}
