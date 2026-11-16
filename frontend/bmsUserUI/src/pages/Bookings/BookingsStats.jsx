import { Calendar, CheckCircle2, Clock, CheckSquare, XCircle } from "lucide-react";
import PagesCard from "../common/PagesCard";

export default function BookingsStats({ stats }) {
  const defaultStats = [
    {
      label: "Total Bookings",
      value: stats?.total != null ? String(stats.total) : "0",
      sub: "All time",
      icon: Calendar,
      themeClass: "stat-theme-total",
    },
    {
      label: "Confirmed",
      value: stats?.confirmed != null ? String(stats.confirmed) : "0",
      sub: stats?.confirmedAmount || "₹ 0",
      icon: CheckCircle2,
      themeClass: "stat-theme-confirmed",
    },
    {
      label: "Pending",
      value: stats?.pending != null ? String(stats.pending) : "0",
      sub: stats?.pendingAmount || "₹ 0",
      icon: Clock,
      themeClass: "stat-theme-pending",
    },
    {
      label: "Completed",
      value: stats?.completed != null ? String(stats.completed) : "0",
      sub: stats?.completedAmount || "₹ 0",
      icon: CheckSquare,
      themeClass: "stat-theme-completed",
    },
    {
      label: "Cancelled",
      value: stats?.cancelled != null ? String(stats.cancelled) : "0",
      sub: stats?.cancelledAmount || "₹ 0",
      icon: XCircle,
      themeClass: "stat-theme-cancelled",
    },
  ];

  return (
    <div className="bookings-stats-grid">
      {defaultStats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <PagesCard key={i} className={`booking-stat-card ${stat.themeClass}`}>
            <div className="booking-stat-icon-wrap">
              <Icon size={20} />
            </div>
            <div className="booking-stat-info">
              <span className="booking-stat-label">{stat.label}</span>
              <span className="booking-stat-value">{stat.value}</span>
              <span className="booking-stat-sub">{stat.sub}</span>
            </div>
          </PagesCard>
        );
      })}
    </div>
  );
}
