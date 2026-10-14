import PagesButton from "../common/PagesButton";
// Alerts widget — matching client screenshot
const ALERTS = [
  {
    id: 1,
    msg: "New casting call matching your profile \"Shadows of Truth\" has been posted.",
    time: "2 hours ago",
    iconBg: "#fce7f3",
    iconColor: "#be185d",
    // bell icon
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    id: 2,
    msg: "Your audition for \"Dil Ki Baat – S2\" is scheduled on 25 May 2024.",
    time: "1 day ago",
    iconBg: "#e0f2fe",
    iconColor: "#0369a1",
    // calendar icon
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
];

export default function AlertsWidget() {
  return (
    <div className="opp-widget">
      <div className="opp-widget-head">
        <span className="opp-widget-head-title">Alerts</span>
        <PagesButton className="opp-widget-view-all">View All</PagesButton>
      </div>

      <div className="opp-alerts-list">
        {ALERTS.map((alert) => (
          <div key={alert.id} className="opp-alert-item">
            <div
              className="opp-alert-dot-icon"
              style={{ background: alert.iconBg }}
            >
              {alert.svg}
            </div>
            <div className="opp-alert-text">
              <p className="opp-alert-msg">{alert.msg}</p>
              <span className="opp-alert-time">{alert.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
