import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Search,
  RefreshCw,
  Users,
  Send,
  Sparkles,
  Filter,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { bookingsApi } from "../../features/bms/api/bookings/bookingsApi";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";
import { showSuccess, showError, confirmDelete } from "../../shared/utils/alert";
import { Badge, Button } from "../../shared/common";

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
];

function resolvePhotoUrl(photoUrl, idx = 0) {
  if (!photoUrl) return DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length];
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) return photoUrl;
  return getFullImageUrl(photoUrl);
}

export default function ClientBookingRequests({
  onScoutModels,
  onViewTalentDetails,
  theme = "pink"
}) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch sent requests directly from backend database
  const fetchSentRequests = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await bookingsApi.getSentBookingRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load sent booking requests:", err);
      showError("Load Error", "Unable to load sent audition requests from server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSentRequests();

    const handleCreated = () => fetchSentRequests();
    window.addEventListener("bms_booking_request_created", handleCreated);
    return () => {
      window.removeEventListener("bms_booking_request_created", handleCreated);
    };
  }, []);

  // Handle Cancel Request
  const handleCancelRequest = async (requestId, talentName, projectTitle) => {
    const isConfirmed = await confirmDelete(
      "Cancel Audition Request?",
      `Are you sure you want to cancel the audition request sent to ${talentName || "this model"} for "${projectTitle}"?`
    );

    if (!isConfirmed) return;

    setCancellingId(requestId);
    try {
      await bookingsApi.updateBookingRequestStatus(requestId, "CANCELLED");
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "CANCELLED" } : r))
      );
      showSuccess(
        "Request Cancelled",
        `Your audition call for "${projectTitle}" has been cancelled.`
      );
    } catch (err) {
      console.error("Failed to cancel request:", err);
      showError("Action Failed", err.message || "Failed to cancel request on server.");
    } finally {
      setCancellingId(null);
    }
  };

  // Metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const acceptedCount = requests.filter((r) => r.status === "ACCEPTED").length;
  const declinedCount = requests.filter((r) => r.status === "DECLINED").length;
  const cancelledCount = requests.filter((r) => r.status === "CANCELLED").length;

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Status Filter
      if (statusFilter !== "ALL" && req.status !== statusFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const talentName = (req.talentName || "").toLowerCase();
        const projectTitle = (req.projectTitle || "").toLowerCase();
        const location = (req.location || "").toLowerCase();
        const projectType = (req.projectType || "").toLowerCase();

        return (
          talentName.includes(query) ||
          projectTitle.includes(query) ||
          location.includes(query) ||
          projectType.includes(query)
        );
      }

      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. HEADER BANNER WITH REFRESH & SCOUT ACTIONS              */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-50 text-pink-700">
              <Calendar size={20} />
            </span>
            <h2 className="text-xl font-black text-slate-900 m-0">
              Audition Calls & Direct Booking Requests
            </h2>
          </div>
          <p className="text-xs text-slate-500 m-0 mt-1 max-w-xl leading-relaxed">
            Track real-time status of all audition invites, lookbook shoot bookings, and direct requests sent to models.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchSentRequests(true)}
            disabled={isRefreshing || isLoading}
            className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer disabled:opacity-50"
            title="Refresh status from server"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-pink-600" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {onScoutModels && (
            <button
              type="button"
              onClick={onScoutModels}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-pink-500/20 flex items-center gap-2 cursor-pointer transition"
            >
              <Send size={14} />
              <span>+ Send New Audition Call</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. KPI METRIC SUMMARY CARDS                                 */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Sent */}
        <div 
          onClick={() => setStatusFilter("ALL")}
          className={`p-4 rounded-2xl bg-white border transition cursor-pointer ${
            statusFilter === "ALL" ? "border-pink-500 ring-2 ring-pink-500/10 shadow-sm" : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Sent</span>
            <Users size={16} className="text-pink-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">All audition requests</span>
        </div>

        {/* Pending Response */}
        <div 
          onClick={() => setStatusFilter("PENDING")}
          className={`p-4 rounded-2xl bg-white border transition cursor-pointer ${
            statusFilter === "PENDING" ? "border-amber-500 ring-2 ring-amber-500/10 shadow-sm" : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
            <span>Awaiting Reply</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{pendingCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">Under review by model</span>
        </div>

        {/* Confirmed / Accepted */}
        <div 
          onClick={() => setStatusFilter("ACCEPTED")}
          className={`p-4 rounded-2xl bg-white border transition cursor-pointer ${
            statusFilter === "ACCEPTED" ? "border-emerald-500 ring-2 ring-emerald-500/10 shadow-sm" : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
            <span>Accepted</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{acceptedCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">Confirmed for shoot</span>
        </div>

        {/* Declined / Cancelled */}
        <div 
          onClick={() => setStatusFilter("DECLINED")}
          className={`p-4 rounded-2xl bg-white border transition cursor-pointer ${
            statusFilter === "DECLINED" ? "border-rose-500 ring-2 ring-rose-500/10 shadow-sm" : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 text-xs font-bold">
            <span>Declined</span>
            <XCircle size={16} className="text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">{declinedCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">{cancelledCount} cancelled</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. SEARCH & STATUS FILTER BUTTONS                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by model, project, city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: "ALL", label: `All (${totalCount})` },
            { id: "PENDING", label: `Awaiting Reply (${pendingCount})` },
            { id: "ACCEPTED", label: `Accepted (${acceptedCount})` },
            { id: "DECLINED", label: `Declined (${declinedCount})` },
            { id: "CANCELLED", label: `Cancelled (${cancelledCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. REQUESTS LIST / CARDS                                    */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <RefreshCw size={24} className="animate-spin text-pink-600 mx-auto" />
          <p className="text-xs font-bold text-slate-600 m-0">Loading audition requests from database...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
            <Calendar size={28} />
          </div>
          <h3 className="text-base font-black text-slate-900 m-0">
            {statusFilter === "ALL" ? "No Audition Calls Sent Yet" : `No ${statusFilter.toLowerCase()} requests found`}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto m-0 leading-relaxed">
            {statusFilter === "ALL"
              ? "When you scout models from the directory and click 'Direct Invite', your audition calls and shoot requests will be tracked here in real-time."
              : "Try changing your search query or selecting a different status filter above."}
          </p>
          {onScoutModels && (
            <button
              type="button"
              onClick={onScoutModels}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5 cursor-pointer mt-2"
            >
              <Send size={14} />
              <span>Scout Models & Faces</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req, idx) => {
            const avatar = resolvePhotoUrl(req.talentPhotoUrl, idx);
            const isPending = req.status === "PENDING";
            const isAccepted = req.status === "ACCEPTED";
            const isDeclined = req.status === "DECLINED";
            const isCancelled = req.status === "CANCELLED";

            return (
              <div
                key={req.id}
                className={`p-5 rounded-3xl bg-white border shadow-xs transition-all hover:shadow-md ${
                  isAccepted
                    ? "border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/20"
                    : isPending
                    ? "border-amber-200/80 bg-gradient-to-br from-white to-amber-50/20"
                    : isDeclined
                    ? "border-rose-200/80 bg-gradient-to-br from-white to-rose-50/20"
                    : "border-slate-200/80"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* Left: Model Identity & Project Heading */}
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={avatar}
                      alt={req.talentName || "Model"}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                      onError={(e) => {
                        e.target.src = DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length];
                      }}
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900 m-0 truncate">
                          {req.talentName || `Model #${req.talentId}`}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold border border-pink-100">
                          <CheckCircle2 size={10} className="text-pink-600" /> Verified Model
                        </span>
                        <span className="text-xs text-slate-400 font-normal">
                          • {req.talentEmail}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="text-sm font-bold text-slate-800">
                          {req.projectTitle}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                          {req.projectType || "Commercial Campaign"}
                        </span>
                      </div>

                      {/* Shoot Terms: Date, Rate, Location */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar size={13} className="text-pink-600" />
                          <span>Shoot Date: {req.bookingDate}</span>
                        </div>
                        {req.offeredRate && (
                          <div className="flex items-center gap-1 font-semibold text-emerald-700">
                            <IndianRupee size={13} className="text-emerald-600" />
                            <span>Offered: {req.offeredRate}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin size={13} className="text-slate-400" />
                          <span>{req.location || "Mumbai Studio"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <Clock size={12} />
                          <span>Sent {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently"}</span>
                        </div>
                      </div>

                      {/* Attached Message Note */}
                      {req.message && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                          <MessageSquare size={13} className="text-slate-400 shrink-0 mt-0.5" />
                          <span className="italic leading-relaxed">"{req.message}"</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Live Status Badge & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    
                    {/* Status Pill */}
                    <div>
                      {isPending && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>⏳ Awaiting Model Response</span>
                        </div>
                      )}

                      {isAccepted && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black shadow-2xs">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>✅ Confirmed & Accepted</span>
                        </div>
                      )}

                      {isDeclined && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black shadow-2xs">
                          <XCircle size={14} className="text-rose-600" />
                          <span>❌ Declined by Model</span>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
                          <span>Request Cancelled</span>
                        </div>
                      )}
                    </div>

                    {/* Explanatory subtitle */}
                    <div className="text-[11px] text-slate-500 text-left lg:text-right max-w-xs">
                      {isPending && "Model has received your invite and schedule. You will be alerted when confirmed."}
                      {isAccepted && "Artist confirmed availability! Shoot date is locked in your commercial schedule."}
                      {isDeclined && "Artist is unavailable on this date. You can invite an alternate candidate."}
                      {isCancelled && "This audition booking was cancelled."}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button
                          type="button"
                          disabled={cancellingId === req.id}
                          onClick={() => handleCancelRequest(req.id, req.talentName, req.projectTitle)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          <span>{cancellingId === req.id ? "Cancelling..." : "Cancel Request"}</span>
                        </button>
                      )}

                      {isAccepted && (
                        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
                          <UserCheck size={13} />
                          <span>Call Sheet Ready</span>
                        </span>
                      )}

                      {isDeclined && onScoutModels && (
                        <button
                          type="button"
                          onClick={onScoutModels}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Scout Alternative &rarr;</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
