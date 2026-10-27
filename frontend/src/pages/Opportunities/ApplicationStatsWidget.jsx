import { useState, useEffect } from "react";
import PagesButton from "../common/PagesButton";
import { getMyCastingApplications } from "../../features/bms/api/opportunities/castingApplicationsApi";

// Dynamic Application Status widget — renders live counts from DB applications
export default function ApplicationStatsWidget({ applications: propApps = null }) {
  const [apps, setApps] = useState(propApps || []);

  const fetchApplications = async () => {
    try {
      const data = await getMyCastingApplications();
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not load dynamic applications for widget:", err);
    }
  };

  useEffect(() => {
    if (propApps !== null) {
      setApps(propApps);
    } else {
      fetchApplications();
    }
  }, [propApps]);

  useEffect(() => {
    const handleUpdated = () => {
      fetchApplications();
    };
    window.addEventListener("opportunity_applied", handleUpdated);
    window.addEventListener("applications_updated", handleUpdated);
    return () => {
      window.removeEventListener("opportunity_applied", handleUpdated);
      window.removeEventListener("applications_updated", handleUpdated);
    };
  }, []);

  // Compute live statistics from database records
  const appliedCount = apps.length;
  const shortlistedCount = apps.filter((a) => (a.status || "").toUpperCase() === "SHORTLISTED").length;
  const inReviewCount = apps.filter((a) => {
    const s = (a.status || "").toUpperCase();
    return s === "APPLIED" || s === "IN_REVIEW";
  }).length;
  const selectedCount = apps.filter((a) => {
    const s = (a.status || "").toUpperCase();
    return s === "HIRED" || s === "SELECTED";
  }).length;
  const rejectedCount = apps.filter((a) => (a.status || "").toUpperCase() === "REJECTED").length;

  const STATUS_ROWS = [
    {
      label: "Applied",
      count: appliedCount,
      iconBg: "#e0f2fe",
      iconColor: "#0369a1",
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      ),
    },
    {
      label: "Shortlisted",
      count: shortlistedCount,
      iconBg: "#dcfce7",
      iconColor: "#16a34a",
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "In Review",
      count: inReviewCount,
      iconBg: "#fef3c7",
      iconColor: "#d97706",
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      label: "Selected",
      count: selectedCount,
      iconBg: "#fce7f3",
      iconColor: "#be185d",
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: "Rejected",
      count: rejectedCount,
      iconBg: "#fee2e2",
      iconColor: "#dc2626",
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  ];

  return (
    <div className="opp-widget opp-status-widget">
      <div className="opp-widget-head">
        <span className="opp-widget-head-title">Application Status</span>
        <PagesButton className="opp-widget-view-all">View All</PagesButton>
      </div>

      <div className="opp-app-status-list">
        {STATUS_ROWS.map((row) => (
          <div key={row.label} className="opp-app-status-row">
            <div
              className="opp-status-icon"
              style={{ background: row.iconBg }}
            >
              {row.svg}
            </div>
            <span className="opp-status-label">{row.label}</span>
            <span className="opp-status-count">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
