import CalendarEvent from "./CalendarEvent.jsx";
import { CALENDAR_EVENTS } from "./calendarData.js";

const DAY_HEADERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function buildCalendarGrid(year, month) {
  const firstDay   = getFirstDayOfMonth(year, month);
  const totalDays  = getDaysInMonth(year, month);
  const prevTotal  = getDaysInMonth(year, month - 1);

  const cells = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevTotal - i, month: month - 1, year: month === 0 ? year - 1 : year, isOtherMonth: true });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, month, year, isOtherMonth: false });
  }

  // Next month leading days — fill to complete 6 rows (42 cells)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, month: month + 1, year: month === 11 ? year + 1 : year, isOtherMonth: true });
  }

  return cells;
}

function isSameDay(cellYear, cellMonth, cellDay, today) {
  return (
    cellYear  === today.getFullYear() &&
    cellMonth === today.getMonth() &&
    cellDay   === today.getDate()
  );
}

export default function CalendarGrid({ currentDate, onDayClick, selectedCategory }) {
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const cells = buildCalendarGrid(year, month);

  // Build a lookup: "YYYY-MM-DD" -> [events]
  const eventMap = {};
  CALENDAR_EVENTS.forEach(evt => {
    if (selectedCategory !== "all" && evt.category !== selectedCategory) return;
    if (!eventMap[evt.date]) eventMap[evt.date] = [];
    eventMap[evt.date].push(evt);
  });

  const getDateKey = (y, m, d) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const weeks = [];
  for (let i = 0; i < 42; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="cal-grid-card">
      {/* Day Header Row */}
      <div className="cal-day-headers">
        {DAY_HEADERS.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
      </div>

      {/* Week Rows */}
      <div className="cal-weeks">
        {weeks.map((week, wi) => (
          <div key={wi} className="cal-week-row">
            {week.map((cell, ci) => {
              const dateKey = getDateKey(cell.year, cell.month, cell.day);
              const events  = eventMap[dateKey] || [];
              const isToday = isSameDay(cell.year, cell.month, cell.day, today);

              return (
                <div
                  key={ci}
                  className={`cal-day-cell ${cell.isOtherMonth ? "other-month" : ""} ${isToday ? "today" : ""}`}
                  onClick={() => onDayClick && onDayClick(cell)}
                >
                  <span className={`cal-day-num ${isToday ? "today-num" : ""}`}>
                    {cell.day}
                  </span>
                  <div className="cal-day-events">
                    {events.slice(0, 3).map(evt => (
                      <CalendarEvent key={evt.id} event={evt} />
                    ))}
                    {events.length > 3 && (
                      <span className="cal-more-indicator">
                        +{events.length - 3}<span className="cal-more-text"> more</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
