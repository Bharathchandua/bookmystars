import { useState, useEffect } from "react";
import BookingCardItem from "./BookingCardItem.jsx";
import { 
  Inbox, Calendar, CheckCircle2, XCircle, Clock, 
  MapPin, IndianRupee, MessageSquare, Building2, 
  Send, Loader2, Sparkles, UserCheck 
} from "lucide-react";
import { getIncomingBookingRequests, updateBookingRequestStatus } from "../../features/bms/api/bookings/bookingsApi";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";
import { showSuccess, showError } from "../../shared/utils/alert";

const BOOKINGS_DATA = [
  {
    id: 1,
    category: "Web Series",
    title: "Dil Ki Baat - Season 2",
    role: "Arjun (Lead)",
    company: "DreamWorks Entertainment",
    location: "Mumbai, Maharashtra",
    datesDisplay: "25 May – 15 Jul 2024",
    days: 52,
    bookedOn: "10 May 2024",
    rawStartDate: "2024-05-25",
    rawEndDate: "2024-07-15",
    payment: "₹ 8,00,000",
    paymentNum: 800000,
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=200&fit=crop&q=80",
    hoverColor:  "rgba(109, 40, 217, 0.14)",
    hoverBorder: "#c4b5fd",
  },
  {
    id: 2,
    category: "Feature Film",
    title: "Shadows of Truth",
    role: "Kabir (Lead)",
    company: "Silver Screen Productions",
    location: "Mumbai, Maharashtra",
    datesDisplay: "20 May – 10 Jun 2024",
    days: 22,
    bookedOn: "5 May 2024",
    rawStartDate: "2024-05-20",
    rawEndDate: "2024-06-10",
    payment: "₹ 5,00,000",
    paymentNum: 500000,
    status: "Pending",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=200&fit=crop&q=80",
    hoverColor:  "rgba(190, 24,  93, 0.13)",
    hoverBorder: "#f9a8d4",
  },
  {
    id: 3,
    category: "Web Film",
    title: "The Corporate Chronicles",
    role: "Raghav (Lead)",
    company: "Sphere Entertainment",
    location: "Bangalore, Karnataka",
    datesDisplay: "30 May – 30 Aug 2024",
    days: 93,
    bookedOn: "1 May 2024",
    rawStartDate: "2024-05-30",
    rawEndDate: "2024-08-30",
    payment: "₹ 7,50,000",
    paymentNum: 750000,
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=200&fit=crop&q=80",
    hoverColor:  "rgba(15, 118, 110, 0.14)",
    hoverBorder: "#5eead4",
  },
  {
    id: 4,
    category: "TV Serial",
    title: "Naya Safar",
    role: "Veer (Lead)",
    company: "Bright TV Network",
    location: "Mumbai, Maharashtra",
    datesDisplay: "22 May – 22 Nov 2024",
    days: 185,
    bookedOn: "22 Apr 2024",
    rawStartDate: "2024-05-22",
    rawEndDate: "2024-11-22",
    payment: "₹ 4,50,000",
    paymentNum: 450000,
    status: "Completed",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&q=80",
    hoverColor:  "rgba(3, 105, 161, 0.13)",
    hoverBorder: "#7dd3fc",
  },
  {
    id: 5,
    category: "Commercial",
    title: "Oceanic Perfume – TVC",
    role: "Brand Ambassador",
    company: "Oceanic Brands",
    datesDisplay: "18 May 2024",
    days: 1,
    bookedOn: "15 Apr 2024",
    rawStartDate: "2024-05-18",
    rawEndDate: "2024-05-18",
    payment: "₹ 1,25,000",
    paymentNum: 125000,
    status: "Completed",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=200&fit=crop&q=80",
    location: "Mumbai, Maharashtra",
    hoverColor:  "rgba(180, 83,   9, 0.13)",
    hoverBorder: "#fcd34d",
  },
  {
    id: 6,
    category: "Brand Shoot",
    title: "Vogue Clothing Shoot",
    role: "Featured Model",
    company: "Vogue Ads",
    datesDisplay: "10 Jun – 12 Jun 2024",
    days: 3,
    bookedOn: "28 May 2024",
    rawStartDate: "2024-06-10",
    rawEndDate: "2024-06-12",
    payment: "₹ 1,80,000",
    paymentNum: 180000,
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=200&fit=crop&q=80",
    location: "Goa, India",
    hoverColor:  "rgba(217, 119,   6, 0.13)",
    hoverBorder: "#fde68a",
  },
];

