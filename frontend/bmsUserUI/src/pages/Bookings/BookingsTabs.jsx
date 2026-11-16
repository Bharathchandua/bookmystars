import PagesButton from "../common/PagesButton";

export default function BookingsTabs({ activeTab, setActiveTab, counts = {} }) {
  const tabs = [
    { id: "All Bookings", label: "All Bookings", count: counts.all },
    { id: "Confirmed", label: "Confirmed", count: counts.confirmed, badgeClass: "tab-badge-confirmed" },
    { id: "Pending", label: "Pending", count: counts.pending, badgeClass: "tab-badge-pending" },
    { id: "Completed", label: "Completed", count: counts.completed, badgeClass: "tab-badge-completed" },
    { id: "Cancelled", label: "Cancelled", count: counts.cancelled, badgeClass: "tab-badge-cancelled" },
  ];

  return (
    <div className="bookings-tabs-row">
      {tabs.map((tab) => (
        <PagesButton
          key={tab.id}
          className={`bookings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span>{tab.label}</span>
          {typeof tab.count === "number" && (
            <span className={`bookings-tab-badge ${tab.badgeClass || ""}`}>
              {tab.count}
            </span>
          )}
        </PagesButton>
      ))}
    </div>
  );
}
