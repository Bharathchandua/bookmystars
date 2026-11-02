import { useState } from "react";
import AppLayout from "../Layout/AppLayout.jsx";
import "./bookings.css";
import "./bookings-mobile.css";


import BookingsStats from "./BookingsStats.jsx";
import BookingsTabs from "./BookingsTabs.jsx";
import BookingsFilters from "./BookingsFilters.jsx";
import BookingsList from "./BookingsList.jsx";
import BookingDetailModal from "./BookingDetailModal.jsx";

// Sidebar Widgets
import EarningsSummaryWidget from "./EarningsSummaryWidget.jsx";
import BookingCalendarWidget from "./BookingCalendarWidget.jsx";
import UpcomingBookingsWidget from "./UpcomingBookingsWidget.jsx";

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("Newest First");
  const [selectedBooking, setSelectedBooking] = useState(null);

  return (
    <AppLayout
      pageTitle="Bookings"
      subTitle="Manage all your confirmed bookings and requests."
      searchPlaceholder="Search bookings, projects..."
      showMessages={true}
    >
      <div className="bookings-page">
        <div style={{ padding: "0" }}>
          <div className="bookings-two-col">
            
            {/* ── Left Column ─────────────── */}
            <div className="bookings-left">
              {/* Tabs Switcher */}
              <BookingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

              {/* Stats Cards */}
              <BookingsStats />

              {/* Filter Row */}
              <BookingsFilters
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />

              {/* Listing Card items */}
              <BookingsList
                activeTab={activeTab}
                statusFilter={statusFilter}
                typeFilter={typeFilter}
                fromDate={fromDate}
                toDate={toDate}
                sortBy={sortBy}
                onOpenDetail={setSelectedBooking}
              />
            </div>

            {/* ── Right Column ────────────── */}
            <div className="bookings-right">
              <EarningsSummaryWidget />
              <BookingCalendarWidget />
              <UpcomingBookingsWidget />
            </div>

          </div>
        </div>
      </div>

      {/* Details modal overlay */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </AppLayout>
  );
}
