import PagesButton from "../common/PagesButton";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function buildDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, otherMonth: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d });
  }
  const rem = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let d = 1; d <= rem; d++) {
    cells.push({ day: d, otherMonth: true });
  }
  return cells;
}

function formatDisplay(value) {
  if (!value) return null;
  const [y, m, d] = value.split("-");
  return `${d} ${MONTH_NAMES[parseInt(m, 10) - 1].slice(0, 3)} ${y}`;
}

export default function MiniDatePicker({ value, onChange, placeholder = "Select Date" }) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({
    year: value ? parseInt(value.split("-")[0]) : today.getFullYear(),
    month: value ? parseInt(value.split("-")[1]) - 1 : today.getMonth(),
  });
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const prevMonth = () =>
    setView((v) => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const nextMonth = () =>
    setView((v) => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const selectDay = (day) => {
    const m = String(view.month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${view.year}-${m}-${d}`);
    setOpen(false);
  };

  const clearDate = (e) => {
    e.stopPropagation();
    onChange("");
  };

  const cells = buildDays(view.year, view.month);

  // Determine selected day for current view
  let selDay = null;
  if (value) {
    const [sy, sm] = value.split("-");
    if (parseInt(sy) === view.year && parseInt(sm) - 1 === view.month) {
      selDay = parseInt(value.split("-")[2]);
    }
  }

  const todayDay =
    today.getFullYear() === view.year && today.getMonth() === view.month
      ? today.getDate()
      : null;

  return (
    <div className="mdp-wrap" ref={ref}>
      {/* Trigger Button */}
      <div
        className={`mdp-trigger ${open ? "mdp-trigger--open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`mdp-trigger-text ${!value ? "mdp-placeholder" : ""}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <div className="mdp-trigger-icons">
          {value && (
            <PagesButton className="mdp-clear-btn" onClick={clearDate} title="Clear date">
              ×
            </PagesButton>
          )}
          <CalendarDays size={14} className="mdp-cal-icon" />
        </div>
      </div>

      {/* Dropdown Calendar */}
      {open && (
        <div className="mdp-dropdown">
          {/* Month / Year navigation */}
          <div className="mdp-nav">
            <PagesButton className="mdp-nav-btn" onClick={prevMonth} aria-label="Prev month">
              <ChevronLeft size={12} />
            </PagesButton>
            <span className="mdp-month-label">
              {MONTH_NAMES[view.month]} {view.year}
            </span>
            <PagesButton className="mdp-nav-btn" onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={12} />
            </PagesButton>
          </div>

          {/* Weekday headers */}
          <div className="mdp-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          {/* Days grid */}
          <div className="mdp-days">
            {cells.map((cell, i) => (
              <PagesButton
                key={i}
                disabled={cell.otherMonth}
                className={`mdp-day
                  ${cell.otherMonth ? "mdp-day--other" : ""}
                  ${cell.day === selDay && !cell.otherMonth ? "mdp-day--selected" : ""}
                  ${cell.day === todayDay && !cell.otherMonth ? "mdp-day--today" : ""}
                `}
                onClick={() => !cell.otherMonth && selectDay(cell.day)}
              >
                {cell.day}
              </PagesButton>
            ))}
          </div>

          {/* Footer */}
          <div className="mdp-footer">
            <PagesButton className="mdp-today-btn" onClick={() => {
              const y = today.getFullYear();
              const m = String(today.getMonth() + 1).padStart(2,"0");
              const d = String(today.getDate()).padStart(2,"0");
              onChange(`${y}-${m}-${d}`);
              setOpen(false);
            }}>
              Today
            </PagesButton>
            {value && (
              <PagesButton className="mdp-clear-link" onClick={() => { onChange(""); setOpen(false); }}>
                Clear
              </PagesButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
