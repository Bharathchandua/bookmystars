import PagesButton from "../common/PagesButton";
export default function BookingsTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "All Bookings", label: "All Bookings" },
    { id: "Confirmed", label: "Confirmed", count: 12, badgeClass: "tab-badge-confirmed" },
    { id: "Pending", label: "Pending", count: 4, badgeClass: "tab-badge-pending" },
    { id: "Completed", label: "Completed", count: 20, badgeClass: "tab-badge-completed" },
    { id: "Cancelled", label: "Cancelled", count: 2, badgeClass: "tab-badge-cancelled" },
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
          {tab.count !== undefined && (
            <span className={`bookings-tab-badge ${tab.badgeClass || ""}`}>
              {tab.count}
            </span>
          )}
        </PagesButton>
      ))}
    </div>
  );
}
