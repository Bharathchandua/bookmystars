import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Play,
  Film,
  Camera,
  Trash2,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  Building2,
  Eye,
  Filter,
  UserCheck,
  Image
} from "lucide-react";
import {
  getAdminShowcaseItems,
  approveShowcaseItem,
  rejectShowcaseItem,
  deleteShowcaseItemByAdmin
} from "../../../features/bms/api/showcase/showcaseApi";
import { showSuccess, showError, confirmDelete } from "../../../shared/utils/alert";
import { onLiveSync, emitLiveSync } from "../../../utils/liveSync";

export default function AdminShowcaseModerationView({ entityType = "CLIENT" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING"); // PENDING | APPROVED | REJECTED | ALL
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("ALL"); // ALL | PHOTO | VIDEO

  // Lightbox / Play Modal
  const [activeMediaItem, setActiveMediaItem] = useState(null);

  // Reject Dialog Modal State
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Load items
  const loadItems = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }
    try {
      const data = await getAdminShowcaseItems(entityType, "ALL");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch showcase moderation items:", err);
      if (showSpinner) {
        setItems([]);
      }
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadItems(true);

    const unsub = onLiveSync(
      ["showcase_created", "showcase_updated", "bms_live_sync"],
      () => {
        loadItems(false);
      },
      { pollIntervalMs: 5000, triggerOnFocus: true }
    );

    return () => unsub();
  }, [entityType]);

  // Approve action
  const handleApprove = async (item) => {
    try {
      await approveShowcaseItem(item.id);
      showSuccess(
        "Work Approved & Live!",
        `"${item.title}" by ${item.companyName || item.userFullName} is now live on their public profile.`
      );
      emitLiveSync("showcase_reviewed", { id: item.id, status: "APPROVED", userId: item.userId });
      emitLiveSync("showcase_updated", { id: item.id, status: "APPROVED", userId: item.userId });
      loadItems(false);
    } catch (err) {
      showError("Approval Failed", err.message || "Failed to approve showcase item.");
    }
  };

  // Open Reject Modal
  const handleOpenReject = (item) => {
    setRejectingItem(item);
    setRejectReason("");
  };

  // Submit Reject
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingItem) return;
    if (!rejectReason.trim()) {
      showError("Reason Required", "Please provide feedback explaining why this submission was rejected.");
      return;
    }

    setIsRejecting(true);
    try {
      await rejectShowcaseItem(rejectingItem.id, rejectReason.trim());
      showSuccess("Submission Rejected", `Feedback sent for "${rejectingItem.title}".`);
      emitLiveSync("showcase_reviewed", {
        id: rejectingItem.id,
        status: "REJECTED",
        userId: rejectingItem.userId,
        rejectionReason: rejectReason.trim()
      });
      emitLiveSync("showcase_updated", {
        id: rejectingItem.id,
        status: "REJECTED",
        userId: rejectingItem.userId
      });
      setRejectingItem(null);
      setRejectReason("");
      loadItems(false);
    } catch (err) {
      showError("Rejection Failed", err.message || "Failed to reject showcase item.");
    } finally {
      setIsRejecting(false);
    }
  };

  // Delete action
  const handleDelete = async (item) => {
    const confirmed = await confirmDelete(
      "Permanently Delete Work?",
      `Are you sure you want to permanently delete "${item.title}" from the system?`
    );
    if (!confirmed) return;

    try {
      await deleteShowcaseItemByAdmin(item.id);
      showSuccess("Deleted", `"${item.title}" has been permanently deleted.`);
      emitLiveSync("showcase_updated", { id: item.id, action: "DELETED", userId: item.userId });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      showError("Delete Failed", err.message || "Could not delete showcase item.");
    }
  };

  // Filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && (item.status === "PENDING" || !item.status)) ||
        (statusFilter === "APPROVED" && item.status === "APPROVED") ||
        (statusFilter === "REJECTED" && item.status === "REJECTED");

      const matchesType =
        mediaTypeFilter === "ALL" || item.mediaType === mediaTypeFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.companyName && item.companyName.toLowerCase().includes(q)) ||
        (item.userFullName && item.userFullName.toLowerCase().includes(q)) ||
        (item.userEmail && item.userEmail.toLowerCase().includes(q));

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [items, statusFilter, mediaTypeFilter, searchQuery]);

  const stats = useMemo(() => {
    const pending = items.filter((i) => i.status === "PENDING" || !i.status).length;
    const approved = items.filter((i) => i.status === "APPROVED").length;
    const rejected = items.filter((i) => i.status === "REJECTED").length;
    return { pending, approved, rejected, total: items.length };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* 1. Executive Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
            <Sparkles size={13} />
            <span>{entityType === "CLIENT" ? "Client Brand Campaigns" : "Partner Academy Recitals"}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 m-0">
            Showcase Works Moderation Desk
          </h2>
          <p className="text-xs text-slate-500 m-0">
            Review uploaded photography and commercial video reels before they go live on public dossiers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={loadItems}
            title="Refresh Moderation Queue"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 2. Scorecard Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "PENDING", label: "Awaiting Review", count: stats.pending, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
          { id: "APPROVED", label: "Approved & Live", count: stats.approved, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { id: "REJECTED", label: "Rejected / Revision", count: stats.rejected, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
          { id: "ALL", label: "Total Submissions", count: stats.total, color: "text-slate-800", bg: "bg-slate-50", border: "border-slate-200" }
        ].map((tab) => {
          const isSel = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSel
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-pink-500"
                  : `${tab.bg} ${tab.border} hover:shadow-xs`
              }`}
            >
              <div className={`text-2xl font-black ${isSel ? "text-white" : tab.color}`}>
                {tab.count}
              </div>
              <div className={`text-xs font-bold mt-1 ${isSel ? "text-slate-300" : "text-slate-600"}`}>
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Search & Type Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, company name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Media Type Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 w-full sm:w-auto justify-center">
          {[
            { id: "ALL", label: "All Media" },
            { id: "PHOTO", label: "Photos", icon: Camera },
            { id: "VIDEO", label: "Video Reels", icon: Film }
          ].map((t) => {
            const Icon = t.icon;
            const isSel = mediaTypeFilter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setMediaTypeFilter(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSel
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {Icon && <Icon size={13} />}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Submissions Moderation Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw size={28} className="animate-spin text-pink-500" />
          <p className="text-sm font-semibold">Loading submissions...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Sparkles size={28} />
          </div>
          <h3 className="text-base font-black text-slate-800 mb-1">
            No submissions in this queue
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === "PENDING"
              ? "All submitted showcase works have been reviewed. No items awaiting approval."
              : `No items matching the current filter: ${statusFilter}`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isVideo = item.mediaType === "VIDEO";
            const isApproved = item.status === "APPROVED";
            const isRejected = item.status === "REJECTED";
            const isPending = !isApproved && !isRejected;

            return (
              <div
                key={item.id}
                className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Media Preview */}
                <div
                  onClick={() => setActiveMediaItem(item)}
                  className="relative aspect-16/10 w-full bg-slate-900 cursor-pointer overflow-hidden group"
                >
                  {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center relative">
                      <video
                        src={item.mediaUrl}
                        preload="metadata"
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/15 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={20} className="ml-1 fill-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-950/80 text-white backdrop-blur-md">
                      {isVideo ? <Film size={11} className="text-pink-400" /> : <Camera size={11} className="text-purple-400" />}
                      <span>{isVideo ? "Commercial Video" : "Editorial Photo"}</span>
                    </span>

                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 size={11} />
                        <span>LIVE</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500 text-white shadow-xs animate-pulse">
                        <Clock size={11} />
                        <span>AWAITING APPROVAL</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-600 text-white shadow-xs">
                        <XCircle size={11} />
                        <span>REJECTED</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Company & Details */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1.5">
                    {/* Company Pill */}
                    <div className="flex items-center gap-2">
                      {item.logoUrl ? (
                        <img
                          src={item.logoUrl}
                          alt={item.companyName}
                          className="w-5 h-5 rounded-md object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 text-[10px]">
                          <Building2 size={12} />
                        </div>
                      )}
                      <span className="text-xs font-black text-slate-900 truncate">
                        {item.companyName || item.userFullName || "Brand Partner"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">
                        ({item.userEmail})
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Rejection Note Display */}
                  {isRejected && item.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-[11px] text-rose-800">
                      <strong>Rejection Note:</strong> {item.rejectionReason}
                    </div>
                  )}

                  {/* Moderator Audit Info */}
                  {item.reviewedBy && (
                    <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2">
                      <span>Reviewed by: {item.reviewedBy}</span>
                      <span>{item.reviewedAt ? String(item.reviewedAt).split("T")[0] : ""}</span>
                    </div>
                  )}

                  {/* Admin Moderation Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveMediaItem(item)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                      title="Inspect media fullscreen"
                    >
                      <Eye size={15} />
                    </button>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenReject(item)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={14} />
                            <span>Approve & Go Live</span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => handleOpenReject(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span>Revoke Approval</span>
                        </button>
                      )}

                      {isRejected && (
                        <button
                          type="button"
                          onClick={() => handleApprove(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Re-approve Work</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Permanently"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Reject Feedback Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={20} />
                <h3 className="font-black text-base">Reject Showcase Work</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-600 mb-2">
                  You are rejecting <strong>"{rejectingItem.title}"</strong> submitted by{" "}
                  <strong>{rejectingItem.companyName || rejectingItem.userFullName}</strong>.
                </p>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Feedback / Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Media resolution is too low, contains unauthorized watermarks, or audio synchronization issues..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This note will be visible to the brand in their Showcase Works desk so they can upload a revised version.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRejecting || !rejectReason.trim()}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isRejecting ? "Submitting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Lightbox Fullscreen Preview Modal */}
      {activeMediaItem && (
        <div
          onClick={() => setActiveMediaItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setActiveMediaItem(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-pink-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-center bg-black min-h-[300px] max-h-[75vh]">
              {activeMediaItem.mediaType === "VIDEO" ? (
                <video
                  src={activeMediaItem.mediaUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[75vh] object-contain"
                />
              ) : (
                <img
                  src={activeMediaItem.mediaUrl}
                  alt={activeMediaItem.title}
                  className="w-full max-h-[75vh] object-contain"
                />
              )}
            </div>

            <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white">{activeMediaItem.title}</h3>
                <p className="text-xs text-pink-400 font-semibold">
                  {activeMediaItem.companyName || activeMediaItem.userFullName} ({activeMediaItem.userEmail})
                </p>
                {activeMediaItem.description && (
                  <p className="text-xs text-slate-400 mt-1">{activeMediaItem.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeMediaItem.status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleApprove(activeMediaItem);
                      setActiveMediaItem(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve & Go Live</span>
                  </button>
                )}
                {activeMediaItem.status !== "REJECTED" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenReject(activeMediaItem);
                      setActiveMediaItem(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
