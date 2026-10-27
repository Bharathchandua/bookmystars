import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Filter,
  ShieldCheck,
  ChevronRight,
  UserCheck
} from "lucide-react";
import {
  getAdminPartners,
  verifyAdminPartner,
  rejectAdminPartner,
  getPendingPartnersCount
} from "../../features/bms/api/partners/partnerApi";
import { showSuccess, showError } from "../../shared/utils/alert";

const CATEGORY_LABELS = {
  DANCE_ACADEMY: "Dance Academy",
  ACTING_SCHOOL: "Acting & Drama School",
  MUSIC_STUDIO: "Music & Vocal Studio",
  MODELING_AGENCY: "Modeling Agency",
  PRODUCTION_HOUSE: "Production House",
  CASTING_AGENCY: "Casting Agency",
  OTHER: "Creative Enterprise"
};

const CATEGORY_COLORS = {
  DANCE_ACADEMY: "bg-purple-50 text-purple-700 border-purple-200",
  ACTING_SCHOOL: "bg-pink-50 text-pink-700 border-pink-200",
  MUSIC_STUDIO: "bg-indigo-50 text-indigo-700 border-indigo-200",
  MODELING_AGENCY: "bg-amber-50 text-amber-700 border-amber-200",
  PRODUCTION_HOUSE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CASTING_AGENCY: "bg-blue-50 text-blue-700 border-blue-200",
  OTHER: "bg-slate-50 text-slate-700 border-slate-200"
};

