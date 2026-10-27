import { useState, useEffect } from "react";
import PagesButton from "../common/PagesButton";
import { getPublicCastingCalls } from "../../features/bms/api/opportunities/opportunitiesApi";
import { getMyCastingApplications } from "../../features/bms/api/opportunities/castingApplicationsApi";

export default function AlertsWidget({ opportunities: propOpps = null, applications: propApps = null }) {
  const [opps, setOpps] = useState(propOpps || []);
  const [apps, setApps] = useState(propApps || []);

  useEffect(() => {
    if (propOpps !== null) {
      setOpps(propOpps);
    } else {
      getPublicCastingCalls().then((r) => setOpps(Array.isArray(r) ? r : [])).catch(() => {});
    }
  }, [propOpps]);

  useEffect(() => {
    if (propApps !== null) {
      setApps(propApps);
    } else {
      getMyCastingApplications().then((r) => setApps(Array.isArray(r) ? r : [])).catch(() => {});
    }
  }, [propApps]);

  useEffect(() => {
    const handleUpdated = () => {
      getMyCastingApplications().then((r) => setApps(Array.isArray(r) ? r : [])).catch(() => {});
    };
    window.addEventListener("opportunity_applied", handleUpdated);
    return () => window.removeEventListener("opportunity_applied", handleUpdated);
  }, []);

  // Compute dynamic live alerts
  const latestOpp = opps && opps.length > 0 ? opps[0] : null;
  const latestApp = apps && apps.length > 0 ? apps[0] : null;

  const dynamicAlerts = [];

  if (latestOpp) {
    dynamicAlerts.push({
      id: "opp-alert",
      msg: `New casting call "${latestOpp.title}" (${latestOpp.projectType || "Feature Film"}) is now accepting audition reels.`,
      time: "Recently posted",
      iconBg: "#fce7f3",
      iconColor: "#be185d",
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    });
  }

  if (latestApp) {
    dynamicAlerts.push({
      id: "app-alert",
      msg: `Your audition submission for "${latestApp.castingCallTitle || "Casting Call"}" is currently marked as ${latestApp.status}.`,
      time: "Live status",
      iconBg: "#e0f2fe",
      iconColor: "#0369a1",
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    });
  } else {
    dynamicAlerts.push({
      id: "profile-active-alert",
      msg: "Your profile is active in the casting directory. Apply to open calls to receive audition schedules.",
      time: "Today",
      iconBg: "#e0f2fe",
      iconColor: "#0369a1",
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 14 14" />
        </svg>
      ),
    });
  }

  return (
    <div className="opp-widget">
      <div className="opp-widget-head">
        <span className="opp-widget-head-title">Alerts</span>
        <PagesButton className="opp-widget-view-all">View All</PagesButton>
      </div>

      <div className="opp-alerts-list">
        {dynamicAlerts.map((alert) => (
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
