import { CALENDAR_EVENTS } from "./calendarData.js";

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0–23

function formatHour(h) {
  if (h === 0)  return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function getWeekDates(date) {
  const d   = new Date(date);
  const day = d.getDay(); // 0=Sun
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(sunday);
    dt.setDate(sunday.getDate() + i);
    return dt;
  });
}

function toMinutes(timeStr) {
  // "10:00 AM" or "2:00 PM"
  const [time, period] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

const CATEGORY_COLORS = {
  audition: { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
  shooting: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  meeting:  { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6" },
  training: { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
  casting:  { bg: "#e0f2fe", text: "#075985", dot: "#0ea5e9" },
  personal: { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" },
  other:    { bg: "#f8fafc", text: "#475569", dot: "#94a3b8" },
};

/* ──────────────────────────────────────────
   WEEK VIEW
   ────────────────────────────────────────── */
export function WeekView({ currentDate, onAddEvent, selectedCategory }) {
  const weekDates = getWeekDates(currentDate);
  const today     = new Date();
  const DAY_ABBRS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Build event map keyed by "YYYY-MM-DD"
  const eventMap = {};
  CALENDAR_EVENTS.forEach(evt => {
    if (selectedCategory !== "all" && evt.category !== selectedCategory) return;
    if (!eventMap[evt.date]) eventMap[evt.date] = [];
    eventMap[evt.date].push(evt);
  });

  const toKey = (dt) => {
    const y  = dt.getFullYear();
    const m  = String(dt.getMonth() + 1).padStart(2, "0");
    const d  = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isToday = (dt) =>
    dt.getFullYear() === today.getFullYear() &&
    dt.getMonth()   === today.getMonth() &&
    dt.getDate()    === today.getDate();

  // Working hours to show (6 AM – 10 PM)
  const WORK_HOURS = HOURS.slice(6, 23);

  return (
    <div className="cal-week-view">
      {/* Column headers */}
      <div className="cal-wv-header">
        <div className="cal-wv-time-gutter" />
        {weekDates.map((dt, i) => (
          <div key={i} className={`cal-wv-col-head ${isToday(dt) ? "today" : ""}`}>
            <span className="cal-wv-day-abbr">{DAY_ABBRS[i]}</span>
            <span className={`cal-wv-day-num ${isToday(dt) ? "today" : ""}`}>{dt.getDate()}</span>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="cal-wv-grid-scroll">
        <div className="cal-wv-grid">
          {WORK_HOURS.map(h => (
            <div key={h} className="cal-wv-row">
              {/* Time label */}
              <div className="cal-wv-time-gutter">
                <span className="cal-wv-hour-label">{formatHour(h)}</span>
              </div>

              {/* Cells per day */}
              {weekDates.map((dt, di) => {
                const key    = toKey(dt);
                const dayEvt = (eventMap[key] || []).filter(evt => {
                  const startH = Math.floor(toMinutes(evt.time) / 60);
                  return startH === h;
                });

                return (
                  <div key={di} className={`cal-wv-cell ${isToday(dt) ? "today-col" : ""}`}>
                    {dayEvt.map(evt => {
                      const colors = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other;
                      return (
                        <div
                          key={evt.id}
                          className="cal-wv-event"
                          style={{ background: colors.bg, color: colors.text, borderLeft: `3px solid ${colors.dot}` }}
                          title={`${evt.title} • ${evt.time}`}
                        >
                          <div className="cal-wv-evt-title">{evt.title}</div>
                          <div className="cal-wv-evt-time">{evt.time}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   DAY VIEW
   ────────────────────────────────────────── */
export function DayView({ currentDate, selectedCategory }) {
  const today   = new Date();
  const isToday =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth()    === today.getMonth() &&
    currentDate.getDate()     === today.getDate();

  const DAY_NAMES   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const toKey = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const eventMap = {};
  CALENDAR_EVENTS.forEach(evt => {
    if (selectedCategory !== "all" && evt.category !== selectedCategory) return;
    if (!eventMap[evt.date]) eventMap[evt.date] = [];
    eventMap[evt.date].push(evt);
  });

  const key       = toKey(currentDate);
  const dayEvents = eventMap[key] || [];
  const WORK_HOURS = HOURS.slice(6, 23);

  return (
    <div className="cal-day-view">
      {/* Day header */}
      <div className={`cal-dv-header ${isToday ? "today" : ""}`}>
        <span className="cal-dv-weekday">{DAY_NAMES[currentDate.getDay()]}</span>
        <span className={`cal-dv-date ${isToday ? "today" : ""}`}>
          {currentDate.getDate()} {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        {isToday && <span className="cal-dv-today-badge">Today</span>}
      </div>

      {/* Time grid */}
      <div className="cal-dv-grid-scroll">
        <div className="cal-dv-grid">
          {WORK_HOURS.map(h => {
            const hourEvts = dayEvents.filter(evt => {
              const startH = Math.floor(toMinutes(evt.time) / 60);
              return startH === h;
            });

            return (
              <div key={h} className="cal-dv-row">
                <div className="cal-dv-time-gutter">
                  <span className="cal-dv-hour-label">{formatHour(h)}</span>
                </div>
                <div className="cal-dv-cell">
                  {hourEvts.map(evt => {
                    const colors = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other;
                    const startMin = toMinutes(evt.time);
                    const endMin   = toMinutes(evt.endTime);
                    const duration = Math.max(endMin - startMin, 60); // min 60px
                    return (
                      <div
                        key={evt.id}
                        className="cal-dv-event"
                        style={{
                          background:  colors.bg,
                          color:       colors.text,
                          borderLeft:  `4px solid ${colors.dot}`,
                          minHeight:   `${(duration / 60) * 56}px`,
                        }}
                      >
                        <div className="cal-dv-evt-title">{evt.title}</div>
                        <div className="cal-dv-evt-time">{evt.time} – {evt.endTime}</div>
                        {evt.location && <div className="cal-dv-evt-loc">📍 {evt.location}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   AGENDA VIEW  (full events list by date)
   ────────────────────────────────────────── */
export function AgendaView({ currentDate, selectedCategory }) {
  const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // Show events for current month + next month
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const filtered = CALENDAR_EVENTS.filter(evt => {
    if (selectedCategory !== "all" && evt.category !== selectedCategory) return false;
    const [ey, em] = evt.date.split("-").map(Number);
    return ey === year && em - 1 === month;
  }).sort((a, b) => a.date.localeCompare(b.date));

  // Group by date
  const groups = {};
  filtered.forEach(evt => {
    if (!groups[evt.date]) groups[evt.date] = [];
    groups[evt.date].push(evt);
  });

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  if (filtered.length === 0) {
    return (
      <div className="cal-agenda-view">
        <div className="cal-agenda-view-empty">
          <span style={{ fontSize: 32 }}>📅</span>
          <p>No events in {MONTH_NAMES[month]} {year}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cal-agenda-view">
      {Object.entries(groups).map(([dateKey, evts]) => {
        const dt      = new Date(dateKey + "T00:00:00");
        const isToday = dateKey === todayKey;
        const colors  = CATEGORY_COLORS;
        return (
          <div key={dateKey} className="cal-agenda-view-group">
            {/* Date header */}
            <div className={`cal-agenda-view-date ${isToday ? "today" : ""}`}>
              <span className="cal-agenda-view-day-num">{dt.getDate()}</span>
              <div className="cal-agenda-view-day-info">
                <span className="cal-agenda-view-weekday">{DAY_NAMES[dt.getDay()]}</span>
                <span className="cal-agenda-view-month">{MONTH_NAMES[dt.getMonth()]} {dt.getFullYear()}</span>
              </div>
              {isToday && <span className="cal-agenda-view-today-tag">Today</span>}
            </div>

            {/* Events for that date */}
            <div className="cal-agenda-view-events">
              {evts.map(evt => {
                const c = (colors[evt.category] || colors.other);
                return (
                  <div key={evt.id} className="cal-agenda-view-evt" style={{ borderLeft: `4px solid ${c.dot}` }}>
                    <div className="cal-agenda-view-evt-dot" style={{ background: c.dot }} />
                    <div className="cal-agenda-view-evt-info">
                      <span className="cal-agenda-view-evt-title">{evt.title}</span>
                      <span className="cal-agenda-view-evt-meta">
                        {evt.time} – {evt.endTime}
                        {evt.location && ` · ${evt.location}`}
                      </span>
                    </div>
                    <span className="cal-agenda-view-evt-badge" style={{ background: c.bg, color: c.text }}>
                      {evt.category.charAt(0).toUpperCase() + evt.category.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
