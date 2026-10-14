import { LEGEND_ITEMS } from "./calendarData.js";

export default function CalendarLegend() {
  const row1 = LEGEND_ITEMS.slice(0, 5);
  const row2 = LEGEND_ITEMS.slice(5);

  return (
    <div className="cal-legend">
      <div className="cal-legend-row-1">
        {row1.map(item => (
          <div key={item.category} className="cal-legend-item">
            <span className={`cal-legend-dot ${item.category}`} />
            {item.label}
          </div>
        ))}
      </div>
      <div className="cal-legend-row-2">
        {row2.map(item => (
          <div key={item.category} className="cal-legend-item">
            <span className={`cal-legend-dot ${item.category}`} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
