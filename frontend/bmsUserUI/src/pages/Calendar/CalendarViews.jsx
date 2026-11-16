import PagesButton from "../common/PagesButton";

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
  if (!timeStr) return 9 * 60;
  const parts = String(timeStr).split(" ");
  if (parts.length < 2) return 9 * 60;
  const [time, period] = parts;
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return (h || 0) * 60 + (m || 0);
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
export function WeekView({ currentDate, onAddEvent, selectedCategory = "all", events = [] }) {
  const weekDates = getWeekDates(currentDate);
  const today     = new Date();
  const DAY_ABBRS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Build event map keyed by "YYYY-MM-DD"
  const eventMap = {};
  (events || []).forEach(evt => {
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
                  const startH = Math.floor(toMinutes(evt.time || evt.startTime) / 60);
                  return startH === h;
                });

                return (
                  <div key={di} className="cal-wv-cell">
                    {dayEvt.map(evt => {
                      const colors = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other;
                      return (
                        <div
                          key={evt.id}
                          className="cal-wv-event"
                          style={{
                            background: colors.bg,
                            color:      colors.text,
                            borderLeft: `3px solid ${colors.dot}`,
                          }}
                        >
                          <span className="cal-wv-evt-title">{evt.title}</span>
                          <span className="cal-wv-evt-time">{evt.time || evt.startTime}</span>
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
export function DayView({ currentDate, selectedCategory = "all", events = [] }) {
  const today = new Date();
  const isToday =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth()   === today.getMonth() &&
    currentDate.getDate()    === today.getDate();

  const DAY_NAMES   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const toKey = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const eventMap = {};
  (events || []).forEach(evt => {
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
              const startH = Math.floor(toMinutes(evt.time || evt.startTime) / 60);
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
                    const startMin = toMinutes(evt.time || evt.startTime);
                    const endMin   = toMinutes(evt.endTime);
                    const duration = Math.max(endMin - startMin, 60);
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
                        <div className="cal-dv-evt-time">{evt.time || evt.startTime} – {evt.endTime}</div>
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
export function AgendaView({ currentDate, selectedCategory = "all", events = [] }) {
  const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const filtered = (events || []).filter(evt => {
    if (selectedCategory !== "all" && evt.category !== selectedCategory) return false;
    if (!evt.date) return false;
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
      <div className="cal-av-empty" style={{ padding: "48px 24px", textAlign: "center", color: "#64748b", background: "#fff", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
        No events scheduled for {MONTH_NAMES[month]} {year}.
      </div>
    );
  }

  return (
    <div className="cal-agenda-view">
      {Object.entries(groups).map(([dateStr, dayEvts]) => {
        const [y, m, d] = dateStr.split("-").map(Number);
        const dt        = new Date(y, m - 1, d);
        const isToday   = dateStr === todayKey;

        return (
          <div key={dateStr} className={`cal-av-group ${isToday ? "today" : ""}`}>
            {/* Date pill on left */}
            <div className={`cal-av-date-header ${isToday ? "today" : ""}`}>
              <div className="cal-av-day-name">{DAY_NAMES[dt.getDay()]}</div>
              <div className={`cal-av-day-num ${isToday ? "today-num" : ""}`}>{d}</div>
              <div className="cal-av-month-name">{MONTH_NAMES[m - 1].slice(0, 3)}</div>
            </div>

            {/* Event list for this day */}
            <div className="cal-av-events-list">
              {dayEvts.map(evt => {
                const colors = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other;
                return (
                  <div
                    key={evt.id}
                    className="cal-av-event-card"
                    style={{ borderLeft: `4px solid ${colors.dot}` }}
                  >
                    <div className="cal-av-card-left">
                      <span className="cal-av-evt-title">{evt.title}</span>
                      <span className="cal-av-evt-time">{evt.time || evt.startTime} – {evt.endTime}</span>
                      {evt.location && (
                        <span className="cal-av-evt-loc">📍 {evt.location}</span>
                      )}
                    </div>
                    <span
                      className="cal-av-category-badge"
                      style={{ background: colors.bg, color: colors.text }}
                    >
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