export default function BookingsList({
  activeTab,
  statusFilter,
  typeFilter,
  fromDate,
  toDate,
  sortBy,
  onOpenDetail,
}) {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchIncoming = async () => {
    setIsLoadingRequests(true);
    try {
      const data = await getIncomingBookingRequests();
      setIncomingRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load incoming booking requests:", err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchIncoming();
  }, []);

  const handleUpdateStatus = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    setStatusMessage(null);
    try {
      await updateBookingRequestStatus(requestId, newStatus);
      setIncomingRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
      );
      if (newStatus === "ACCEPTED") {
        showSuccess("Booking Accepted! 🎉", "Date has been reserved on your calendar.");
      } else {
        showSuccess("Booking Declined", "The booking request has been declined.");
      }
    } catch (err) {
      showError("Status Update Failed", err.message || "Failed to update booking status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter bookings
  const filtered = BOOKINGS_DATA.filter((item) => {
    if (activeTab === "Confirmed" && item.status !== "Confirmed") return false;
    if (activeTab === "Pending"   && item.status !== "Pending")   return false;
    if (activeTab === "Completed" && item.status !== "Completed") return false;

    if (statusFilter && statusFilter !== "All Status" && item.status !== statusFilter) {
      return false;
    }
    if (typeFilter && typeFilter !== "All Types" && item.category !== typeFilter) {
      return false;
    }
    if (fromDate && item.rawStartDate < fromDate) {
      return false;
    }
    if (toDate && item.rawEndDate > toDate) {
      return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === "Newest First") {
      return new Date(b.rawStartDate) - new Date(a.rawStartDate);
    } else if (sortBy === "Oldest First") {
      return new Date(a.rawStartDate) - new Date(b.rawStartDate);
    } else if (sortBy === "Payment High-Low") {
      return b.paymentNum - a.paymentNum;
    }
    return 0;
  });

  return (
    <div>
      {/* Status banner */}
      {statusMessage && (
        <div style={{ padding: "12px 16px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={16} /> {statusMessage}
        </div>
      )}

      {/* ── Live Incoming Requests from Professionals ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={17} style={{ color: "#4f46e5" }} /> 
            Incoming Shoot & Booking Requests ({incomingRequests.length})
          </h3>
          <button 
            type="button" 
            onClick={fetchIncoming}
            style={{ background: "none", border: "none", color: "#4f46e5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>

        {isLoadingRequests ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <Loader2 size={24} className="animate-spin" style={{ color: "#4f46e5", margin: "0 auto 6px auto" }} />
            <span style={{ fontSize: 12 }}>Checking for requests from casting directors...</span>
          </div>
        ) : incomingRequests.length === 0 ? (
          <div style={{ padding: "18px 20px", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1", color: "#64748b", fontSize: 13 }}>
            No incoming booking requests yet. When casting directors or agencies book you on an available date, their requests will appear here.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  background: "#ffffff",
                  border: req.status === "PENDING" ? "1.5px solid #6366f1" : "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "18px 20px",
                  boxShadow: req.status === "PENDING" ? "0 4px 12px rgba(99, 102, 241, 0.08)" : "0 2px 4px rgba(0,0,0,0.03)",
                  position: "relative"
                }}
              >
                {/* Top Request Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, background: "#e0e7ff", color: "#3730a3", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>
                        {req.projectType || "Shoot"}
                      </span>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                        {req.projectTitle}
                      </h4>
                    </div>

                    <div style={{ marginTop: 4, fontSize: 13, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                      <Building2 size={13} style={{ color: "#64748b" }} />
                      From: <strong style={{ color: "#1e293b" }}>{req.professionalCompany || req.professionalName}</strong>
                      {req.professionalEmail && <span style={{ color: "#64748b" }}>({req.professionalEmail})</span>}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {req.status === "PENDING" && (
                      <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Clock size={13} /> Pending Response
                      </span>
                    )}
                    {req.status === "ACCEPTED" && (
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={13} /> Accepted & Scheduled
                      </span>
                    )}
                    {req.status === "DECLINED" && (
                      <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <XCircle size={13} /> Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Date & Rate & Location Strip */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, fontSize: 13, color: "#334155", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 700, color: "#0f172a" }}>
                    <Calendar size={14} style={{ color: "#4f46e5" }} />
                    Shoot Date: {req.bookingDate}
                  </div>
                  {req.offeredRate && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: "#16a34a" }}>
                      <IndianRupee size={14} />
                      Offered: {req.offeredRate}
                    </div>
                  )}
                  {req.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b" }}>
                      <MapPin size={14} />
                      {req.location}
                    </div>
                  )}
                </div>

                {/* Message */}
                {req.message && (
                  <div style={{ fontSize: 13, color: "#334155", background: "#fff", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #6366f1", marginBottom: 14 }}>
                    <span style={{ fontWeight: 700, color: "#475569" }}>Shoot Details: </span>
                    {req.message}
                  </div>
                )}

                {/* Action Buttons for Pending */}
                {req.status === "PENDING" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() => handleUpdateStatus(req.id, "DECLINED")}
                      style={{
                        padding: "7px 16px",
                        borderRadius: 8,
                        border: "1.5px solid #cbd5e1",
                        background: "#fff",
                        color: "#64748b",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <XCircle size={14} /> Decline
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() => handleUpdateStatus(req.id, "ACCEPTED")}
                      style={{
                        padding: "7px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)"
                      }}
                    >
                      {updatingId === req.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      Accept Booking & Confirm Date
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Standard Confirmed Bookings Section ── */}
      <h3 style={{ margin: "0 0 14px 0", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
        All Bookings & History ({filtered.length})
      </h3>

      {filtered.length === 0 ? (
        <div className="bookings-empty-state">
          <Inbox size={48} />
          <h3>No Bookings Found</h3>
          <p>Try clearing your filters or changing your search criteria.</p>
        </div>
      ) : (
        <div className="bookings-list-container">
          {filtered.map((booking) => (
            <BookingCardItem
              key={booking.id}
              booking={booking}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { BOOKINGS_DATA };
