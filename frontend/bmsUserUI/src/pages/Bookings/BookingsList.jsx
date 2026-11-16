import { useState } from "react";
import BookingCardItem from "./BookingCardItem.jsx";
import { 
  Inbox, Calendar, CheckCircle2, XCircle, Clock, 
  MapPin, IndianRupee, Building2, Loader2, Sparkles 
} from "lucide-react";

export default function BookingsList({
  bookings = [],
  incomingRequests = [],
  isLoading = false,
  onUpdateStatus,
  onRefresh,
  activeTab = "All Bookings",
  statusFilter = "All Status",
  typeFilter = "All Types",
  fromDate = "",
  toDate = "",
  sortBy = "Newest First",
  onOpenDetail,
}) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleAction = async (requestId, newStatus) => {
    if (!onUpdateStatus) return;
    setUpdatingId(requestId);
    try {
      await onUpdateStatus(requestId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter pending incoming requests to highlight in actionable section
  const pendingIncoming = (incomingRequests || []).filter(
    (req) => req.status === "PENDING"
  );

  // Filter bookings based on active tab and filter criteria
  const filtered = (bookings || []).filter((item) => {
    if (activeTab === "Confirmed" && item.status !== "Confirmed") return false;
    if (activeTab === "Pending"   && item.status !== "Pending")   return false;
    if (activeTab === "Completed" && item.status !== "Completed") return false;
    if (activeTab === "Cancelled" && item.status !== "Cancelled") return false;

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
      return (b.paymentNum || 0) - (a.paymentNum || 0);
    }
    return 0;
  });

  return (
    <div>
      {/* ── Actionable Incoming Requests (Pending Action) ── */}
      {pendingIncoming.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={17} style={{ color: "#4f46e5" }} /> 
              Action Needed: Incoming Shoot Requests ({pendingIncoming.length})
            </h3>
            {onRefresh && (
              <button 
                type="button" 
                onClick={onRefresh}
                style={{ background: "none", border: "none", color: "#4f46e5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                Refresh
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pendingIncoming.map((req) => (
              <div
                key={req.id}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #6366f1",
                  borderRadius: 14,
                  padding: "18px 20px",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.08)",
                  position: "relative"
                }}
              >
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

                  <div>
                    <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={13} /> Pending Response
                    </span>
                  </div>
                </div>

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

                {req.message && (
                  <div style={{ fontSize: 13, color: "#334155", background: "#fff", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #6366f1", marginBottom: 14 }}>
                    <span style={{ fontWeight: 700, color: "#475569" }}>Shoot Details: </span>
                    {req.message}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    disabled={updatingId === req.id}
                    onClick={() => handleAction(req.id, "DECLINED")}
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
                    onClick={() => handleAction(req.id, "ACCEPTED")}
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Bookings List Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          All Bookings & History ({filtered.length})
        </h3>
        {onRefresh && (
          <button 
            type="button" 
            onClick={onRefresh}
            style={{ background: "none", border: "none", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Refresh List
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0" }}>
          <Loader2 size={28} className="animate-spin" style={{ color: "#4f46e5", margin: "0 auto 8px auto" }} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Loading bookings from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bookings-empty-state" style={{ padding: "48px 24px", textAlign: "center", background: "#ffffff", borderRadius: 16, border: "1.5px dashed #cbd5e1" }}>
          <Inbox size={48} style={{ color: "#94a3b8", margin: "0 auto 12px auto" }} />
          <h3 style={{ margin: "0 0 6px 0", fontSize: 17, fontWeight: 800, color: "#1e293b" }}>No Bookings Found</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Shoot requests and confirmed bookings will appear here. Try adjusting your filters if you're searching for specific dates.
          </p>
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
