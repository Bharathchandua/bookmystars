import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CALENDAR_EVENTS } from "./calendarData.js";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const WEEKDAYS = ["S","M","T","W","T","F","S"];

function buildMiniGrid(year, month) {
  const firstDay  = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevTotal - i, isOtherMonth: true, m: month - 1, y: month === 0 ? year - 1 : year });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, isOtherMonth: false, m: month, y: year });
  }
  while (cells.length < 42) {
    const d = cells.length - firstDay - totalDays + 1;
    cells.push({ day: d, isOtherMonth: true, m: month + 1, y: month === 11 ? year + 1 : year });
  }
  return cells;
}

export default function MiniCalendar({ syncDate, onDateClick }) {
  const initialDate = syncDate || new Date();
  const [viewYear,  setViewYear]  = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const today = new Date();
  const cells = buildMiniGrid(viewYear, viewMonth);

  // Days that have events
  const eventDays = new Set(
    CALENDAR_EVENTS
      .filter(e => {
        const [y, m] = e.date.split("-").map(Number);
        return y === viewYear && m - 1 === viewMonth;
      })
      .map(e => parseInt(e.date.split("-")[2], 10))
  );

  const goPrev = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else                 { setViewMonth(m => m - 1); }
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else                  { setViewMonth(m => m + 1); }
  };

  return (
    <div className="cal-mini-card">
      {/* Mini Header */}
      <div className="cal-mini-header">
        <span className="cal-mini-month">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <div className="cal-mini-nav">
          <PagesButton className="cal-mini-nav-btn" onClick={goPrev}><ChevronLeft size={12} /></PagesButton>
          <PagesButton className="cal-mini-nav-btn" onClick={goNext}><ChevronRight size={12} /></PagesButton>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="cal-mini-weekdays">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="cal-mini-weekday">{w}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="cal-mini-days">
        {cells.map((cell, idx) => {
          const isToday =
            !cell.isOtherMonth &&
            cell.y  === today.getFullYear() &&
            cell.m  === today.getMonth() &&
            cell.day === today.getDate();

          const hasEvent = !cell.isOtherMonth && eventDays.has(cell.day);

          return (
            <div
              key={idx}
              className={[
                "cal-mini-day",
                cell.isOtherMonth ? "other-month" : "",
                isToday           ? "today"       : "",
                hasEvent          ? "has-event"   : "",
              ].join(" ").trim()}
              onClick={() => !cell.isOtherMonth && onDateClick && onDateClick(new Date(cell.y, cell.m, cell.day))}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