export default function PartnerVerificationDesk() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING | APPROVED | REJECTED | ALL
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectModalPartner, setRejectModalPartner] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await getAdminPartners();
      setPartners(data || []);
    } catch (err) {
      console.error("Failed to load partner applications:", err);
      showError("Fetch Error", "Unable to load partner verification records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();

    // Listen for events requesting open or refresh
    const handlePartnerUpdated = () => fetchPartners();
    window.addEventListener("bms_partner_updated", handlePartnerUpdated);
    window.addEventListener("bms_partner_registered", handlePartnerUpdated);
    return () => {
      window.removeEventListener("bms_partner_updated", handlePartnerUpdated);
      window.removeEventListener("bms_partner_registered", handlePartnerUpdated);
    };
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const pending = partners.filter(p => !p.isApproved && p.verificationStatus !== "REJECTED").length;
    const approved = partners.filter(p => p.isApproved).length;
    const rejected = partners.filter(p => p.verificationStatus === "REJECTED").length;
    return {
      pending,
      approved,
      rejected,
      total: partners.length
    };
  }, [partners]);

  // Filtered list
  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      // Tab filter
      if (activeTab === "PENDING" && (partner.isApproved || partner.verificationStatus === "REJECTED")) return false;
      if (activeTab === "APPROVED" && !partner.isApproved) return false;
      if (activeTab === "REJECTED" && partner.verificationStatus !== "REJECTED") return false;

      // Category filter
      if (categoryFilter !== "ALL" && partner.partnerCategory !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (partner.fullName || "").toLowerCase().includes(q);
        const emailMatch = (partner.email || "").toLowerCase().includes(q);
        const phoneMatch = (partner.mobileNumber || "").toLowerCase().includes(q);
        const cityMatch = (partner.partnerAddress || partner.location || "").toLowerCase().includes(q);
        const reqMatch = (partner.partnerRequirements || "").toLowerCase().includes(q);
        return nameMatch || emailMatch || phoneMatch || cityMatch || reqMatch;
      }

      return true;
    });
  }, [partners, activeTab, categoryFilter, searchQuery]);

  // Approve action
  const handleApprove = async (partner) => {
    try {
      setActionLoadingId(partner.id);
      await verifyAdminPartner(partner.id);
      showSuccess(
        "Partner Verified & Approved",
        `${partner.fullName} is now verified. The partner can immediately sign in to Book My Stars.`
      );
      // Dispatch live sync event so Super Admin Bell badge count updates immediately
      window.dispatchEvent(new CustomEvent("bms_partner_updated", { detail: { id: partner.id, status: "APPROVED" } }));
      await fetchPartners();
    } catch (err) {
      showError("Approval Failed", err.message || "Failed to approve partner.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open rejection modal
  const handleOpenReject = (partner) => {
    setRejectModalPartner(partner);
    setRejectionReason("Incomplete business credentials or does not meet platform criteria.");
  };

  // Submit rejection
  const handleConfirmReject = async () => {
    if (!rejectModalPartner) return;
    try {
      setActionLoadingId(rejectModalPartner.id);
      await rejectAdminPartner(rejectModalPartner.id, rejectionReason.trim());
      showSuccess(
        "Application Rejected",
        `Application for ${rejectModalPartner.fullName} has been marked as rejected.`
      );
      window.dispatchEvent(new CustomEvent("bms_partner_updated", { detail: { id: rejectModalPartner.id, status: "REJECTED" } }));
      setRejectModalPartner(null);
      await fetchPartners();
    } catch (err) {
      showError("Rejection Failed", err.message || "Failed to reject partner.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl border border-white/20 shadow-inner">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black m-0 text-white tracking-tight">
                Partner & Academy Verification Desk
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40">
                Super Admin Gatekeeper
              </span>
            </div>
            <p className="text-xs text-slate-300 m-0 mt-1 max-w-2xl leading-relaxed">
              Verify academies, studios, and agencies joining Book My Stars. Review their business requirements, auditions, and ads campaigns before granting platform login access.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchPartners}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 cursor-pointer shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 2. KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div 
          onClick={() => setActiveTab("PENDING")}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-xs hover:shadow-md ${
            activeTab === "PENDING" ? "border-amber-400 ring-2 ring-amber-100" : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
              Pending Review
            </span>
            {stats.pending > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">
            {stats.pending}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            {stats.pending === 1 ? "1 academy waiting for verification" : `${stats.pending} academies waiting for verification`}
          </div>
        </div>

        {/* Approved Card */}
        <div 
          onClick={() => setActiveTab("APPROVED")}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-xs hover:shadow-md ${
            activeTab === "APPROVED" ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200"
          }`}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
            Verified Partners
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {stats.approved}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Active verified academies & studios
          </div>
        </div>

        {/* Rejected Card */}
        <div 
          onClick={() => setActiveTab("REJECTED")}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-xs hover:shadow-md ${
            activeTab === "REJECTED" ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200"
          }`}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500">
            Rejected Applications
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">
            {stats.rejected}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Denied platform credentials
          </div>
        </div>

        {/* Total Card */}
        <div 
          onClick={() => setActiveTab("ALL")}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-xs hover:shadow-md ${
            activeTab === "ALL" ? "border-slate-900 ring-2 ring-slate-100" : "border-slate-200"
          }`}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Total Applications
          </div>
          <div className="text-3xl font-black text-slate-800 mt-2">
            {stats.total}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            All registered partner organizations
          </div>
        </div>
      </div>

      {/* 3. Controls Bar: Tabs, Search & Category Filter */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          {[
            { id: "PENDING", label: `Pending (${stats.pending})`, color: "text-amber-700 font-black" },
            { id: "APPROVED", label: `Approved (${stats.approved})`, color: "text-emerald-700 font-black" },
            { id: "REJECTED", label: `Rejected (${stats.rejected})`, color: "text-rose-700 font-black" },
            { id: "ALL", label: `All (${stats.total})`, color: "text-slate-800 font-black" }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition cursor-pointer font-bold ${
                activeTab === tab.id
                  ? `bg-white shadow-xs ${tab.color}`
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-xl justify-end">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search academy name, contact, city, requirements..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-400 transition"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-400 font-semibold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="DANCE_ACADEMY">Dance Academy</option>
            <option value="ACTING_SCHOOL">Acting School</option>
            <option value="MUSIC_STUDIO">Music Studio</option>
            <option value="MODELING_AGENCY">Modeling Agency</option>
            <option value="PRODUCTION_HOUSE">Production House</option>
            <option value="CASTING_AGENCY">Casting Agency</option>
            <option value="OTHER">Other Enterprise</option>
          </select>
        </div>
      </div>

      {/* 4. Partner Records List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw size={28} className="animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Loading partner applications...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Building2 size={36} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-800">No Partner Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {activeTab === "PENDING"
              ? "All partner applications have been reviewed. There are currently no pending verification requests."
              : "No partner applications matched your selected filters or search query."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPartners.map((partner) => {
            const isPending = !partner.isApproved && partner.verificationStatus !== "REJECTED";
            const isApproved = partner.isApproved;
            const isRejected = partner.verificationStatus === "REJECTED";
            const catColor = CATEGORY_COLORS[partner.partnerCategory] || CATEGORY_COLORS.OTHER;
            const catLabel = CATEGORY_LABELS[partner.partnerCategory] || partner.partnerCategory || "Partner";

            return (
              <div
                key={partner.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                {/* Top Row: Business Name, Category & Status Badge */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-black text-slate-900 m-0">
                        {partner.fullName}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catColor}`}>
                        {catLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {partner.partnerAddress || partner.location || "Location not specified"}
                      </span>
                      {partner.partnerWebsite && (
                        <a
                          href={partner.partnerWebsite.startsWith("http") ? partner.partnerWebsite : `https://${partner.partnerWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold"
                        >
                          <ExternalLink size={12} />
                          {partner.partnerWebsite.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        Applied: {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-300">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Pending Verification
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300">
                        <CheckCircle2 size={13} />
                        Verified Partner
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-300">
                        <XCircle size={13} />
                        Rejected Application
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Box: Contact Info & Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  {/* Contact Person Details */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Authorized Representative
                    </span>
                    <div className="font-bold text-slate-800">
                      {partner.fullName}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail size={12} className="text-slate-400" />
                      <a href={`mailto:${partner.email}`} className="hover:text-purple-600 font-mono">
                        {partner.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone size={12} className="text-slate-400" />
                      <a href={`tel:${partner.mobileNumber}`} className="hover:text-purple-600 font-mono">
                        {partner.mobileNumber}
                      </a>
                    </div>
                  </div>

                  {/* Requirements & Business Goals */}
                  <div className="md:col-span-2 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <FileText size={12} className="text-slate-400" />
                      Business Requirements & Partnership Scope
                    </span>
                    <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed m-0 text-xs font-normal">
                      {partner.partnerRequirements || "No specific requirements provided at registration."}
                    </p>
                  </div>
                </div>

                {/* Rejection notice if present */}
                {isRejected && partner.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Rejection Note: </span>
                      <span>{partner.rejectionReason}</span>
                    </div>
                  </div>
                )}

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold">
                    Partner Account ID: <span className="font-mono text-slate-600">PTR-{partner.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenReject(partner)}
                          disabled={actionLoadingId === partner.id}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle size={14} />
                          <span>Reject Application</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(partner)}
                          disabled={actionLoadingId === partner.id}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          <span>{actionLoadingId === partner.id ? "Approving..." : "Verify & Approve"}</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          <UserCheck size={14} />
                          Platform Login Active
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenReject(partner)}
                          className="px-3 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      </div>
                    )}

                    {isRejected && (
                      <button
                        type="button"
                        onClick={() => handleApprove(partner)}
                        disabled={actionLoadingId === partner.id}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} />
                        <span>Re-Verify & Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalPartner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <XCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 m-0">
                  Reject Partner Application
                </h3>
                <p className="text-xs text-slate-500 m-0">
                  {rejectModalPartner.fullName}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="State the reason (e.g. Incomplete credentials, invalid registration details...)"
                className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:border-rose-400"
              />
              <p className="text-[11px] text-slate-400">
                This note will be logged and displayed to the partner if they attempt to log in.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalPartner(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoadingId === rejectModalPartner.id}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
              >
                {actionLoadingId === rejectModalPartner.id ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
