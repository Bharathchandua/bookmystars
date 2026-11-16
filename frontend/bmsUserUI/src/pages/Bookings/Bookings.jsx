import { useState, useEffect, useCallback, useMemo } from "react";
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

import { 
  getIncomingBookingRequests, 
  getSentBookingRequests, 
  updateBookingRequestStatus 
} from "../../features/bms/api/bookings/bookingsApi";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";
import { showSuccess, showError } from "../../shared/utils/alert";

function parseAmount(val) {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("Newest First");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch both incoming and sent booking requests
  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inc, sent] = await Promise.all([
        getIncomingBookingRequests(),
        getSentBookingRequests()
      ]);
      setIncomingRequests(Array.isArray(inc) ? inc : []);
      setSentRequests(Array.isArray(sent) ? sent : []);
    } catch (err) {
      console.error("Failed to load bookings from database:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Handle accepting, declining, or cancelling a booking request
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await updateBookingRequestStatus(requestId, newStatus);
      if (newStatus === "ACCEPTED") {
        showSuccess("Booking Confirmed! 🎉", "The shoot date has been scheduled on your calendar.");
      } else if (newStatus === "DECLINED") {
        showSuccess("Booking Declined", "The booking request has been declined.");
      } else {
        showSuccess("Status Updated", `Booking request marked as ${newStatus.toLowerCase()}.`);
      }
      await loadBookings();
    } catch (err) {
      showError("Update Failed", err.message || "Failed to update booking status.");
    }
  };

  // Normalize backend requests into uniform Booking items for cards & widgets
  const normalizeRequest = useCallback((req, isIncoming) => {
    const isAccepted = req.status === "ACCEPTED";
    const isDeclined = req.status === "DECLINED";
    const isCancelled = req.status === "CANCELLED";

    let displayStatus = "Pending";
    if (isAccepted) {
      const bookingDateObj = req.bookingDate ? new Date(req.bookingDate) : null;
      const isPast = bookingDateObj && bookingDateObj < new Date();
      displayStatus = isPast ? "Completed" : "Confirmed";
    } else if (isDeclined || isCancelled) {
      displayStatus = "Cancelled";
    }

    const category = req.projectType || "Commercial Shoot";
    const title = req.projectTitle || "Shoot Booking";
    const partnerName = isIncoming
      ? (req.professionalCompany || req.professionalName || "Cinema Partner")
      : (req.talentName || "Talent Partner");

    const contactName = isIncoming ? req.professionalName : req.talentName;
    const contactEmail = isIncoming ? req.professionalEmail : req.talentEmail;
    const contactMobile = isIncoming ? req.professionalMobile : "";

    const paymentNum = parseAmount(req.offeredRate);
    const paymentStr = req.offeredRate
      ? (String(req.offeredRate).startsWith("₹")
          ? String(req.offeredRate)
          : `₹ ${paymentNum.toLocaleString("en-IN")}`)
      : "₹ 0";

    const rawDate = req.bookingDate || (req.createdAt ? String(req.createdAt).split("T")[0] : new Date().toISOString().split("T")[0]);
    const formattedDate = req.bookingDate
      ? new Date(req.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "Scheduled Date";

    const bookedOnStr = req.createdAt
      ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "Recently";

    const rawPhoto = isIncoming
      ? (req.professionalPhotoUrl || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=200&fit=crop&q=80")
      : (req.talentPhotoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=200&fit=crop&q=80");

    return {
      id: `${isIncoming ? "inc" : "sent"}-${req.id}`,
      reqId: req.id,
      category,
      title,
      role: req.message ? (req.message.length > 45 ? req.message.slice(0, 45) + "..." : req.message) : (isIncoming ? "Booked Talent" : "Hiring Partner"),
      company: partnerName,
      clientName: isIncoming ? req.professionalName : undefined,
      talentName: !isIncoming ? req.talentName : undefined,
      contactName,
      contactEmail,
      contactMobile,
      location: req.location || "Mumbai, India",
      datesDisplay: formattedDate,
      days: 1,
      bookedOn: bookedOnStr,
      rawStartDate: rawDate,
      rawEndDate: rawDate,
      payment: paymentStr,
      paymentNum,
      status: displayStatus,
      rawStatus: req.status,
      image: getFullImageUrl(rawPhoto),
      isIncoming,
      fullRequest: req,
    };
  }, []);

  // Merge normalized requests
  const allBookings = useMemo(() => {
    const incList = (incomingRequests || []).map((r) => normalizeRequest(r, true));
    const sentList = (sentRequests || []).map((r) => normalizeRequest(r, false));
    return [...incList, ...sentList];
  }, [incomingRequests, sentRequests, normalizeRequest]);

  // Dynamic statistics calculated directly from real database items
  const stats = useMemo(() => {
    let confirmed = 0;
    let confirmedAmount = 0;
    let pending = 0;
    let pendingAmount = 0;
    let completed = 0;
    let completedAmount = 0;
    let cancelled = 0;
    let cancelledAmount = 0;

    const monthlyMap = {};

    allBookings.forEach((b) => {
      const monthStr = b.rawStartDate ? new Date(b.rawStartDate).toLocaleString("en-IN", { month: "short", year: "numeric" }) : "Recent";
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { paid: 0, pending: 0, cancelled: 0 };
      }

      if (b.status === "Confirmed") {
        confirmed++;
        confirmedAmount += b.paymentNum;
        monthlyMap[monthStr].paid += b.paymentNum;
      } else if (b.status === "Pending") {
        pending++;
        pendingAmount += b.paymentNum;
        monthlyMap[monthStr].pending += b.paymentNum;
      } else if (b.status === "Completed") {
        completed++;
        completedAmount += b.paymentNum;
        monthlyMap[monthStr].paid += b.paymentNum;
      } else if (b.status === "Cancelled") {
        cancelled++;
        cancelledAmount += b.paymentNum;
        monthlyMap[monthStr].cancelled += b.paymentNum;
      }
    });

    const monthlyBreakdown = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      paid: `₹ ${data.paid.toLocaleString("en-IN")}`,
      pending: `₹ ${data.pending.toLocaleString("en-IN")}`,
      cancelled: `₹ ${data.cancelled.toLocaleString("en-IN")}`,
    }));

    return {
      total: allBookings.length,
      confirmed,
      confirmedAmount: `₹ ${confirmedAmount.toLocaleString("en-IN")}`,
      pending,
      pendingAmount: `₹ ${pendingAmount.toLocaleString("en-IN")}`,
      completed,
      completedAmount: `₹ ${completedAmount.toLocaleString("en-IN")}`,
      cancelled,
      cancelledAmount: `₹ ${cancelledAmount.toLocaleString("en-IN")}`,
      rawPaidAmount: confirmedAmount + completedAmount,
      rawPendingAmount: pendingAmount,
      rawCancelledAmount: cancelledAmount,
      monthlyBreakdown,
    };
  }, [allBookings]);

  // Tab counts
  const counts = useMemo(() => ({
    all: allBookings.length,
    confirmed: stats.confirmed,
    pending: stats.pending,
    completed: stats.completed,
    cancelled: stats.cancelled,
  }), [allBookings.length, stats]);

  return (
    <AppLayout
      pageTitle="Bookings"
      subTitle="Manage all your confirmed bookings and shoot requests."
      searchPlaceholder="Search bookings, projects..."
      showMessages={true}
    >
      <div className="bookings-page">
        <div style={{ padding: "0" }}>
          <div className="bookings-two-col">
            
            {/* ── Left Column ─────────────── */}
            <div className="bookings-left">
              {/* Tabs Switcher with live database counts */}
              <BookingsTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                counts={counts}
              />

              {/* Stats Cards computed from live database */}
              <BookingsStats stats={stats} />

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

              {/* Dynamic Database Bookings List */}
              <BookingsList
                bookings={allBookings}
                incomingRequests={incomingRequests}
                isLoading={isLoading}
                onUpdateStatus={handleUpdateStatus}
                onRefresh={loadBookings}
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
              <EarningsSummaryWidget 
                paidAmount={stats.rawPaidAmount}
                pendingAmount={stats.rawPendingAmount}
                cancelledAmount={stats.rawCancelledAmount}
                monthlyBreakdown={stats.monthlyBreakdown}
              />
              <BookingCalendarWidget bookings={allBookings} />
              <UpcomingBookingsWidget bookings={allBookings} />
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
