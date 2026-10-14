import { Calendar, CheckCircle2, Clock, CheckSquare, XCircle } from "lucide-react";
import PagesCard from "../common/PagesCard";

export default function BookingsStats() {
  const stats = [
    {
      label: "Total Bookings",
      value: "38",
      sub: "All time",
      icon: Calendar,
      themeClass: "stat-theme-total",
    },
    {
      label: "Confirmed",
      value: "12",
      sub: "₹ 27,85,000",
      icon: CheckCircle2,
      themeClass: "stat-theme-confirmed",
    },
    {
      label: "Pending",
      value: "4",
      sub: "₹ 6,40,000",
      icon: Clock,
      themeClass: "stat-theme-pending",
    },
    {
      label: "Completed",
      value: "20",
      sub: "₹ 38,20,000",
      icon: CheckSquare,
      themeClass: "stat-theme-completed",
    },
    {
      label: "Cancelled",
      value: "2",
      sub: "₹ 1,20,000",
      icon: XCircle,
      themeClass: "stat-theme-cancelled",
    },
  ];

  return (
    <div className="bookings-stats-grid">
      {stats.map((stat, i) => {
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
